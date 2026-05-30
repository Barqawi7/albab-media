import RoomShell, { StatusPill, fmtDate } from './_RoomShell';

const fields = [
  { key: 'name',       label: 'Name',       section: 'Event' },
  { key: 'type',       label: 'Type',       section: 'Event', placeholder: 'conference, launch, dinner…' },
  { key: 'event_date', label: 'Date',       section: 'Event', type: 'date' },
  { key: 'status',     label: 'Status',     section: 'Event', type: 'select', options: ['planned', 'confirmed', 'done', 'cancelled'] },
  { key: 'location',   label: 'Venue',      section: 'Location' },
  { key: 'city',       label: 'City',       section: 'Location' },
  { key: 'country',    label: 'Country',    section: 'Location' },
  { key: 'client',     label: 'Client',     section: 'Location' },
  { key: 'budget_aed', label: 'Budget AED', section: 'Money', type: 'currency_aed' },
  { key: 'spent_aed',  label: 'Spent AED',  section: 'Money', type: 'currency_aed' },
  { key: 'link',       label: 'Link',       section: 'Notes' },
  { key: 'notes',      label: 'Notes',      section: 'Notes', multiline: true, full: true },
];

const columns = [
  { key: 'name',       label: 'Name',     flex: 1.8 },
  { key: 'event_date', label: 'Date',     flex: 0.8, format: fmtDate },
  { key: 'city',       label: 'Where',    flex: 1.2, render: (_, r) => [r.location, r.city].filter(Boolean).join(' · ') || '—' },
  { key: 'client',     label: 'Client',   flex: 1 },
  { key: 'budget_aed', label: 'Budget',   flex: 0.8, align: 'right', type: 'currency_aed' },
  { key: 'status',     label: 'Status',   flex: 0.9, render: (v) => <StatusPill value={v} /> },
];

export default function Events() {
  return (
    <RoomShell
      title="Events"
      group="Content & Marketing"
      tabs={[{ key: 'events', label: 'Events', fields, columns, addLabel: 'Event', defaults: { status: 'planned' } }]}
    />
  );
}
