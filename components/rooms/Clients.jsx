import RoomShell, { StatusPill } from './_RoomShell';

const fields = [
  { key: 'name',           label: 'Name',           section: 'Identity' },
  { key: 'type',           label: 'Type',           section: 'Identity', type: 'select', options: ['brand', 'agency', 'individual'] },
  { key: 'industry',       label: 'Industry',       section: 'Identity' },
  { key: 'country',        label: 'Country',        section: 'Identity' },
  { key: 'city',           label: 'City',           section: 'Identity' },

  { key: 'contact_person', label: 'Contact person', section: 'Contact' },
  { key: 'email',          label: 'Email',          section: 'Contact' },
  { key: 'phone',          label: 'Phone',          section: 'Contact' },
  { key: 'whatsapp',       label: 'WhatsApp',       section: 'Contact' },

  { key: 'status',         label: 'Status',         section: 'Status', type: 'select', options: ['active', 'lead', 'dormant'] },
  { key: 'since',          label: 'Client since',   section: 'Status', type: 'date' },
  { key: 'notes',          label: 'Notes',          section: 'Status', multiline: true, full: true },
];

const columns = [
  { key: 'name',     label: 'Name',     flex: 2 },
  { key: 'type',     label: 'Type',     flex: 1 },
  { key: 'industry', label: 'Industry', flex: 1.2 },
  { key: 'country',  label: 'Country',  flex: 1 },
  { key: 'status',   label: 'Status',   flex: 0.9, render: (v) => <StatusPill value={v} /> },
];

export default function Clients() {
  return (
    <RoomShell
      title="Clients"
      group="Business"
      tabs={[{ key: 'clients', label: 'Clients', fields, columns, addLabel: 'Client', defaults: { status: 'active' } }]}
    />
  );
}
