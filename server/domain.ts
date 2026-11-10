import { parse } from 'csv-parse/sync'

export const roles = ['Admin', 'Data', 'Planner', 'BA'] as const
export type Role = typeof roles[number]
type Ability = 'data.read' | 'data.write' | 'ops.read' | 'restriction.write' | 'run' | 'admin'

export const permissions: Record<Role, readonly Ability[]> = {
  Admin: ['data.read', 'data.write', 'ops.read', 'restriction.write', 'run', 'admin'],
  Data: ['data.read', 'data.write'],
  Planner: ['data.read', 'ops.read', 'restriction.write', 'run'],
  BA: ['data.read', 'ops.read'],
}

export type Master = { id: string; name: string }
export type Demand = {
  id: string; productId: string; customerId: string; locationId: string
  date: string; quantity: number; priority: number; batchId?: string
}
export type Supply = {
  id: string; productId: string; locationId: string; date: string; quantity: number
  lot: string; batchId?: string
}
export type Restriction = {
  id: string; productId: string; customerId: string; locationId: string
  lot: string; reason: string; createdBy: string; createdAt: string
}
export type Result = {
  demandId: string; productId: string; customerId: string; locationId: string
  requested: number; allocated: number; unfilled: number
  lots: { supplyId: string; lot: string; quantity: number }[]
}
export type Run = {
  id: string; status: 'queued' | 'running' | 'completed' | 'failed'; createdAt: string; createdBy: string
  demand: Demand[]; supply: Supply[]; restrictions: Restriction[]; results?: Result[]; error?: string
}
export type Batch = {
  id: string; type: 'demand' | 'supply'; status: 'loaded' | 'rejected'; createdAt: string; createdBy: string
  accepted: number; rejected: number; errors: { row: number; message: string }[]
}

export const headers = {
  demand: ['id', 'product_id', 'customer_id', 'location_id', 'date', 'quantity', 'priority'],
  supply: ['id', 'product_id', 'location_id', 'date', 'quantity', 'lot'],
} as const

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(value)
  return Number.isFinite(+date) && date.toISOString().slice(0, 10) === value
}

export function validateCsv(type: keyof typeof headers, csv: string, catalog: {
  products: Set<string>; customers: Set<string>; locations: Set<string>; existing: Set<string>
}) {
  const parsed: unknown = parse(csv, {
    bom: true, trim: true, skip_empty_lines: true, relax_column_count: true, info: true,
  })
  const rows = parsed as { record: string[]; info: { lines: number } }[]
  const expected = headers[type]
  const header = rows.shift()?.record
  if (!header || header.length !== expected.length || expected.some((name, i) => header[i] !== name)) {
    throw new Error('Expected CSV columns: ' + expected.join(', '))
  }
  if (!rows.length) throw new Error('The CSV contains no data rows')
  const accepted: (Demand | Supply)[] = []
  const errors: Batch['errors'] = []
  const ids = new Set(catalog.existing)
  for (const { record, info } of rows) {
    const [id, productId] = record
    const [customerId, locationId, date, units, extra] = type === 'demand'
      ? record.slice(2)
      : ['', ...record.slice(2)]
    const quantity = Number(units)
    const priority = Number(extra)
    let message = ''
    if (record.length !== expected.length || record.some(value => !value || value.length > 128)) message = 'Missing, oversized, or unexpected fields'
    else if (ids.has(id)) message = 'Duplicate record ID'
    else if (!catalog.products.has(productId)) message = 'Unknown product'
    else if (type === 'demand' && !catalog.customers.has(customerId)) message = 'Unknown customer'
    else if (!catalog.locations.has(locationId)) message = 'Unknown location'
    else if (!validDate(date)) message = 'Date must be a valid YYYY-MM-DD date'
    else if (!/^\d+$/.test(units) || !Number.isSafeInteger(quantity) || quantity < 1) message = 'Quantity must be a positive whole number'
    else if (type === 'demand' && (!/^\d+$/.test(extra) || !Number.isSafeInteger(priority))) message = 'Priority must be a nonnegative whole number'

    if (message) errors.push({ row: info.lines, message })
    else {
      ids.add(id)
      const fields = { id, productId, locationId, date, quantity }
      accepted.push(type === 'demand' ? { ...fields, customerId, priority } : { ...fields, lot: extra })
    }
  }
  return { accepted, errors }
}

function compare(a: string, b: string) { return a < b ? -1 : a > b ? 1 : 0 }

export function allocate(demand: Demand[], supply: Supply[], restrictions: Restriction[]): Result[] {
  const available = supply.map(row => ({ ...row, remaining: row.quantity })).sort((a, b) =>
    compare(a.date, b.date) || compare(a.lot, b.lot) || compare(a.id, b.id))
  return [...demand].sort((a, b) => a.priority - b.priority || compare(a.date, b.date) || compare(a.id, b.id)).map(order => {
    const lots: Result['lots'] = []
    let unfilled = order.quantity
    for (const stock of available) {
      if (unfilled === 0) break
      if (!stock.remaining || stock.productId !== order.productId || stock.locationId !== order.locationId || stock.date > order.date) continue
      const blocked = restrictions.some(rule =>
        rule.productId === order.productId &&
        (!rule.customerId || rule.customerId === order.customerId) &&
        (!rule.locationId || rule.locationId === order.locationId) &&
        (!rule.lot || rule.lot === stock.lot))
      if (blocked) continue
      const quantity = Math.min(unfilled, stock.remaining)
      stock.remaining -= quantity
      unfilled -= quantity
      lots.push({ supplyId: stock.id, lot: stock.lot, quantity })
    }
    const { productId, customerId, locationId } = order
    return { demandId: order.id, productId, customerId, locationId, requested: order.quantity, allocated: order.quantity - unfilled, unfilled, lots }
  })
}

export function summarize(results: Result[], supply: Supply[]) {
  const totals = results.reduce((sum, row) => ({
    requested: sum.requested + row.requested, allocated: sum.allocated + row.allocated, unfilled: sum.unfilled + row.unfilled,
  }), { requested: 0, allocated: 0, unfilled: 0 })
  const available = supply.reduce((sum, row) => sum + row.quantity, 0)
  return { ...totals, available, fulfillment: totals.requested ? totals.allocated / totals.requested : 0, utilization: available ? totals.allocated / available : 0 }
}
