import RoomShell, { StatusPill, KPIBox } from './_RoomShell';
import { theme } from '../../lib/theme';

// SALES → Data. Backed by the existing `clients` table so no data is lost in the
// restructure — the old Clients room is retired but its records live on here.

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

function kpisFromRows(rows, { loading, totalCount } = {}) {
  const active = rows.filter((r) => String(r.status).toLowerCase() === 'active').length;
  const leads  = rows.filter((r) => String(r.status).toLowerCase() === 'lead').length;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
      <KPIBox label="Total records" value={totalCount ?? rows.length} loading={loading} />
      <KPIBox label="Active"        value={active} loading={loading} color={theme.green} />
      <KPIBox label="Leads"         value={leads}  loading={loading} color={theme.amber} />
    </div>
  );
}

export default function SalesData() {
  return (
    <RoomShell
      title="Data"
      group="Sales"
      tabs={[{
        key: 'clients', label: 'Sales Data',
        fields, columns,
        addLabel: 'Record',
        defaults: { status: 'lead' },
        kpisFromRows,
      }]}
    />
  );
}
