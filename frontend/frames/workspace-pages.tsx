import { PrototypeAction, PrototypeText, PrototypeUpload } from '../prototype-action.js'
import { WorkspaceBanner, WorkspaceCard } from './workspace-layout.js'

const operationsCards = [
  ['Operations Dashboard', 'Track demand, supply and fulfillment', 'KPI'],
  ['Restriction Manager', 'Configure allocation rules and commitments', 'RULE'],
  ['Allocation Engine', 'Run controlled semiconductor allocations', 'CPU'],
  ['Allocation Results', 'Examine assignments, shortages and exports', 'OUT'],
  ['Supply Chain Review', 'Assess fulfillment, risk and exceptions', 'BA'],
] as const

const masterCards = [
  ['Product Master', 'products', 'PRD'],
  ['Customer Master', 'customers', 'CUS'],
  ['Location Master', 'locations', 'LOC'],
  ['Product-Location Mapping', 'mappings', 'MAP'],
  ['Customer Priority Rules', 'scope', 'PRI'],
  ['Allocation Policies', 'scope', 'POL'],
  ['Planning Calendar', 'scope', 'CAL'],
  ['Lead Time Parameters', 'scope', 'LTP'],
] as const

const metrics = [
  ['Demand', 'dashboard-demand'], ['Eligible Supply', 'dashboard-supply'],
  ['Supply Gap', 'dashboard-gap'], ['Fulfillment', 'dashboard-fulfillment'],
] as const

export function Operations() {
  return <>
    <WorkspaceBanner image="/figma/1-128-adc58.png" />
    <p className="screen-subtitle screen-intro">Choose an operations workspace.</p>
    <div className="screen-card-grid">
      {operationsCards.map(([title, description, icon], index) =>
        <WorkspaceCard key={title} title={title} description={description} icon={icon}
          action={'Button / ' + title} primary={index === 0} />)}
    </div>
  </>
}

export function DataManagement() {
  return <>
    <WorkspaceBanner image="/figma/1-20-ca67f.png" />
    <p className="screen-subtitle screen-intro">Select a data area to manage the planning inputs.</p>
    <div className="screen-card-grid">
      <WorkspaceCard title="Master Data" description="Manage products, customers, locations and mappings."
        icon="MD" action="Button / Master Data" />
      <WorkspaceCard title="Transaction Data" description="Upload and review demand and supply records."
        icon="CSV" action="Button / Transaction Data" />
    </div>
  </>
}

export function MasterData() {
  return <div className="screen-card-grid workspace-section">
    {masterCards.map(([title, resource, icon]) =>
      <WorkspaceCard key={title} title={title} description={
        resource === 'scope' ? 'Pending workflow' : resource === 'products' || resource === 'customers' ? 'View and edit records' : 'View records'
      } icon={icon} action={'Panel / ' + resource} />)}
  </div>
}

export function TransactionData() {
  return <section className="workspace-section">
    <h2>Demand and Supply CSV upload templates</h2>
    <div className="screen-card-grid">
      {(['demand', 'supply'] as const).map(type =>
        <section key={type} className="screen-panel">
          <h3>{type === 'demand' ? 'Demand CSV' : 'Supply CSV'}</h3>
          <PrototypeUpload type={type} className="screen-upload" />
          <PrototypeText value={type + '-columns'} className="screen-subtitle" />
        </section>)}
    </div>
    <div className="screen-actions">
      <PrototypeAction action="Button / Continue to Allocation Engine" className="screen-button screen-button--primary">
        Continue to Allocation Engine →
      </PrototypeAction>
    </div>
  </section>
}

export function OperationsDashboard() {
  return <div className="workspace-section">
    <div className="screen-metric-grid">
      {metrics.map(([label, value]) => <div key={value} className="screen-panel screen-metric">
        <p className="screen-subtitle">{label}</p>
        <PrototypeText value={value}>—</PrototypeText>
      </div>)}
    </div>
    <section className="screen-panel workspace-section">
      <h2>Planning workflow</h2>
      <p className="screen-subtitle">Upload supply data → Validate → Configure restrictions → Run allocation → Review</p>
      <div className="screen-actions">
        <PrototypeAction action="Button / Open Allocation Planning" className="screen-button screen-button--primary">
          Open Allocation Planning →
        </PrototypeAction>
      </div>
    </section>
  </div>
}

export function RestrictionManager() {
  const restrictions = ['Customer priorities', 'Date windows', 'Quantity caps', 'Minimum lots', 'Commitment protection']
  return <ul className="screen-list workspace-section">
    {restrictions.map((label, index) => <li className="screen-panel screen-list-row" key={label}>
      <strong>{label}</strong>
      <PrototypeAction action={index === 0 ? 'Panel / restrictions' : 'Panel / scope'} className="screen-button">
        Configure / Review
      </PrototypeAction>
    </li>)}
  </ul>
}

export function AllocationEngine() {
  return <section className="screen-panel workspace-section">
    <h2>Ready to run allocation?</h2>
    <PrototypeText value="run-readiness" className="screen-subtitle" />
    <p className="screen-subtitle">Allocation requires an authorized user to click Run Allocation.</p>
    <div className="screen-actions">
      <PrototypeAction action="Button / Run Allocation" className="screen-button screen-button--primary">
        Run Allocation →
      </PrototypeAction>
    </div>
  </section>
}

export function AllocationResults() {
  const columns = ['Customer', 'Demand', 'Allocated', 'Shortage', 'Fill rate']
  return <div className="workspace-section">
    <div className="screen-panel screen-table">
      <table aria-label="Allocation summary by customer">
        <thead><tr>{columns.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
        <tbody>{[0, 1, 2, 3].map(row => <tr key={row}>
          {columns.map((label, index) => <td key={label}>
            <PrototypeText value={`result-${row}-${index}`}>—</PrototypeText>
          </td>)}
        </tr>)}</tbody>
      </table>
    </div>
    <div className="screen-actions">
      <PrototypeAction action="Button / Export CSV" className="screen-button">Export CSV</PrototypeAction>
      <PrototypeAction action="Button / Export Excel" className="screen-button">Export Excel</PrototypeAction>
    </div>
  </div>
}

export function SupplyChainReview() {
  return <div className="workspace-section">
    <div className="screen-metric-grid">
      {['review-fulfillment', 'review-risk', 'review-allocated'].map(value => <div key={value} className="screen-panel screen-metric">
        <PrototypeText value={value}>—</PrototypeText>
      </div>)}
    </div>
    <div className="screen-actions">
      <PrototypeAction action="Panel / results" className="screen-button">Shortage analysis by product and customer</PrototypeAction>
    </div>
  </div>
}

export function Administration() {
  return <ul className="screen-list workspace-section">
    {[
      ['Admin', 'All modules'],
      ['Data', 'Data workspace'],
      ['Planner', 'Operations and allocation'],
      ['Business Analyst', 'Allocation and review'],
    ].map(([role, description]) => <li className="screen-panel screen-list-row" key={role}>
      <strong>{role}</strong><span className="screen-subtitle">{description}</span>
    </li>)}
  </ul>
}
