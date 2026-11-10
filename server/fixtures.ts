import type { Records } from './store.ts'

export const fixtures: Partial<{ [K in keyof Records]: Records[K][] }> = {
  products: [{ id: 'P-100', name: 'Silicon Wafer 300 mm' }, { id: 'P-200', name: 'Power MOSFET' }],
  customers: [{ id: 'C-100', name: 'Vector Systems' }, { id: 'C-200', name: 'Horizon Devices' }],
  locations: [{ id: 'L-100', name: 'Phoenix Fab' }, { id: 'L-200', name: 'Austin Fab' }],
  mappings: [{ id: 'P-100-L-100', productId: 'P-100', locationId: 'L-100' }],
  demand: [
    { id: 'D-100', productId: 'P-100', customerId: 'C-100', locationId: 'L-100', date: '2026-10-23', quantity: 70, priority: 1 },
    { id: 'D-200', productId: 'P-100', customerId: 'C-200', locationId: 'L-100', date: '2026-10-23', quantity: 80, priority: 2 },
    { id: 'D-300', productId: 'P-200', customerId: 'C-100', locationId: 'L-200', date: '2026-10-23', quantity: 20, priority: 1 },
  ],
  supply: [
    { id: 'S-100', productId: 'P-100', locationId: 'L-100', date: '2026-10-20', quantity: 60, lot: 'LOT-A' },
    { id: 'S-200', productId: 'P-100', locationId: 'L-100', date: '2026-10-21', quantity: 40, lot: 'LOT-B' },
  ],
}
