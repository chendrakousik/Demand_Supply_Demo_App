import assert from 'node:assert/strict'
import { spawn, spawnSync } from 'node:child_process'
import { createServer } from 'node:net'
import { once } from 'node:events'
import test from 'node:test'
import { setTimeout } from 'node:timers/promises'
import ExcelJS from 'exceljs'

async function portForTest() {
  const server = createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  return address.port
}

test('production refuses local demo mode', () => {
  const result = spawnSync(process.execPath, ['server/index.ts'], {
    env: { ...process.env, NODE_ENV: 'production', SF_DEMO: '1' }, encoding: 'utf8',
  })
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /Local demo mode is disabled in production/)
})

test('local API enforces roles and processes upload, restriction, allocation and exports', { timeout: 25000 }, async t => {
  const port = await portForTest()
  const server = spawn(process.execPath, ['server/index.ts'], {
    env: { ...process.env, NODE_ENV: 'test', SF_DEMO: '1', SF_DEMO_DATA: 'memory', PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let stderr = ''
  server.stderr.on('data', chunk => { stderr += String(chunk) })
  t.after(async () => {
    if (server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit')
      server.kill()
      await exited
    }
  })
  await Promise.race([
    once(server.stdout, 'data'),
    once(server, 'exit').then(() => { throw new Error(stderr || 'API exited') }),
  ])
  const root = 'http://127.0.0.1:' + port + '/api'
  let cookie = ''
  function request(path: string, init: RequestInit = {}) {
    const headers = new Headers(init.headers)
    if (cookie) headers.set('Cookie', cookie)
    return fetch(root + path, { ...init, headers })
  }
  const post = (data?: unknown) => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
  assert.equal((await request('/data/products')).status, 401)
  const auth = await request('/auth/demo', post({ role: 'Data' }))
  assert.equal(auth.status, 204)
  cookie = auth.headers.get('set-cookie')!.split(';')[0]
  assert.equal((await request('/data/products')).status, 200)
  assert.equal((await request('/admin/roles')).status, 403)
  assert.equal((await request('/runs')).status, 403)
  assert.equal((await request('/session/role', { ...post({ role: 'Admin' }), headers: { 'Content-Type': 'application/json', Origin: 'https://other.example' } })).status, 403)

  const csv = ['id,product_id,customer_id,location_id,date,quantity,priority',
    'D-401,P-100,C-100,L-100,2026-10-23,10,0', 'D-402,P-999,C-100,L-100,2026-10-23,10,0'].join('\n')
  const upload = { method: 'POST', headers: { 'Content-Type': 'text/csv' }, body: csv }
  const [first, second] = await Promise.all([request('/uploads/demand', upload), request('/uploads/demand', upload)])
  assert.equal(first.status, 200)
  assert.equal(second.status, 200)
  const batch = await first.json()
  assert.deepEqual([batch.accepted, batch.rejected], [1, 1])
  assert.equal((await second.json()).id, batch.id)
  assert.equal((await (await request('/data/demand?q=D-401')).json()).total, 1)
  assert.equal((await request('/session/role', post({ role: 'Planner' }))).status, 200)
  assert.equal((await request('/uploads/demand', upload)).status, 403)
  assert.equal((await request('/restrictions', post({ productId: 'P-100', customerId: 'C-200', lot: 'LOT-B', reason: 'Fixture' }))).status, 201)
  const run = { method: 'POST', headers: { 'Idempotency-Key': 'local-test-retry' } }
  const [start, retry] = await Promise.all([request('/runs', run), request('/runs', run)])
  assert.equal(start.status, 202)
  assert.equal(retry.status, 202)
  const id = (await start.json()).id
  assert.equal((await retry.json()).id, id)
  let result
  for (let attempt = 0; attempt < 30; attempt++) {
    result = await (await request('/runs/' + id)).json()
    if (result.status === 'completed') break
    await setTimeout(100)
  }
  assert.equal(result.status, 'completed')
  assert.deepEqual([result.totals.requested, result.totals.allocated, result.totals.unfilled], [180, 80, 100])
  const csvExport = await request('/runs/' + id + '/export/csv')
  assert.equal(csvExport.status, 200)
  assert.match(await csvExport.text(), /"D-401","P-100","C-100","L-100",10,10,0/)
  const xlsxExport = await request('/runs/' + id + '/export/xlsx')
  assert.equal(xlsxExport.status, 200)
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await xlsxExport.arrayBuffer())
  assert.equal(workbook.getWorksheet('Totals')?.getCell('B2').value, 80)
  assert.equal((await request('/session/role', post({ role: 'BA' }))).status, 200)
  assert.equal((await request('/runs', run)).status, 403)
  assert.equal((await request('/runs/' + id)).status, 200)
  assert.equal((await request('/session/logout', post())).status, 204)
  assert.equal((await request('/runs')).status, 401)
})
