import { Home, SelectRole, SignIn } from './public-pages.js'
import {
  Administration, AllocationEngine, AllocationResults, DataManagement, MasterData,
  Operations, OperationsDashboard, RestrictionManager, SupplyChainReview, TransactionData,
} from './workspace-pages.js'

export const frames = [
  { route: '/', component: Home },
  { route: '/sign-in', component: SignIn },
  { route: '/sign-in/data', component: SignIn },
  { route: '/roles', component: SelectRole },
  { route: '/data', title: 'Data Management', component: DataManagement },
  { route: '/data/master', title: 'Master Data', component: MasterData },
  { route: '/data/transactions', title: 'Transaction Data', component: TransactionData },
  { route: '/operations', title: 'Supply Chain Operations', component: Operations },
  { route: '/operations/dashboard', title: 'Operations Dashboard', component: OperationsDashboard },
  { route: '/operations/restrictions', title: 'Restriction Manager', component: RestrictionManager },
  { route: '/operations/allocation', title: 'Allocation Engine', component: AllocationEngine },
  { route: '/operations/results', title: 'Allocation Results', component: AllocationResults },
  { route: '/operations/review', title: 'Supply Chain Review', component: SupplyChainReview },
  { route: '/operations/admin', title: 'Administration', component: Administration },
]
