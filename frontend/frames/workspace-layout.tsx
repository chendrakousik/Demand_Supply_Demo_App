import type { ReactNode } from 'react'
import { PrototypeAction, PrototypeText } from '../prototype-action.js'

const dataNavigation = [
  ['Home', '⌂'], ['Data Management', 'DATA'], ['Master Data', 'MD'], ['Transaction Data', 'CSV'],
] as const

const operationsNavigation = [
  ['Home', '⌂'], ['Supply Chain Operations', 'OPS'], ['Operations Dashboard', 'KPI'],
  ['Restriction Manager', 'RUL'], ['Allocation Engine', 'RUN'], ['Allocation Results', 'RES'],
  ['Supply Chain Review', 'REV'], ['Administration', 'ADM'],
] as const

export function Brand({ compact = false }: { compact?: boolean }) {
  return <div className="app-brand">
    <span className="app-brand-mark" aria-hidden="true">S</span>
    {!compact && <span>SILICONFLOW</span>}
  </div>
}

export function WorkspaceLayout({ title, compact, data, tools, children }: {
  title: string; compact: boolean; data: boolean; tools: ReactNode; children: ReactNode
}) {
  const links = data ? dataNavigation : operationsNavigation
  return <div className={'workspace-layout' + (compact ? ' workspace-layout--compact' : '')}>
    <aside className="workspace-sidebar" aria-label={data ? 'Data sidebar' : 'Operations sidebar'}>
      <div className="workspace-sidebar-brand">
        <Brand compact={compact} />
        {!compact && <p className="workspace-caption">ALLOCATION INTELLIGENCE</p>}
      </div>
      <PrototypeAction action={compact ? 'Expand sidebar' : 'Collapse sidebar'} className="workspace-sidebar-toggle">
        {compact ? '»' : '«'}
      </PrototypeAction>
      <nav className="workspace-nav" aria-label={data ? 'Data Management' : 'Supply Chain Operations'}>
        {links.map(([label, abbreviation]) => label === title
          ? <span key={label} className="workspace-nav-current" aria-current="page" aria-label={label}>
            {compact ? abbreviation : label}
          </span>
          : <PrototypeAction key={label} action={'Nav / ' + label}>
            {compact ? abbreviation : label}
          </PrototypeAction>)}
      </nav>
      <div className="workspace-sidebar-footer">
        <PrototypeAction action={compact ? 'Switch Role' : 'Select role'} className="workspace-role">
          {compact ? 'Role' : <PrototypeText value="role">Planner ▾</PrototypeText>}
        </PrototypeAction>
        {!compact && <div className="workspace-environment">
          <p className="workspace-caption">PLANNING ENVIRONMENT</p>
          <p>OCT 2026 · W43</p>
        </div>}
      </div>
    </aside>
    <div className="workspace-main">
      <main className="workspace-scroll" aria-labelledby="workspace-title">
        <div className="workspace-content">
          <header className="workspace-header">
            <div>
              <p className="screen-eyebrow">{title.toUpperCase()}</p>
              <h1 id="workspace-title">{title}</h1>
              <p className="screen-subtitle">SiliconFlow enterprise allocation workspace</p>
            </div>
            <span className="workspace-avatar" aria-hidden="true">K</span>
          </header>
          {children}
        </div>
      </main>
      {tools}
    </div>
  </div>
}

export function Chip({ label }: { label: string }) {
  return <span className="screen-chip" aria-hidden="true"><span /><small>{label}</small></span>
}

export function WorkspaceCard({ title, description, icon, action, primary = false }: {
  title: string; description: string; icon: string; action: string; primary?: boolean
}) {
  return <PrototypeAction action={action} className={'screen-card' + (primary ? ' screen-card--primary' : '')}>
    <Chip label={icon} />
    <span className="screen-card-copy"><strong>{title}</strong><span>{description}</span></span>
    <span className="screen-card-arrow" aria-hidden="true">→</span>
  </PrototypeAction>
}

export function WorkspaceBanner({ image }: { image: string }) {
  return <div className="workspace-banner">
    <p className="screen-eyebrow">SEMICONDUCTOR SUPPLY INTELLIGENCE</p>
    <img alt="" src={image} />
  </div>
}
