import SiliconFlowV2Home from './SiliconFlowV2Home.js'
import SiliconFlowV2DataManagement from './SiliconFlowV2DataManagement.js'
import SiliconFlowV2MasterData from './SiliconFlowV2MasterData.js'
import SiliconFlowV2TransactionData from './SiliconFlowV2TransactionData.js'
import SiliconFlowV2SupplyChainOperations from './SiliconFlowV2SupplyChainOperations.js'
import SiliconFlowV2OperationsDashboard from './SiliconFlowV2OperationsDashboard.js'
import SiliconFlowV2RestrictionManager from './SiliconFlowV2RestrictionManager.js'
import SiliconFlowV2AllocationEngine from './SiliconFlowV2AllocationEngine.js'
import SiliconFlowV2AllocationResults from './SiliconFlowV2AllocationResults.js'
import SiliconFlowV2SupplyChainReview from './SiliconFlowV2SupplyChainReview.js'
import SiliconFlowV2Administration from './SiliconFlowV2Administration.js'
import SiliconFlowV2SelectRole from './SiliconFlowV2SelectRole.js'
import SiliconFlowV2DataManagementCompact from './SiliconFlowV2DataManagementCompact.js'
import SiliconFlowV2MasterDataCompact from './SiliconFlowV2MasterDataCompact.js'
import SiliconFlowV2TransactionDataCompact from './SiliconFlowV2TransactionDataCompact.js'
import SiliconFlowV2SupplyChainOperationsCompact from './SiliconFlowV2SupplyChainOperationsCompact.js'
import SiliconFlowV2OperationsDashboardCompact from './SiliconFlowV2OperationsDashboardCompact.js'
import SiliconFlowV2RestrictionManagerCompact from './SiliconFlowV2RestrictionManagerCompact.js'
import SiliconFlowV2AllocationEngineCompact from './SiliconFlowV2AllocationEngineCompact.js'
import SiliconFlowV2AllocationResultsCompact from './SiliconFlowV2AllocationResultsCompact.js'
import SiliconFlowV2SupplyChainReviewCompact from './SiliconFlowV2SupplyChainReviewCompact.js'
import SiliconFlowV2AdministrationCompact from './SiliconFlowV2AdministrationCompact.js'
import SiliconFlowV2SignIn from './SiliconFlowV2SignIn.js'
import SiliconFlowV2SignInDataManagement from './SiliconFlowV2SignInDataManagement.js'

export const frames = [
  { nodeId: '1:2', route: '/', compact: false, component: SiliconFlowV2Home },
  { nodeId: '1:20', route: '/data', compact: false, component: SiliconFlowV2DataManagement },
  { nodeId: '1:45', route: '/data/master', compact: false, component: SiliconFlowV2MasterData },
  { nodeId: '1:97', route: '/data/transactions', compact: false, component: SiliconFlowV2TransactionData },
  { nodeId: '1:128', route: '/operations', compact: false, component: SiliconFlowV2SupplyChainOperations },
  { nodeId: '1:167', route: '/operations/dashboard', compact: false, component: SiliconFlowV2OperationsDashboard },
  { nodeId: '1:212', route: '/operations/restrictions', compact: false, component: SiliconFlowV2RestrictionManager },
  { nodeId: '1:255', route: '/operations/allocation', compact: false, component: SiliconFlowV2AllocationEngine },
  { nodeId: '1:289', route: '/operations/results', compact: false, component: SiliconFlowV2AllocationResults },
  { nodeId: '1:347', route: '/operations/review', compact: false, component: SiliconFlowV2SupplyChainReview },
  { nodeId: '1:383', route: '/operations/admin', compact: false, component: SiliconFlowV2Administration },
  { nodeId: '13:2', route: '/roles', compact: false, component: SiliconFlowV2SelectRole },
  { nodeId: '13:25', route: '/data', compact: true, component: SiliconFlowV2DataManagementCompact },
  { nodeId: '13:74', route: '/data/master', compact: true, component: SiliconFlowV2MasterDataCompact },
  { nodeId: '13:150', route: '/data/transactions', compact: true, component: SiliconFlowV2TransactionDataCompact },
  { nodeId: '13:205', route: '/operations', compact: true, component: SiliconFlowV2SupplyChainOperationsCompact },
  { nodeId: '13:268', route: '/operations/dashboard', compact: true, component: SiliconFlowV2OperationsDashboardCompact },
  { nodeId: '13:337', route: '/operations/restrictions', compact: true, component: SiliconFlowV2RestrictionManagerCompact },
  { nodeId: '13:404', route: '/operations/allocation', compact: true, component: SiliconFlowV2AllocationEngineCompact },
  { nodeId: '13:462', route: '/operations/results', compact: true, component: SiliconFlowV2AllocationResultsCompact },
  { nodeId: '13:544', route: '/operations/review', compact: true, component: SiliconFlowV2SupplyChainReviewCompact },
  { nodeId: '13:604', route: '/operations/admin', compact: true, component: SiliconFlowV2AdministrationCompact },
  { nodeId: '4023:2', route: '/sign-in', compact: false, component: SiliconFlowV2SignIn },
  { nodeId: '4069:2', route: '/sign-in/data', compact: false, component: SiliconFlowV2SignInDataManagement },
]
