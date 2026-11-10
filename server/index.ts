import { createHash, randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import express, { type Request, type Response, type NextFunction } from 'express'
import ExcelJS from 'exceljs'
import { configureAuth } from './auth.ts'
import { allocate, headers, permissions, summarize, validateCsv, type Batch, type Demand, type Restriction, type Run, type Supply } from './domain.ts'
import { createDemoStore, createSnowflakeStore } from './store.ts'

const demo = process.env.SF_DEMO === '1'
if (demo && process.env.NODE_ENV === 'production') throw new Error('Local demo mode is disabled in production')
if (!demo && process.env.SF_POLICIES_APPROVED !== '1') throw new Error('Approve the role matrix and allocation policy before running outside local demo mode')
const app = express()
app.disable('x-powered-by')
app.use((_req, res, next) => {
  res.set({ 'X-Content-Type-Options': 'nosniff', 'X-Frame-Options': 'DENY', 'Referrer-Policy': 'same-origin' })
  next()
})
app.use(express.json({ limit: '32kb' }))
const current = await configureAuth(app, demo)
const store = demo && process.env.SF_DEMO_DATA !== 'snowflake' ? createDemoStore() : await createSnowflakeStore()
const uploadLimit = 10 * 1024 * 1024

let pending = Promise.resolve<unknown>(undefined)
function mutate<T>(work: () => Promise<T>) {
  const result = pending.then(work)
  pending = result.catch(() => undefined)
  return result
}

type Ability = (typeof permissions)[keyof typeof permissions][number]
function allow(ability: Ability) {
  return (req: Request, res: Response, next: NextFunction) => {
    const session = current(req)
    if (!session) return res.status(401).json({ error: 'Sign in required' })
    if (!permissions[session.active].includes(ability)) return res.status(403).json({ error: 'Your active role does not allow this action' })
    next()
  }
}

function paged<T extends { id: string }>(rows: T[], req: Request) {
  const query = typeof req.query.q === 'string' ? req.query.q.trim().toLowerCase() : ''
  const filtered = rows.filter(row => !query || Object.values(row).some(value => String(value).toLowerCase().includes(query)))
  const page = Math.max(1, Math.min(1_000_000, Math.trunc(Number(req.query.page) || 1)))
  const size = Math.max(1, Math.min(100, Math.trunc(Number(req.query.size) || 25)))
  const sort = typeof req.query.sort === 'string' ? req.query.sort : 'id'
  const direction = req.query.order === 'desc' ? -1 : 1
  const cell = (row: T) => Object.hasOwn(row, sort) ? (row as Record<string, unknown>)[sort] : row.id
  filtered.sort((a, b) => {
    const left = cell(a)
    const right = cell(b)
    const delta = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right))
    return direction * delta || a.id.localeCompare(b.id)
  })
  return { rows: filtered.slice((page - 1) * size, page * size), total: filtered.length, page, size }
}

app.get('/api/health', (_req, res) => res.json({ ok: true }))
app.get('/api/admin/roles', allow('admin'), (_req, res) => res.json(permissions))
app.get('/api/data/summary', allow('data.read'), async (_req, res) => {
  const [products, customers, demand, supply] = await Promise.all([
    store.read('products'), store.read('customers'), store.read('demand'), store.read('supply'),
  ])
  res.json({ products: products.length, customers: customers.length, demand: demand.length, supply: supply.length,
    source: demo && process.env.SF_DEMO_DATA !== 'snowflake' ? 'Local sample data' : 'Snowflake' })
})

for (const table of ['products', 'customers', 'locations', 'mappings', 'demand', 'supply'] as const) {
  app.get('/api/data/' + table, allow('data.read'), async (req, res) => res.json(paged(await store.read(table), req)))
}
for (const table of ['products', 'customers'] as const) {
  app.patch('/api/data/' + table + '/:id', allow('data.write'), async (req, res) => {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
    if (!name || name.length > 120) return res.status(400).json({ error: 'Name must contain 1–120 characters' })
    const row = await mutate(async () => {
      const record = (await store.read(table)).find(row => row.id === req.params.id)
      if (!record) return
      const updated = { ...record, name }
      await store.write([{ table, rows: [updated] }])
      return updated
    })
    if (!row) return res.status(404).json({ error: 'Record not found' })
    res.json(row)
  })
}

for (const type of ['demand', 'supply'] as const) {
  app.get('/api/uploads/' + type + '/template', allow('data.read'), (_req, res) => {
    res.type('text/csv').attachment(type + '-template.csv').send(headers[type].join(',') + '\r\n')
  })
  app.post('/api/uploads/' + type, allow('data.write'), express.text({ type: 'text/csv', limit: uploadLimit }), async (req, res) => {
    const csv = typeof req.body === 'string' ? req.body : ''
    if (!csv) return res.status(400).json({ error: 'A text/csv file is required' })
    const session = current(req)!
    const batch = await mutate(async () => {
      const id = createHash('sha256').update(JSON.stringify([session.subject, type, csv])).digest('hex')
      const previous = (await store.read('batches')).find(row => row.id === id)
      if (previous) return previous
      const [products, customers, locations, existing] = await Promise.all([
        store.read('products'), store.read('customers'), store.read('locations'), store.read(type),
      ])
      const ids = (rows: { id: string }[]) => new Set(rows.map(row => row.id))
      let rows: (Demand | Supply)[] = []
      let errors: Batch['errors'] = []
      try {
        const validated = validateCsv(type, csv, {
          products: ids(products), customers: ids(customers), locations: ids(locations), existing: ids(existing),
        })
        rows = validated.accepted.map(row => ({ ...row, batchId: id }))
        errors = validated.errors
      } catch (error) {
        errors = [{ row: 1, message: error instanceof Error ? error.message : 'Invalid CSV' }]
      }
      const record: Batch = { id, type, status: rows.length ? 'loaded' : 'rejected', createdAt: new Date().toISOString(),
        createdBy: session.subject, accepted: rows.length, rejected: errors.length, errors }
      const data = type === 'demand' ? { table: type, rows: rows as Demand[] } as const : { table: type, rows: rows as Supply[] } as const
      await store.write([data, { table: 'batches', rows: [record] }])
      return record
    })
    res.status(batch.status === 'loaded' ? 200 : 422).json(batch)
  })
}
app.get('/api/uploads/batches', allow('data.read'), async (req, res) => res.json(paged(await store.read('batches'), req)))

app.get('/api/restrictions', allow('ops.read'), async (req, res) => res.json(paged(await store.read('restrictions'), req)))
app.post('/api/restrictions', allow('restriction.write'), async (req, res) => {
  const keys = ['productId', 'customerId', 'locationId', 'lot', 'reason'] as const
  const values = Object.fromEntries(keys.map(key => [key, typeof req.body?.[key] === 'string' ? req.body[key].trim() : ''])) as Pick<Restriction, typeof keys[number]>
  if (!values.productId || !values.reason || Object.values(values).some(value => value.length > 120)) {
    return res.status(400).json({ error: 'Product and reason are required. Fields may contain up to 120 characters.' })
  }
  const [products, customers, locations] = await Promise.all([store.read('products'), store.read('customers'), store.read('locations')])
  if (!products.some(row => row.id === values.productId) ||
    (values.customerId && !customers.some(row => row.id === values.customerId)) ||
    (values.locationId && !locations.some(row => row.id === values.locationId))) {
    return res.status(400).json({ error: 'Unknown product, customer, or location' })
  }
  const rule = { ...values, id: randomUUID(), createdBy: current(req)!.subject, createdAt: new Date().toISOString() }
  await mutate(() => store.write([{ table: 'restrictions', rows: [rule] }]))
  res.status(201).json(rule)
})

const saveRun = (run: Run) => store.write([{ table: 'runs', rows: [run] }])
const savedRuns = await store.read('runs')
if (savedRuns.some(run => run.status === 'running')) {
  await store.write([{ table: 'runs', rows: savedRuns.filter(run => run.status === 'running').map(run =>
    ({ ...run, status: 'failed', error: 'The API stopped before this run finished' })) }])
}
let processing = false
function scheduleRuns() {
  if (processing) return
  processing = true
  setImmediate(async () => {
    try {
      for (;;) {
        const run = await mutate(async () => {
          const queued = (await store.read('runs')).filter(row => row.status === 'queued').sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0]
          if (!queued) {
            processing = false
            return undefined
          }
          await saveRun({ ...queued, status: 'running' })
          return queued
        })
        if (!run) return
        try {
          const results = allocate(run.demand, run.supply, run.restrictions)
          const rows = results.map(row => ({ ...row, id: run.id + ':' + row.demandId, runId: run.id }))
          const shortages = rows.filter(row => row.unfilled > 0).map(({ id, runId, demandId, productId, customerId, unfilled }) =>
            ({ id, runId, demandId, productId, customerId, quantity: unfilled }))
          await mutate(() => store.write([
            { table: 'results', rows }, { table: 'shortages', rows: shortages },
            { table: 'runs', rows: [{ ...run, status: 'completed', results }] },
          ]))
        } catch {
          await mutate(() => saveRun({ ...run, status: 'failed', error: 'Allocation could not be completed' }))
        }
      }
    } catch {
      processing = false
      console.error('Allocation worker could not access its run store')
    }
  })
}
if (savedRuns.some(run => run.status === 'queued')) scheduleRuns()

const runSummary = ({ id, status, createdAt, error }: Run) => ({ id, status, createdAt, error })
app.post('/api/runs', allow('run'), async (req, res) => {
  const key = req.get('Idempotency-Key')
  if (!key || !/^[\w-]{8,100}$/.test(key)) return res.status(400).json({ error: 'A valid Idempotency-Key is required' })
  const subject = current(req)!.subject
  const id = createHash('sha256').update(JSON.stringify([subject, key])).digest('hex')
  const run = await mutate(async () => {
    const existing = (await store.read('runs')).find(row => row.id === id)
    if (existing) return existing
    const [demand, supply, restrictions] = await Promise.all([store.read('demand'), store.read('supply'), store.read('restrictions')])
    const queued: Run = { id, status: 'queued', createdBy: subject, createdAt: new Date().toISOString(), demand, supply, restrictions }
    await saveRun(queued)
    return queued
  })
  scheduleRuns()
  res.status(202).json(runSummary(run))
})
app.get('/api/runs', allow('ops.read'), async (_req, res) => {
  const runs = (await store.read('runs')).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  res.json(runs.map(runSummary))
})
app.get('/api/runs/:id', allow('ops.read'), async (req, res) => {
  const run = (await store.read('runs')).find(row => row.id === req.params.id)
  if (!run) return res.status(404).json({ error: 'Run not found' })
  res.json({ ...runSummary(run), results: run.results, totals: run.results ? summarize(run.results, run.supply) : undefined })
})

function csvCell(value: string | number) {
  if (typeof value === 'number') return String(value)
  const safe = /^[\s]*[=+\-@]|^[\t\r\n]/.test(value) ? "'" + value : value
  return '"' + safe.replaceAll('"', '""') + '"'
}
app.get('/api/runs/:id/export/:format', allow('ops.read'), async (req, res) => {
  const { format } = req.params
  if (format !== 'csv' && format !== 'xlsx') return res.sendStatus(404)
  const run = (await store.read('runs')).find(row => row.id === req.params.id)
  if (!run) return res.status(404).json({ error: 'Run not found' })
  if (run.status !== 'completed' || !run.results) return res.status(409).json({ error: 'Only completed runs can be exported' })
  const columns = ['Demand ID', 'Product', 'Customer', 'Location', 'Requested', 'Allocated', 'Unfilled', 'Lots']
  const rows = run.results.map(row => [row.demandId, row.productId, row.customerId, row.locationId, row.requested, row.allocated, row.unfilled,
    row.lots.map(lot => lot.lot + ' (' + lot.quantity + ')').join(', ')])
  const filename = 'siliconflow-' + run.id.slice(0, 12) + '.' + format
  if (format === 'csv') return res.attachment(filename).type('text/csv').send([columns, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n') + '\r\n')
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Allocation Results')
  sheet.addRows([columns, ...rows])
  const summary = workbook.addWorksheet('Totals')
  summary.addRows(Object.entries(summarize(run.results, run.supply)))
  const buffer = await workbook.xlsx.writeBuffer()
  res.attachment(filename).send(Buffer.from(buffer))
})

app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found' }))
const dist = resolve('dist')
if (existsSync(resolve(dist, 'index.html'))) {
  app.use(express.static(dist))
  app.get('/{*path}', (_req, res) => res.sendFile(resolve(dist, 'index.html')))
}
app.use((error: { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
  if (error.status === 413) return res.status(413).json({ error: 'The upload exceeds the 10 MB limit' })
  if (error.status === 400) return res.status(400).json({ error: 'Invalid request body' })
  console.error('SiliconFlow API request failed')
  res.status(500).json({ error: 'Unable to complete this request' })
})

const port = Number(process.env.PORT || 3000)
app.listen(port, demo ? '127.0.0.1' : '0.0.0.0', () => console.log('SiliconFlow API listening on port ' + port))
