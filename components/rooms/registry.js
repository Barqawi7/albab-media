// Source of truth for sidebar order, room slugs, and labels.
// Round 2: add `component: SomeRoom` to a room entry to replace Placeholder.
import Influencers from './Influencers';
import Clients from './Clients';
import Models from './Models';
import Connections from './Connections';
import Tasks from './Tasks';
import Ideas from './Ideas';
import Events from './Events';
import QuickComments from './QuickComments';
import Marketing from './Marketing';
import SocialAlgorithm from './SocialAlgorithm';
import Content from './Content';
import Sales from './Sales';

export const GROUPS = [
  {
    label: 'Workspace',
    rooms: [
      { slug: 'home', label: 'Home' },
    ],
  },
  {
    label: 'Business',
    rooms: [
      { slug: 'sales', label: 'Sales', component: Sales },
      { slug: 'finance', label: 'Finance' },
      { slug: 'clients', label: 'Clients', component: Clients },
    ],
  },
  {
    label: 'People',
    rooms: [
      { slug: 'influencers', label: 'Influencers', component: Influencers },
      { slug: 'models', label: 'Models', component: Models },
      { slug: 'connections', label: 'Connections', component: Connections },
    ],
  },
  {
    label: 'Content & Marketing',
    rooms: [
      { slug: 'marketing', label: 'Marketing', component: Marketing },
      { slug: 'social-algorithm', label: 'Social Algorithm', component: SocialAlgorithm },
      { slug: 'content', label: 'Content', component: Content },
      { slug: 'events', label: 'Events', component: Events },
      { slug: 'quick-comments', label: 'Quick Comments', component: QuickComments },
    ],
  },
  {
    label: 'Comms',
    rooms: [
      { slug: 'gmail', label: 'Gmail' },
      { slug: 'ai-assistant', label: 'AI Assistant' },
    ],
  },
  {
    label: 'Personal',
    rooms: [
      { slug: 'tasks', label: 'Tasks', component: Tasks },
      { slug: 'ideas', label: 'Ideas', component: Ideas },
      { slug: 'maps', label: 'Maps' },
      { slug: 'life', label: 'Life' },
    ],
  },
];

export const ROOMS = Object.fromEntries(
  GROUPS.flatMap((g) =>
    g.rooms.map((r) => [r.slug, { ...r, group: g.label }])
  )
);

export const DEFAULT_SLUG = 'home';
