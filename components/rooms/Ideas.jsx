import RoomShell, { StatusPill } from './_RoomShell';

const fields = [
  { key: 'title',        label: 'Title',    section: 'Idea', full: true },
  { key: 'category',     label: 'Category', section: 'Idea' },
  { key: 'status',       label: 'Status',   section: 'Idea', type: 'select', options: ['raw', 'exploring', 'validated', 'parked', 'done'] },
  { key: 'value_score',  label: 'Value (1-5)',  section: 'Score', type: 'number' },
  { key: 'effort_score', label: 'Effort (1-5)', section: 'Score', type: 'number' },
  { key: 'source',       label: 'Source',   section: 'Detail' },
  { key: 'notes',        label: 'Notes',    section: 'Detail', multiline: true, full: true },
];

const columns = [
  { key: 'title',        label: 'Title',    flex: 2.4 },
  { key: 'category',     label: 'Category', flex: 1.2 },
  { key: 'value_score',  label: 'Value',    flex: 0.5, align: 'right' },
  { key: 'effort_score', label: 'Effort',   flex: 0.5, align: 'right' },
  { key: 'status',       label: 'Status',   flex: 0.9, render: (v) => <StatusPill value={v} /> },
];

export default function Ideas() {
  return (
    <RoomShell
      title="Ideas"
      group="Personal"
      tabs={[{ key: 'ideas', label: 'Ideas', fields, columns, addLabel: 'Idea', defaults: { status: 'raw' } }]}
    />
  );
}
