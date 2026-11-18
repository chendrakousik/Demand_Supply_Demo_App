import { PrototypeAction, PrototypeText, PrototypeUpload } from '../prototype-action.js'
import { WorkspaceBanner, WorkspaceCard } from './workspace-layout.js'
import { CardIcon } from './figma-card-icons.js'
import { FigmaIcon } from './figma-icon.js'
import { MasterDataIcon } from './SiliconFlowV2MasterData.js'
import { administrationArtwork } from './SiliconFlowV2Administration.js'
import { allocationEngineArtwork } from './SiliconFlowV2AllocationEngine.js'
import { allocationResultsArtwork } from './SiliconFlowV2AllocationResults.js'
import { operationsDashboardArtwork } from './SiliconFlowV2OperationsDashboard.js'
import { restrictionManagerArtwork } from './SiliconFlowV2RestrictionManager.js'
import { supplyChainReviewArtwork } from './SiliconFlowV2SupplyChainReview.js'
import { transactionDataArtwork } from './SiliconFlowV2TransactionData.js'

const operationsCards = [
  ['Operations Dashboard', 'Track demand, supply and fulfillment'],
  ['Restriction Manager', 'Configure allocation rules and commitments'],
  ['Allocation Engine', 'Run controlled semiconductor allocations'],
  ['Allocation Results', 'Examine assignments, shortages and exports'],
  ['Supply Chain Review', 'Assess fulfillment, risk and exceptions'],
] as const

const masterCards = [
  ['Product Master', 'products', 'SKU'],
  ['Customer Master', 'customers', 'CUS'],
  ['Location Master', 'locations', 'FAB'],
  ['Product-Location Mapping', 'mappings', 'MAP'],
  ['Customer Priority Rules', 'scope', 'PRI'],
  ['Allocation Policies', 'scope', 'POL'],
  ['Planning Calendar', 'scope', 'CAL'],
  ['Lead Time Parameters', 'scope', 'LT'],
] as const

const metrics = [
  ['Demand', 'dashboard-demand', 'DEM'], ['Eligible Supply', 'dashboard-supply', 'SUP'],
  ['Supply Gap', 'dashboard-gap', 'GAP'], ['Fulfillment', 'dashboard-fulfillment', 'FUL'],
] as const

export function Operations() {
  return <>
    <WorkspaceBanner image="/figma/1-128-adc58.png" />
    <p className="screen-subtitle screen-intro">Choose an operations workspace.</p>
    <div className="screen-card-grid">
      {operationsCards.map(([title, description], index) =>
        <WorkspaceCard key={title} title={title} description={description} artwork={<CardIcon name={`SupplyChainOperations / ${title}`} />}
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
        artwork={<CardIcon name="DataManagement / Master Data" />} action="Button / Master Data" />
      <WorkspaceCard title="Transaction Data" description="Upload and review demand and supply records."
        artwork={<CardIcon name="DataManagement / Transaction Data" />} action="Button / Transaction Data" />
    </div>
  </>
}

export function MasterData() {
  return <div className="screen-card-grid workspace-section">
    {masterCards.map(([title, resource, icon]) =>
      <WorkspaceCard key={title} title={title} description={
        resource === 'scope' ? 'Pending workflow' : resource === 'products' || resource === 'customers' ? 'View and edit records' : 'View records'
      } artwork={<MasterDataIcon icon={icon} />} cornerArtwork action={'Panel / ' + resource} />)}
  </div>
}

export function TransactionData() {
  return <section className="workspace-section">
    <h2>Demand and Supply CSV upload templates</h2>
    <div className="screen-card-grid">
      {(['demand', 'supply'] as const).map(type =>
        <section key={type} className="screen-panel screen-panel--corner-artwork">
          <FigmaIcon {...transactionDataArtwork[type === 'demand' ? 'DEM' : 'SUP']} />
          <h3>{type === 'demand' ? 'Demand CSV' : 'Supply CSV'}</h3>
          <PrototypeUpload type={type} className="screen-upload" />
          <PrototypeText value={type + '-columns'} className="screen-subtitle" />
        </section>)}
    </div>
    <div className="screen-actions">
      <PrototypeAction action="Button / Continue to Allocation Engine" className="screen-button screen-button--primary screen-button--with-icon">
        Continue to Allocation Engine → <CardIcon name="TransactionData / Continue to Allocation Engine" />
      </PrototypeAction>
    </div>
  </section>
}

export function OperationsDashboard() {
  return <div className="workspace-section">
    <div className="screen-metric-grid">
      {metrics.map(([label, value, icon]) => <div key={value} className="screen-panel screen-panel--corner-artwork screen-metric">
        <FigmaIcon {...operationsDashboardArtwork[icon]} />
        <p className="screen-subtitle">{label}</p>
        <PrototypeText value={value}>—</PrototypeText>
      </div>)}
    </div>
    <section className="screen-panel screen-panel--corner-artwork workspace-section">
      <FigmaIcon {...operationsDashboardArtwork.KPI} />
      <h2>Planning workflow</h2>
      <p className="screen-subtitle">Upload supply data → Validate → Configure restrictions → Run allocation → Review</p>
      <div className="screen-actions">
        <PrototypeAction action="Button / Open Allocation Planning" className="screen-button screen-button--primary screen-button--with-icon">
          Open Allocation Planning → <CardIcon name="OperationsDashboard / Open Allocation Planning" />
        </PrototypeAction>
      </div>
    </section>
  </div>
}

export function RestrictionManager() {
  const restrictions = [
    ['Customer priorities', 'PRI'], ['Date windows', 'WIN'], ['Quantity caps', 'CAP'],
    ['Minimum lots', 'LOT'], ['Commitment protection', 'COM'],
  ] as const
  return <ul className="screen-list workspace-section">
    {restrictions.map(([label, icon], index) => <li className="screen-panel screen-panel--corner-artwork screen-list-row" key={label}>
      <FigmaIcon {...restrictionManagerArtwork[icon]} />
      <strong>{label}</strong>
      <PrototypeAction action={index === 0 ? 'Panel / restrictions' : 'Panel / scope'} className="screen-button">
        Configure / Review
      </PrototypeAction>
    </li>)}
  </ul>
}

export function AllocationEngine() {
  return <section className="screen-panel screen-panel--corner-artwork workspace-section">
    <FigmaIcon {...allocationEngineArtwork.CPU} />
    <h2>Ready to run allocation?</h2>
    <PrototypeText value="run-readiness" className="screen-subtitle" />
    <p className="screen-subtitle">Allocation requires an authorized user to click Run Allocation.</p>
    <div className="screen-actions">
      <PrototypeAction action="Button / Run Allocation" className="screen-button screen-button--primary screen-button--with-icon">
        Run Allocation → <CardIcon name="AllocationEngine / Run Allocation" />
      </PrototypeAction>
    </div>
  </section>
}

export function AllocationResults() {
  const columns = ['Customer', 'Demand', 'Allocated', 'Shortage', 'Fill rate']
  return <div className="workspace-section">
    <div className="screen-panel screen-panel--table-artwork screen-table">
      <FigmaIcon {...allocationResultsArtwork.RPT} />
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
      {([['review-fulfillment', 'FUL'], ['review-risk', 'GAP'], ['review-allocated', 'RISK']] as const).map(([value, icon]) =>
        <div key={value} className="screen-panel screen-panel--corner-artwork screen-metric">
        <FigmaIcon {...supplyChainReviewArtwork[icon]} />
        <PrototypeText value={value}>—</PrototypeText>
      </div>)}
    </div>
    <div className="screen-actions">
      <PrototypeAction action="Panel / results" className="screen-button screen-button--with-icon">
        Shortage analysis by product and customer <FigmaIcon {...supplyChainReviewArtwork.REV} />
      </PrototypeAction>
    </div>
  </div>
}

export function Administration() {
  return <ul className="screen-list workspace-section">
    {([
      ['Admin', 'All modules', 'USR'],
      ['Data', 'Data workspace', 'ROL'],
      ['Planner', 'Operations and allocation', 'SEC'],
      ['Business Analyst', 'Allocation and review', 'CFG'],
    ] as const).map(([role, description, icon]) => <li className="screen-panel screen-panel--corner-artwork screen-list-row" key={role}>
      <FigmaIcon {...administrationArtwork[icon]} />
      <strong>{role}</strong><span className="screen-subtitle">{description}</span>
    </li>)}
  </ul>
}
