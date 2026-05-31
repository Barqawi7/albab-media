import RoomShell, { KPIBox, StatusPill } from './_RoomShell';
import { theme } from '../../lib/theme';

const STATUSES = ['awarded', 'dropped', 'lost', 'pending'];

const fields = [
  { key: 'client',           label: 'Client',           section: 'Quotation' },
  { key: 'quotation_number', label: 'Quotation number', section: 'Quotation' },
  { key: 'status',           label: 'Status',           section: 'Quotation', type: 'select', options: STATUSES },
];

const columns = [
  { key: 'quotation_number', label: '#',      flex: 0.8 },
  { key: 'client',           label: 'Client', flex: 2.2 },
  { key: 'status',           label: 'Status', flex: 0.9, render: (v) => <StatusPill value={v} /> },
];

function kpisFromRows(rows, { loading, totalCount } = {}) {
  const counts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
  for (const r of rows) {
    const s = String(r.status || 'pending').toLowerCase().trim();
    if (counts[s] != null) counts[s]++;
  }
  const total = totalCount || rows.length;
  const winRate = total > 0 ? Math.round((counts.awarded / total) * 100) : 0;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
      <KPIBox label="Total"   value={total}          loading={loading} />
      <KPIBox label="Awarded" value={counts.awarded} loading={loading} color={theme.green} />
      <KPIBox label="Dropped" value={counts.dropped} loading={loading} color={theme.red} />
      <KPIBox label="Lost"    value={counts.lost}    loading={loading} color={theme.red} />
      <KPIBox label="Pending" value={counts.pending} loading={loading} color={theme.amber} />
      <KPIBox label="Win rate" value={`${winRate}`}  loading={loading} suffix="%" />
    </div>
  );
}

export default function Quotations() {
  return (
    <RoomShell
      title="Quotations"
      group="Business"
      tabs={[{
        key: 'quotations', label: 'Quotations',
        fields, columns,
        addLabel: 'Quotation',
        defaults: { status: 'pending' },
        kpisFromRows,
      }]}
    />
  );
}
