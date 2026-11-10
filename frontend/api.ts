export type Role = 'Admin' | 'Data' | 'Planner' | 'BA'
export type Session = { name: string; roles: Role[]; role: Role }
export type Batch = {
  id: string; type: string; status: string; accepted: number; rejected: number
  errors: { row: number; message: string }[]
}
export type RunSummary = { id: string; status: 'queued' | 'running' | 'completed' | 'failed'; createdAt: string; error?: string }
export type Run = RunSummary & {
  results?: { demandId: string; productId: string; customerId: string; locationId: string; requested: number; allocated: number; unfilled: number }[]
  totals?: { requested: number; allocated: number; unfilled: number; available: number; fulfillment: number; utilization: number }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch('/api' + path, init)
  if (response.status === 204) return undefined as T
  const value = await response.json()
  if (!response.ok) throw new Error(value?.error || 'Request failed (' + response.status + ')')
  return value as T
}

export function json(method: string, body?: unknown): RequestInit {
  return { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }
}
