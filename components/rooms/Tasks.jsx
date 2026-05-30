import RoomShell, { StatusPill, fmtDate } from './_RoomShell';

const fields = [
  { key: 'title',    label: 'Title',    section: 'Task', full: true },
  { key: 'status',   label: 'Status',   section: 'Task', type: 'select', options: ['todo', 'doing', 'done'] },
  { key: 'priority', label: 'Priority', section: 'Task', type: 'select', options: ['low', 'med', 'high'] },
  { key: 'due_date', label: 'Due date', section: 'Task', type: 'date' },
  { key: 'tags',     label: 'Tags',     section: 'Task', placeholder: 'comma-separated' },
  { key: 'notes',    label: 'Notes',    section: 'Task', multiline: true, full: true },
];

const columns = [
  { key: 'title',    label: 'Title',    flex: 2.4 },
  { key: 'priority', label: 'Priority', flex: 0.7, render: (v) => <StatusPill value={v} palette={{ high: '#EF4444', med: '#F59E0B', low: '#9BA3AF' }} /> },
  { key: 'due_date', label: 'Due',      flex: 0.9, format: fmtDate },
  { key: 'tags',     label: 'Tags',     flex: 1.2 },
  { key: 'status',   label: 'Status',   flex: 0.8, render: (v) => <StatusPill value={v} /> },
];

export default function Tasks() {
  return (
    <RoomShell
      title="Tasks"
      group="Personal"
      tabs={[{ key: 'tasks', label: 'Tasks', fields, columns, addLabel: 'Task', defaults: { status: 'todo', priority: 'med' } }]}
    />
  );
}
