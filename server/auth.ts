import { createHash, randomBytes } from 'node:crypto'
import type { Express, Request, Response } from 'express'
import { createRemoteJWKSet, jwtVerify } from 'jose'
import { roles, type Role } from './domain.ts'

type Session = { subject: string; name: string; assigned: Role[]; active: Role; expires: number }
type Pending = { nonce: string; verifier: string; next: string; expires: number }
const token = () => randomBytes(32).toString('base64url')
const minutes = (n: number) => n * 60 * 1000
const destinations = new Set([
  '/data', '/data/master', '/data/transactions', '/operations', '/operations/dashboard',
  '/operations/restrictions', '/operations/allocation', '/operations/results', '/operations/review', '/operations/admin',
])
function cookie(req: Request, key: string) {
  return (req.headers.cookie ?? '').split(';').map(part => part.trim()).find(part => part.startsWith(key + '='))?.slice(key.length + 1) ?? ''
}
function query(req: Request, name: string) {
  const value = req.query[name]
  return typeof value === 'string' ? value : ''
}

export async function configureAuth(app: Express, demo: boolean) {
  const sessions = new Map<string, Session>()
  const pending = new Map<string, Pending>()
  const provider = process.env.OIDC_ISSUER?.replace(/\/$/, '')
  const clientId = process.env.OIDC_CLIENT_ID
  const secret = process.env.OIDC_CLIENT_SECRET
  const origin = process.env.APP_ORIGIN
  const roleClaim = process.env.OIDC_ROLE_CLAIM
  const redirectUri = origin + '/api/auth/callback'
  let oidc: { issuer: string; authorization_endpoint: string; token_endpoint: string; jwks_uri: string } | undefined

  if (!demo) {
    if (!provider || !clientId || !secret || !origin || !roleClaim) throw new Error('Managed sign-in configuration is required')
    if (!provider.startsWith('https://') || new URL(origin).origin !== origin || !origin.startsWith('https://')) {
      throw new Error('Managed sign-in requires HTTPS issuer and application origin')
    }
    const response = await fetch(provider + '/.well-known/openid-configuration', { signal: AbortSignal.timeout(10000) })
    if (!response.ok) throw new Error('Unable to load OIDC provider metadata')
    oidc = await response.json() as NonNullable<typeof oidc>
    if (oidc.issuer.replace(/\/$/, '') !== provider ||
      ![oidc.authorization_endpoint, oidc.token_endpoint, oidc.jwks_uri].every(url => new URL(url).protocol === 'https:')) {
      throw new Error('Invalid OIDC provider metadata')
    }
  }
  const jwks = oidc ? createRemoteJWKSet(new URL(oidc.jwks_uri)) : undefined

  function startSession(res: Response, session: Omit<Session, 'expires'>, expires: number) {
    const id = token()
    sessions.set(id, { ...session, expires })
    res.cookie('sf_session', id, { httpOnly: true, sameSite: 'lax', secure: !demo, maxAge: expires - Date.now(), path: '/' })
  }

  function current(req: Request) {
    const id = cookie(req, 'sf_session')
    const session = sessions.get(id)
    if (session && session.expires > Date.now()) return session
    sessions.delete(id)
  }

  const sweep = setInterval(() => {
    for (const [id, s] of sessions) if (s.expires <= Date.now()) sessions.delete(id)
    for (const [id, p] of pending) if (p.expires <= Date.now()) pending.delete(id)
  }, minutes(5))
  sweep.unref()

  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      const demoPort = process.env.PORT || '3000'
      const allowed = demo
        ? new Set(['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:' + demoPort, 'http://127.0.0.1:' + demoPort])
        : new Set([origin])
      if (req.get('Sec-Fetch-Site') === 'cross-site' || (req.get('Origin') && !allowed.has(req.get('Origin')))) {
        res.status(403).json({ error: 'Cross-origin requests are denied' })
        return
      }
    }
    next()
  })

  app.get('/api/config', (_req, res) => res.json({ demo }))
  app.get('/api/session', (req, res) => {
    const session = current(req)
    res.json(session ? { name: session.name, roles: session.assigned, role: session.active } : null)
  })
  app.post('/api/session/role', (req, res) => {
    const session = current(req)
    if (!session) return res.status(401).json({ error: 'Sign in required' })
    if (!session.assigned.includes(req.body?.role)) return res.status(403).json({ error: 'This role is not assigned to your account' })
    session.active = req.body.role
    res.json({ name: session.name, roles: session.assigned, role: session.active })
  })
  app.post('/api/session/logout', (req, res) => {
    sessions.delete(cookie(req, 'sf_session'))
    res.clearCookie('sf_session', { path: '/', sameSite: 'lax', secure: !demo, httpOnly: true }).sendStatus(204)
  })
  if (demo) {
    app.post('/api/auth/demo', (req, res) => {
      const role = req.body?.role as Role | undefined
      if (role && !roles.includes(role)) return res.status(400).json({ error: 'Unknown demo role' })
      sessions.delete(cookie(req, 'sf_session'))
      startSession(res, { subject: 'local-demo', name: 'SiliconFlow Demo', assigned: [...roles], active: role ?? 'Admin' }, Date.now() + minutes(60))
      res.sendStatus(204)
    })
  } else if (oidc && jwks && clientId && secret && roleClaim) {
    const metadata = oidc
    app.get('/api/auth/login', (req, res) => {
      const provider = query(req, 'provider') || 'email'
      const settings: Record<string, string | undefined> = {
        email: process.env.OIDC_EMAIL_PARAMETERS,
        google: process.env.OIDC_GOOGLE_PARAMETERS,
        microsoft: process.env.OIDC_MICROSOFT_PARAMETERS,
      }
      if (!Object.hasOwn(settings, provider) || (provider !== 'email' && !settings[provider])) {
        return res.status(503).send('This sign-in method is pending configuration.')
      }
      const state = token()
      const nonce = token()
      const verifier = token()
      const next = query(req, 'next')
      pending.set(state, { nonce, verifier, next: destinations.has(next) ? next : '/roles', expires: Date.now() + minutes(5) })
      res.cookie('sf_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: minutes(5), path: '/api/auth/callback' })
      const url = new URL(metadata.authorization_endpoint)
      for (const [key, value] of new URLSearchParams(settings[provider])) url.searchParams.set(key, value)
      for (const [key, value] of Object.entries({
        client_id: clientId, response_type: 'code', redirect_uri: redirectUri, scope: 'openid profile email',
        state, nonce, code_challenge: createHash('sha256').update(verifier).digest('base64url'), code_challenge_method: 'S256',
      })) url.searchParams.set(key, value)
      const hint = query(req, 'email')
      if (hint && hint.length <= 254) url.searchParams.set('login_hint', hint)
      res.redirect(url.toString())
    })

    app.get('/api/auth/callback', async (req, res) => {
      const state = query(req, 'state')
      const code = query(req, 'code')
      const request = pending.get(state)
      if (!request || request.expires <= Date.now() || cookie(req, 'sf_state') !== state || !code) {
        return res.status(400).send('Sign-in expired or failed. Return to SiliconFlow and try again.')
      }
      pending.delete(state)
      res.clearCookie('sf_state', { path: '/api/auth/callback', secure: true, httpOnly: true, sameSite: 'lax' })
      try {
        const response = await fetch(metadata.token_endpoint, {
          method: 'POST',
          body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri,
            client_id: clientId, client_secret: secret, code_verifier: request.verifier }),
          signal: AbortSignal.timeout(10000),
        })
        if (!response.ok) throw new Error('Token request failed')
        const data = await response.json() as { id_token?: string }
        if (!data.id_token) throw new Error('Missing identity token')
        const { payload } = await jwtVerify(data.id_token, jwks, { issuer: metadata.issuer, audience: clientId, requiredClaims: ['exp', 'sub', 'iat'] })
        if (payload.nonce !== request.nonce || !payload.sub ||
          (Array.isArray(payload.aud) && payload.aud.length > 1 && payload.azp !== clientId)) throw new Error('Invalid identity token')
        const claim = payload[roleClaim]
        const assigned = roles.filter(role => Array.isArray(claim) && claim.includes(role))
        if (!assigned.length) return res.status(403).send('Your account has no assigned SiliconFlow roles.')
        sessions.delete(cookie(req, 'sf_session'))
        startSession(res, { subject: payload.sub, name: typeof payload.name === 'string' ? payload.name : payload.sub,
          assigned, active: assigned[0] }, Math.min(payload.exp! * 1000, Date.now() + minutes(60)))
        res.redirect(request.next)
      } catch {
        res.status(401).send('Managed sign-in failed. Return to SiliconFlow and try again.')
      }
    })
  }
  return current
}
