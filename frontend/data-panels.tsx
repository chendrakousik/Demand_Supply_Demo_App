import { useEffect, useState, type FormEvent } from 'react'
import { api, json, type Batch, type Run } from './api.js'

type RecordRow = { id: string; [key: string]: string | number | undefined }
type Page = { rows: RecordRow[]; total: number; page: number; size: number }
type Resource = 'products' | 'customers' | 'locations' | 'mappings' | 'demand' | 'supply' | 'restrictions'

export function DataPanel({ resource, canWrite }: { resource: Resource; canWrite: boolean }) {
  const [filter, setFilter] = useState('')
  const [sort, setSort] = useState({ key: 'id', order: 'asc' })
  const [page, setPage] = useState(1)
  const [data, setData] = useState<Page>()
  const [error, setError] = useState('')
  const [revision, refresh] = useState(0)
  const path = resource === 'restrictions' ? '/restrictions' : '/data/' + resource

  useEffect(() => {
    let current = true
    const params = new URLSearchParams({ q: filter, page: String(page), sort: sort.key, order: sort.order })
    api<Page>(path + '?' + params).then(result => {
      if (current) { setData(result); setError('') }
    }, failure => { if (current) setError(failure.message) })
    return () => { current = false }
  }, [path, filter, sort, page, revision])

  async function change(event: FormEvent<HTMLFormElement>, id?: string) {
    event.preventDefault()
    const form = event.currentTarget
    const body = Object.fromEntries(new FormData(form))
    try {
      await api(path + (id ? '/' + encodeURIComponent(id) : ''), json(id ? 'PATCH' : 'POST', body))
      if (!id) form.reset()
      refresh(n => n + 1)
      setError('')
    } catch (error) { setError((error as Error).message) }
  }

  const columns = Object.keys(data?.rows[0] ?? {})
  const editable = canWrite && (resource === 'products' || resource === 'customers')
  return <>
    <label>Filter <input type="search" value={filter} onChange={event => { setFilter(event.target.value); setPage(1) }} /></label>
    {error && <p role="alert">{error}</p>}
    {!data && !error && <p role="status">Loading records…</p>}
    {data?.rows.length === 0 && <p>No records found.</p>}
    {!!data?.rows.length && <div className="table-scroll"><table><thead><tr>
      {columns.map(key => <th key={key} scope="col" aria-sort={sort.key === key ? (sort.order === 'asc' ? 'ascending' : 'descending') : 'none'}>
        <button onClick={() => { setSort({ key, order: sort.key === key && sort.order === 'asc' ? 'desc' : 'asc' }); setPage(1) }}>{key}</button>
      </th>)}
      {editable && <th scope="col">Update name</th>}
    </tr></thead><tbody>{data.rows.map(row => <tr key={row.id}>
      {columns.map(key => <td key={key}>{row[key]}</td>)}
      {editable && <td><form onSubmit={event => void change(event, row.id)}>
        <input key={row.name} name="name" aria-label={'Name for ' + row.id} defaultValue={row.name} required maxLength={120} /> <button>Save</button>
      </form></td>}
    </tr>)}</tbody></table></div>}
    {data && <div className="panel-controls">
      <button disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
      <span>Page {page} · {data.total} records</span>
      <button disabled={page * data.size >= data.total} onClick={() => setPage(page + 1)}>Next</button>
    </div>}
    {resource === 'restrictions' && canWrite && <form className="panel-form" onSubmit={event => void change(event)}>
      <h3>Add allocation exclusion</h3>
      {([['productId', 'Product ID'], ['customerId', 'Customer ID'], ['locationId', 'Location ID'], ['lot', 'Lot'], ['reason', 'Reason']] as const).map(([key, label]) =>
        <label key={key}>{label}<input name={key} maxLength={120} required={key === 'productId' || key === 'reason'} /></label>)}
      <button>Create restriction</button>
    </form>}
  </>
}

export function BatchPanel({ batch }: { batch?: Batch }) {
  const [batches, setBatches] = useState<Batch[]>()
  const [error, setError] = useState('')
  useEffect(() => {
    let mounted = true
    api<{ rows: Batch[] }>('/uploads/batches?sort=createdAt&order=desc').then(({ rows }) => {
      if (mounted) setBatches(rows)
    }, error => { if (mounted) setError(error.message) })
    return () => { mounted = false }
  }, [batch])
  return <>
    {error && <p role="alert">{error}</p>}
    {batch && <section aria-label="Latest upload"><strong>{batch.type} · {batch.status}</strong>
      <p>{batch.accepted} accepted · {batch.rejected} rejected</p>
      {!!batch.errors.length && <ul>{batch.errors.map(({ row, message }, index) => <li key={index}>Row {row}: {message}</li>)}</ul>}
    </section>}
    {batches?.length === 0 && !batch && <p>No upload batches yet.</p>}
    {batches?.filter(row => row.id !== batch?.id).map(row => <details key={row.id}>
      <summary>{row.type} · {row.status} · {row.accepted} accepted · {row.rejected} rejected</summary>
      <ul>{row.errors.map(({ row, message }, index) => <li key={index}>Row {row}: {message}</li>)}</ul>
    </details>)}
  </>
}

export function ResultsPanel({ run }: { run?: Run }) {
  if (!run) return <p>No allocation run selected.</p>
  if (!run.results || !run.totals) return <p role="status">{run.status}{run.error && ' · ' + run.error}</p>
  const { totals } = run
  return <>
    <p>{totals.requested} requested · {totals.allocated} allocated · {totals.unfilled} unfilled · {(totals.utilization * 100).toFixed(1)}% utilization</p>
    <div className="table-scroll"><table>
      <thead><tr>{['Demand', 'Product', 'Customer', 'Location', 'Requested', 'Allocated', 'Unfilled'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
      <tbody>{run.results.map(row => <tr key={row.demandId}>
        {[row.demandId, row.productId, row.customerId, row.locationId, row.requested, row.allocated, row.unfilled].map((value, i) => <td key={i}>{value}</td>)}
      </tr>)}</tbody>
    </table></div>
  </>
}

export type { Resource }
