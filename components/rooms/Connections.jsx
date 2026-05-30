import RoomShell, { StatusPill, fmtDate } from './_RoomShell';

const fields = [
  { key: 'name',         label: 'Name',         section: 'Identity' },
  { key: 'role_title',   label: 'Role / title', section: 'Identity' },
  { key: 'company',      label: 'Company',      section: 'Identity' },
  { key: 'industry',     label: 'Industry',     section: 'Identity' },
  { key: 'country',      label: 'Country',      section: 'Identity' },
  { key: 'city',         label: 'City',         section: 'Identity' },

  { key: 'how_met',      label: 'How we met',   section: 'Context', placeholder: 'GITEX 2025, intro from X…' },
  { key: 'last_contact', label: 'Last contact', section: 'Context', type: 'date' },
  { key: 'relationship', label: 'Relationship', section: 'Context', type: 'select', options: ['active', 'warm', 'cold', 'lost'] },

  { key: 'email',        label: 'Email',        section: 'Contact' },
  { key: 'phone',        label: 'Phone',        section: 'Contact' },
  { key: 'whatsapp',     label: 'WhatsApp',     section: 'Contact' },
  { key: 'instagram',    label: 'Instagram',    section: 'Contact', prefix: '@' },
  { key: 'linkedin',     label: 'LinkedIn',     section: 'Contact' },
  { key: 'notes',        label: 'Notes',        section: 'Contact', multiline: true, full: true },
];

const columns = [
  { key: 'name',         label: 'Name',         flex: 1.6 },
  { key: 'role_title',   label: 'Role',         flex: 1.2 },
  { key: 'company',      label: 'Company',      flex: 1.2 },
  { key: 'city',         label: 'Location',     flex: 1, render: (_, r) => [r.city, r.country].filter(Boolean).join(', ') || '—' },
  { key: 'last_contact', label: 'Last contact', flex: 0.9, format: fmtDate },
  { key: 'relationship', label: 'Status',       flex: 0.8, render: (v) => <StatusPill value={v} /> },
];

export default function Connections() {
  return (
    <RoomShell
      title="Connections"
      group="People"
      tabs={[{ key: 'connections', label: 'Connections', fields, columns, addLabel: 'Connection', defaults: { relationship: 'active' } }]}
    />
  );
}
