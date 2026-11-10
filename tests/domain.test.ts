import assert from 'node:assert/strict'
import test from 'node:test'
import { allocate, summarize, validateCsv } from '../server/domain.ts'
import { fixtures } from '../server/fixtures.ts'

test('allocation honors priority, splits lots and reports partial and full shortages', () => {
  const demand = [...fixtures.demand!].reverse()
  const supply = fixtures.supply!
  const results = allocate(demand, supply, [])
  assert.deepEqual(results.map(row => [row.demandId, row.allocated, row.unfilled]), [
    ['D-100', 70, 0], ['D-300', 0, 20], ['D-200', 30, 50],
  ])
  assert.deepEqual(results[0].lots.map(lot => lot.quantity), [60, 10])
  assert.deepEqual(summarize(results, supply), {
    requested: 170, allocated: 100, unfilled: 70, available: 100, fulfillment: 100 / 170, utilization: 1,
  })
  assert.equal(supply[0].quantity, 60)
})

test('allocation excludes future, wrong-location and restricted lots', () => {
  const order = fixtures.demand![0]
  const first = fixtures.supply![0]
  const rule = { id: '1', productId: order.productId, customerId: order.customerId, locationId: '',
    lot: first.lot, reason: 'Local fixture', createdAt: '', createdBy: 'test' }
  const results = allocate([order], [first, { ...first, id: 'future', date: '2026-10-24' },
    { ...first, id: 'elsewhere', locationId: 'L-200' }, fixtures.supply![1]], [rule])
  assert.equal(results[0].allocated, 40)
  assert.equal(results[0].unfilled, 30)
})

test('CSV validation preserves valid quoted rows and reports duplicate and invalid fields', () => {
  const catalog = {
    products: new Set(['P-100']), customers: new Set(['C-100']), locations: new Set(['L-100']), existing: new Set(['D-100']),
  }
  const header = 'id,product_id,customer_id,location_id,date,quantity,priority'
  const { accepted, errors } = validateCsv('demand', [
    header, '"D,new",P-100,C-100,L-100,2026-10-23,5,0', 'D-100,P-100,C-100,L-100,2026-10-23,5,0',
    'D-999,P-100,C-100,L-100,2026-02-30,5,0', 'D-998,P-100,C-100,L-100,2026-10-23,0,0',
  ].join('\n'), catalog)
  assert.deepEqual(accepted.map(row => row.id), ['D,new'])
  assert.deepEqual(errors.map(row => row.row), [3, 4, 5])
  assert.throws(() => validateCsv('demand', 'wrong,header', catalog), /Expected CSV columns/)
})
