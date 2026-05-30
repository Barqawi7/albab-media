import RoomShell, { StatusPill, fmtDate } from './_RoomShell';

const fields = [
  { key: 'campaign',   label: 'Campaign',    section: 'Campaign' },
  { key: 'client',     label: 'Client',      section: 'Campaign' },
  { key: 'channel',    label: 'Channel',     section: 'Campaign', type: 'select', options: ['instagram', 'tiktok', 'google', 'meta', 'outdoor', 'email', 'other'] },
  { key: 'status',     label: 'Status',      section: 'Campaign', type: 'select', options: ['planned', 'live', 'paused', 'done', 'cancelled'] },
  { key: 'start_date', label: 'Start date',  section: 'Timeline', type: 'date' },
  { key: 'end_date',   label: 'End date',    section: 'Timeline', type: 'date' },
  { key: 'budget_aed', label: 'Budget AED',  section: 'Money', type: 'currency_aed' },
  { key: 'spent_aed',  label: 'Spent AED',   section: 'Money', type: 'currency_aed' },
  { key: 'kpi',        label: 'KPI',         section: 'Results', placeholder: 'reach, CPM, conversions…' },
  { key: 'results',    label: 'Results',     section: 'Results', multiline: true, full: true },
  { key: 'link',       label: 'Link',        section: 'Results' },
  { key: 'notes',      label: 'Notes',       section: 'Results', multiline: true, full: true },
];

const columns = [
  { key: 'campaign',   label: 'Campaign', flex: 1.8 },
  { key: 'client',     label: 'Client',   flex: 1 },
  { key: 'channel',    label: 'Channel',  flex: 0.9 },
  { key: 'start_date', label: 'Start',    flex: 0.8, format: fmtDate },
  { key: 'budget_aed', label: 'Budget',   flex: 0.8, align: 'right', type: 'currency_aed' },
  { key: 'spent_aed',  label: 'Spent',    flex: 0.8, align: 'right', type: 'currency_aed' },
  { key: 'status',     label: 'Status',   flex: 0.9, render: (v) => <StatusPill value={v} /> },
];

export default function Marketing() {
  return (
    <RoomShell
      title="Marketing"
      group="Content & Marketing"
      tabs={[{ key: 'marketing_updates', label: 'Campaigns', fields, columns, addLabel: 'Campaign', defaults: { status: 'planned' } }]}
    />
  );
}
