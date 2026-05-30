// Source of truth for sidebar order, room slugs, and labels.
// Round 2: add `component: SomeRoom` to a room entry to replace Placeholder.
import Influencers from './Influencers';

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
      { slug: 'sales', label: 'Sales' },
      { slug: 'finance', label: 'Finance' },
      { slug: 'clients', label: 'Clients' },
    ],
  },
  {
    label: 'People',
    rooms: [
      { slug: 'influencers', label: 'Influencers', component: Influencers },
      { slug: 'models', label: 'Models' },
      { slug: 'connections', label: 'Connections' },
    ],
  },
  {
    label: 'Content & Marketing',
    rooms: [
      { slug: 'marketing', label: 'Marketing' },
      { slug: 'social-algorithm', label: 'Social Algorithm' },
      { slug: 'content', label: 'Content' },
      { slug: 'events', label: 'Events' },
      { slug: 'quick-comments', label: 'Quick Comments' },
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
      { slug: 'tasks', label: 'Tasks' },
      { slug: 'ideas', label: 'Ideas' },
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
