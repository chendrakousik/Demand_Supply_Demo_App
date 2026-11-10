import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/700.css'
import './styles.css'
import './frames/layers.css'
import { api, json, type Batch, type Role, type Run, type RunSummary, type Session } from './api.js'
import { BatchPanel, DataPanel, ResultsPanel, type Resource } from './data-panels.js'
import { frames } from './frames/index.js'
import { PrototypeInteraction } from './prototype-action.js'

const destinations: Record<string, string> = {
  Home: '/', 'Data Management': '/data', 'Master Data': '/data/master', 'Transaction Data': '/data/transactions',
  'Supply Chain Operations': '/operations', 'Operations Dashboard': '/operations/dashboard',
  'Restriction Manager': '/operations/restrictions', 'Allocation Engine': '/operations/allocation',
  'Allocation Results': '/operations/results', 'Supply Chain Review': '/operations/review', Administration: '/operations/admin',
  'Continue to Allocation Engine': '/operations/allocation', 'Open Allocation Planning': '/operations/allocation',
  'Sign in to SiliconFlow': '/sign-in', 'Back Home': '/', 'Select role': '/roles', 'Switch Role': '/roles',
}
const titles: Record<Resource, string> = {
  products: 'Product Master', customers: 'Customer Master', locations: 'Location Master',
  mappings: 'Product-Location Mapping', demand: 'Demand records', supply: 'Supply records', restrictions: 'Allocation restrictions',
}
const formatNumber = (value: number) => value.toLocaleString('en-US')
const percent = (value: number) => (value * 100).toFixed(1) + '%'
type Panel = Resource | 'batches' | 'results' | 'scope'
type Summary = { products: number; customers: number; demand: number; supply: number; source: string }

function readRoute() {
  return window.location.pathname.replace(/\/$/, '') || '/'
}
function allowed(path: string, session: Session | null) {
  if (path === '/' || path.startsWith('/sign-in')) return true
  if (!session) return false
  if (path === '/operations/admin') return session.role === 'Admin'
  if (path.startsWith('/operations')) return session.role !== 'Data'
  return true
}
function signInFor(path: string) {
  return (path.startsWith('/data') ? '/sign-in/data' : '/sign-in') + '?next=' + encodeURIComponent(path)
}

function App() {
  const [path, setPath] = useState(readRoute)
  const [compact, setCompact] = useState(false)
  const [session, setSession] = useState<Session | null>()
  const [demo, setDemo] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [panel, setPanel] = useState<Panel>()
  const [batch, setBatch] = useState<Batch>()
  const [summary, setSummary] = useState<Summary>()
  const [runs, setRuns] = useState<RunSummary[]>([])
  const [runId, setRunId] = useState('')
  const [run, setRun] = useState<Run>()
  const [running, setRunning] = useState(false)
  const [width, setWidth] = useState(window.innerWidth)
  const dialog = useRef<HTMLDialogElement>(null)
  const email = useRef('')
  const lastWorkspace = useRef('')
  const idempotency = useRef('')
  const actionInFlight = useRef(false)
  const canWrite = session?.role === 'Admin' || session?.role === 'Data'
  const canPlan = session?.role === 'Admin' || session?.role === 'Planner'

  const navigate = useCallback((url: string, replace = false) => {
    if (replace) window.history.replaceState(null, '', url)
    else window.history.pushState(null, '', url)
    setPanel(undefined)
    setPath(readRoute())
    setError('')
    setNotice('')
  }, [])

  const readSession = useCallback(() => api<Session | null>('/session').then(setSession), [])
  const readSummary = useCallback(() => api<Summary>('/data/summary').then(setSummary), [])
  useEffect(() => {
    const onPop = () => { setPath(readRoute()); setPanel(undefined) }
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('popstate', onPop)
    window.addEventListener('resize', onResize)
    api<{ demo: boolean }>('/config').then(result => setDemo(result.demo), failure => setError(failure.message))
    readSession().catch(failure => { setError(failure.message); setSession(null) })
    const timer = window.setInterval(() => { void readSession().catch(() => undefined) }, 30000)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('resize', onResize)
      window.clearInterval(timer)
    }
  }, [readSession])

  useEffect(() => {
    if (session === null && !allowed(path, null)) navigate(signInFor(path), true)
    if (session && allowed(path, session) && (path.startsWith('/data') || path.startsWith('/operations'))) lastWorkspace.current = path
  }, [path, session, navigate])

  const role = session?.role
  useEffect(() => {
    if (role && path.startsWith('/data')) readSummary().catch(failure => setError(failure.message))
  }, [path, role, readSummary])

  useEffect(() => {
    if (!role || !path.startsWith('/operations') || role === 'Data') return
    let active = true
    let timer: number | undefined
    async function poll() {
      try {
        const items = await api<RunSummary[]>('/runs')
        const selected = runId || items[0]?.id
        const detail = selected ? await api<Run>('/runs/' + encodeURIComponent(selected)) : undefined
        if (active) {
          setRuns(items)
          setRun(detail)
          if (detail && (detail.status === 'queued' || detail.status === 'running')) timer = window.setTimeout(poll, 750)
        }
      } catch (failure) { if (active) setError((failure as Error).message) }
    }
    void poll()
    return () => { active = false; window.clearTimeout(timer) }
  }, [path, role, runId])

  useEffect(() => {
    if (panel && !dialog.current?.open) dialog.current?.showModal()
    if (!panel && dialog.current?.open) dialog.current.close()
  }, [panel])

  const totals = run?.totals
  const customers = useMemo(() => {
    const groups = new Map<string, { name: string; requested: number; allocated: number; unfilled: number }>()
    for (const row of run?.results ?? []) {
      const group = groups.get(row.customerId) ?? { name: row.customerId, requested: 0, allocated: 0, unfilled: 0 }
      group.requested += row.requested
      group.allocated += row.allocated
      group.unfilled += row.unfilled
      groups.set(group.name, group)
    }
    return [...groups.values()]
  }, [run])

  function destination(action: string) {
    const label = action.split(' / ').at(-1) ?? ''
    if (action === 'Select role' || action === 'Switch Role' || action === 'Back Home') return destinations[action]
    if (action.startsWith('Nav / ') || action.startsWith('Button / ')) {
      const url = Object.hasOwn(destinations, label) ? destinations[label] : undefined
      return url && !session && url !== '/' && !url.startsWith('/sign-in') ? signInFor(url) : url
    }
  }

  function enabled(action: string) {
    if (action === 'Upload') return canWrite
    if (action === 'Button / Run Allocation') return canPlan && !running && run?.status !== 'queued' && run?.status !== 'running'
    if (action.startsWith('Button / Export')) return run?.status === 'completed'
    if (action.startsWith('Role / ')) return session?.roles.includes((action.endsWith('Business Analyst') ? 'BA' : action.slice(7)) as Role) ?? false
    if (action === 'Forgot password') return !demo
    const href = destination(action)
    return !href || !session || allowed(href, session)
  }

  async function signIn(provider: string) {
    const next = new URLSearchParams(window.location.search).get('next') ?? ''
    const safeNext = Object.values(destinations).includes(next) && (next.startsWith('/data') || next.startsWith('/operations')) ? next : '/roles'
    if (!demo) {
      const parameters = new URLSearchParams({ provider, next: safeNext })
      if (provider === 'email' && email.current) parameters.set('email', email.current)
      window.location.assign('/api/auth/login?' + parameters)
      return
    }
    await api('/auth/demo', json('POST'))
    await readSession()
    navigate(safeNext)
  }

  async function activate(action: string) {
    setError('')
    const url = destination(action)
    if (url) return navigate(url)
    try {
      if (action === 'Collapse sidebar' || action === 'Expand sidebar') return setCompact(value => !value)
      if (action.startsWith('Role / ')) {
        const role = action.endsWith('Business Analyst') ? 'BA' : action.slice(7)
        const updated = await api<Session>('/session/role', json('POST', { role }))
        setSession(updated)
        return navigate(lastWorkspace.current && allowed(lastWorkspace.current, updated) ? lastWorkspace.current : role === 'Data' ? '/data' : '/operations')
      }
      if (action === 'Button / Sign in' || action === 'Forgot password') return await signIn('email')
      if (action === 'Button / Google sign in') return await signIn('google')
      if (action === 'Button / Microsoft sign in') return await signIn('microsoft')
      if (action.startsWith('Button / Export') && run?.status === 'completed') {
        window.location.assign('/api/runs/' + encodeURIComponent(run.id) + '/export/' + (action.endsWith('Excel') ? 'xlsx' : 'csv'))
        return
      }
      if (action === 'Button / Run Allocation') {
        if (actionInFlight.current) return
        actionInFlight.current = true
        setRunning(true)
        try {
          idempotency.current ||= window.crypto.randomUUID()
          const request = await api<RunSummary>('/runs', { method: 'POST', headers: { 'Idempotency-Key': idempotency.current } })
          idempotency.current = ''
          setRun(request)
          setRunId(request.id)
          return navigate('/operations/results')
        } finally { actionInFlight.current = false; setRunning(false) }
      }
      if (action.startsWith('Panel / ')) setPanel(action.slice(8) as Panel)
    } catch (failure) { setError((failure as Error).message) }
  }

  async function upload(type: 'demand' | 'supply', file: File) {
    if (file.size > 10 * 1024 * 1024) { setError('Choose a CSV file under 10 MB.'); return }
    setError('')
    setNotice('Validating ' + type + ' CSV…')
    try {
      const response = await fetch('/api/uploads/' + type, { method: 'POST', headers: { 'Content-Type': 'text/csv' }, body: file })
      const value = await response.json()
      if (!response.ok && response.status !== 422) throw new Error(value.error || 'Upload failed')
      setBatch(value as Batch)
      setPanel('batches')
      void readSummary().catch(failure => setError(failure.message))
    } catch (failure) { setError((failure as Error).message) }
    finally { setNotice('') }
  }

  function layerText(key: string, sample: ReactNode) {
    if (key === 'role') return session ? session.role + ' ▾' : sample
    if (key === 'current-role') return 'Current role: ' + (session?.role === 'BA' ? 'Business Analyst' : session?.role ?? '—')
    if (key === 'sign-in-note') return demo ? sample : 'Sign-in continues with your managed provider.'
    if (key === 'run-readiness') return demo ? 'Local allocation rules are provisional' : 'Ready to load saved planning inputs'
    if (key === 'demand-columns') return 'id, product_id, customer_id, location_id, date, quantity, priority'
    if (key === 'supply-columns') return 'id, product_id, location_id, date, quantity, lot'
    if (key === 'dashboard-demand') return totals ? formatNumber(totals.requested) : '—'
    if (key === 'dashboard-supply') return totals ? formatNumber(totals.available) : '—'
    if (key === 'dashboard-gap') return totals ? formatNumber(totals.unfilled) : '—'
    if (key === 'dashboard-fulfillment') return totals ? percent(totals.fulfillment) : '—'
    if (key === 'review-fulfillment') return 'Fulfillment ' + (totals ? percent(totals.fulfillment) : '—')
    if (key === 'review-risk') return 'Customers at risk ' + (totals ? customers.filter(row => row.unfilled > 0).length : '—')
    if (key === 'review-allocated') return 'Allocated ' + (totals ? formatNumber(totals.allocated) : '—')
    if (key.startsWith('result-')) {
      const [, index, field] = key.split('-')
      const row = customers[Number(index)]
      if (!row) return Number(index) === 0 && field === '0' ? (run ? run.status : 'No allocation run') : '—'
      return [row.name, formatNumber(row.requested), formatNumber(row.allocated), formatNumber(row.unfilled),
        percent(row.requested ? row.allocated / row.requested : 0)][Number(field)]
    }
    return sample
  }

  const frame = frames.find(frame => frame.route === path && frame.compact === compact) ?? frames.find(frame => frame.route === path)
  const Component = frame?.component
  const display = (session !== undefined || path === '/' || path.startsWith('/sign-in')) && allowed(path, session ?? null)
  const zoom = Math.min(1, Math.max(0.68, width / 1440))
  return <PrototypeInteraction.Provider value={{ href: destination, enabled, activate: action => void activate(action), text: layerText, demo,
    upload: (type, file) => void upload(type, file), role, email: value => { email.current = value } }}>
    {Component && display ? <>
      <main className="canvas-viewport" aria-label="SiliconFlow workspace">
        <div className="canvas" style={{ zoom }}><Component /></div>
      </main>
      {session && path !== '/' && !path.startsWith('/sign-in') && <aside className="workspace-tools" aria-label="Workspace actions">
        <span>{session.name} · {session.role}{demo ? ' · Local demo' : ''}</span>
        {summary && path.startsWith('/data') && <span>{summary.source} · {summary.products} products · {summary.customers} customers · {summary.demand} demand · {summary.supply} supply</span>}
        {path === '/data/transactions' && <>
          <a href="/api/uploads/demand/template">Demand template</a><a href="/api/uploads/supply/template">Supply template</a>
          <button onClick={() => setPanel('demand')}>Demand records</button><button onClick={() => setPanel('supply')}>Supply records</button>
          <button onClick={() => setPanel('batches')}>Upload history</button>
        </>}
        {path === '/operations/restrictions' && <button onClick={() => setPanel('restrictions')}>Allocation restrictions</button>}
        {path.startsWith('/operations') && run && <span role="status">Allocation: {run.status}{run.error ? ' · ' + run.error : ''}</span>}
        {['/operations/results', '/operations/review', '/operations/dashboard'].includes(path) && <>
          {!!runs.length && <label>Run <select value={runId || runs[0].id} onChange={event => setRunId(event.target.value)}>
            {runs.map(row => <option key={row.id} value={row.id}>{new Date(row.createdAt).toLocaleString()} · {row.status} · {row.id.slice(0, 8)}</option>)}
          </select></label>}
          <button onClick={() => setPanel('results')}>Detailed results</button>
        </>}
        <button onClick={() => {
          void api('/session/logout', json('POST')).then(() => { setSession(null); setRun(undefined); setRunId(''); setRuns([]); setSummary(undefined); setBatch(undefined); navigate('/') }, failure => setError(failure.message))
        }}>Sign out</button>
      </aside>}
    </> : <main className="route-message">
      <h1>{session === undefined ? 'Loading workspace…' : Component ? 'Access denied' : 'Page not found'}</h1>
      <a href="/">Return to Home</a>
    </main>}
    {(notice || error) && <div className="notification" role={error ? 'alert' : 'status'}>{error || notice}</div>}
    <dialog ref={dialog} aria-labelledby="panel-title" onClose={() => setPanel(undefined)}>
      <header><h2 id="panel-title">{panel === 'batches' ? 'Upload batches' : panel === 'results' ? 'Allocation results' : panel === 'scope' ? 'Pending workflow' : panel ? titles[panel] : ''}</h2>
        <button onClick={() => setPanel(undefined)} aria-label="Close">Close</button></header>
      {panel === 'batches' && <BatchPanel batch={batch} />}
      {panel === 'results' && <ResultsPanel run={run} />}
      {panel === 'scope' && <p>This workflow is awaiting scope approval.</p>}
      {panel && panel in titles && <DataPanel key={panel} resource={panel as Resource} canWrite={panel === 'restrictions' ? canPlan : canWrite} />}
    </dialog>
  </PrototypeInteraction.Provider>
}

createRoot(document.getElementById('root')!).render(<App />)
