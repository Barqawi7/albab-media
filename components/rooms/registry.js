// Source of truth for sidebar order, room slugs, and labels.
// Round 3 restructure — grouped: Finance / Sales / Agents / Real Estate /
// Connections / Content & Marketing / Personal.
//
// Rooms intentionally left out of the sidebar (old code kept on disk, not routed):
//   Sales.jsx, Finance.jsx, Clients.jsx, Connections.jsx, SocialAlgorithm.jsx,
//   Expenses.jsx (folded into Cash Flow), AIAssistant.jsx.

import Home from './Home';
import CashFlow from './CashFlow';
import Invoices from './Invoices';
import SalesData from './SalesData';
import Gmail from './Gmail';
import Quotations from './Quotations';
import SalesPipeline from './SalesPipeline';
import Influencers from './Influencers';
import FocusedInfluencers from './FocusedInfluencers';
import Models from './Models';
import RealEstate from './RealEstate';
import Maps from './Maps';
import Marketing from './Marketing';
import Content from './Content';
import Events from './Events';
import QuickComments from './QuickComments';
import Tasks from './Tasks';
import Ideas from './Ideas';
import Life from './Life';

export const GROUPS = [
  {
    label: 'Workspace',
    rooms: [
      { slug: 'home', label: 'Home', component: Home },
    ],
  },
  {
    label: 'Finance',
    rooms: [
      { slug: 'cash-flow', label: 'Cash Flow', component: CashFlow },
      { slug: 'invoices',  label: 'Invoices',  component: Invoices },
    ],
  },
  {
    label: 'Sales',
    rooms: [
      { slug: 'sales-data', label: 'Data',           component: SalesData },
      { slug: 'gmail',      label: 'Gmail',          component: Gmail },
      { slug: 'quotations', label: 'Quotations',     component: Quotations },
      { slug: 'pipeline',   label: 'Sales Pipeline', component: SalesPipeline },
    ],
  },
  {
    label: 'Agents',
    rooms: [
      { slug: 'influencers',         label: 'Influencers Data',   component: Influencers },
      { slug: 'influencers-focused', label: 'Focused Influencers', component: FocusedInfluencers },
      { slug: 'models',              label: 'Models Data',        component: Models },
    ],
  },
  {
    label: 'Real Estate',
    rooms: [
      { slug: 'real-estate', label: 'Real Estate', component: RealEstate },
    ],
  },
  {
    label: 'Connections',
    rooms: [
      { slug: 'maps', label: 'Maps (Virtual)', component: Maps },
    ],
  },
  {
    label: 'Content & Marketing',
    rooms: [
      { slug: 'marketing',      label: 'Marketing',      component: Marketing },
      { slug: 'content',        label: 'Content',        component: Content },
      { slug: 'events',         label: 'Events',         component: Events },
      { slug: 'quick-comments', label: 'Quick Comments', component: QuickComments },
    ],
  },
  {
    label: 'Personal',
    rooms: [
      { slug: 'tasks', label: 'Tasks', component: Tasks },
      { slug: 'ideas', label: 'Ideas', component: Ideas },
      { slug: 'life',  label: 'Life',  component: Life },
    ],
  },
];

export const ROOMS = Object.fromEntries(
  GROUPS.flatMap((g) =>
    g.rooms.map((r) => [r.slug, { ...r, group: g.label }])
  )
);

export const DEFAULT_SLUG = 'home';
