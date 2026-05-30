import RoomShell, { StatusPill, fmtDate, fmtNumber } from './_RoomShell';

const fields = [
  { key: 'title',        label: 'Title',        section: 'Content', full: true },
  { key: 'type',         label: 'Type',         section: 'Content', type: 'select', options: ['reel', 'post', 'video', 'carousel', 'blog', 'story'] },
  { key: 'platform',     label: 'Platform',     section: 'Content', type: 'select', options: ['instagram', 'tiktok', 'youtube', 'x', 'web'] },
  { key: 'status',       label: 'Status',       section: 'Pipeline', type: 'select', options: ['idea', 'scripting', 'filming', 'editing', 'scheduled', 'published'] },
  { key: 'publish_date', label: 'Publish date', section: 'Pipeline', type: 'date' },
  { key: 'client',       label: 'Client',       section: 'Context' },
  { key: 'campaign',     label: 'Campaign',     section: 'Context' },
  { key: 'link',         label: 'Link',         section: 'Context' },
  { key: 'views',        label: 'Views',        section: 'Context', type: 'number' },
  { key: 'notes',        label: 'Notes',        section: 'Context', multiline: true, full: true },
];

const columns = [
  { key: 'title',        label: 'Title',    flex: 2.2 },
  { key: 'type',         label: 'Type',     flex: 0.7 },
  { key: 'platform',     label: 'Platform', flex: 0.9 },
  { key: 'client',       label: 'Client',   flex: 1 },
  { key: 'publish_date', label: 'Publish',  flex: 0.8, format: fmtDate },
  { key: 'views',        label: 'Views',    flex: 0.7, align: 'right', format: fmtNumber },
  { key: 'status',       label: 'Status',   flex: 0.9, render: (v) => <StatusPill value={v} /> },
];

export default function Content() {
  return (
    <RoomShell
      title="Content"
      group="Content & Marketing"
      tabs={[{ key: 'content', label: 'Content', fields, columns, addLabel: 'Content', defaults: { status: 'idea' } }]}
    />
  );
}
