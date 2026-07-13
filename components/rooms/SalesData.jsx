import RoomShell, { KPIBox } from './_RoomShell';
import { theme } from '../../lib/theme';

// SALES → Data. Flat, editable table of every sales lead (sales_leads) — the raw
// data behind the Sales Pipeline board.

const fields = [
  { key: 'client',        label: 'Client',        section: 'Lead' },
  { key: 'vertical',      label: 'Vertical',      section: 'Lead' },
  { key: 'pool',          label: 'Pool',          section: 'Lead', type: 'select', options: ['Focused', 'Important', 'Marketing'] },
  { key: 'stage',         label: 'Stage',         section: 'Lead' },
  { key: 'lead_type',     label: 'Lead type',     section: 'Lead' },
  { key: 'value',         label: 'Value',         section: 'Lead' },
  { key: 'quarter',       label: 'Quarter',       section: 'Lead' },

  { key: 'spoc',          label: 'SPOC',          section: 'Contact' },
  { key: 'position',      label: 'Position',      section: 'Contact' },
  { key: 'phone',         label: 'Phone',         section: 'Contact' },
  { key: 'email',         label: 'Email',         section: 'Contact' },

  { key: 'action_needed', label: 'Action needed', section: 'Notes', multiline: true, full: true },
  { key: 'comments',      label: 'Comments',      section: 'Notes', multiline: true, full: true },
];

const columns = [
  { key: 'client',   label: 'Client',   flex: 1.8 },
  { key: 'vertical', label: 'Vertical', flex: 1.2 },
  { key: 'stage',    label: 'Stage',    flex: 1, editable: true },
  { key: 'pool',     label: 'Pool',     flex: 0.9 },
  { key: 'value',    label: 'Value',    flex: 0.9, align: 'right', editable: true },
  { key: 'spoc',     label: 'SPOC',     flex: 1 },
];

function kpisFromRows(rows, { loading, totalCount } = {}) {
  const counts = rows.reduce((acc, r) => { const p = r.pool || 'Other'; acc[p] = (acc[p] || 0) + 1; return acc; }, {});
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
      <KPIBox label="Total leads" value={totalCount ?? rows.length} loading={loading} />
      <KPIBox label="Focused"     value={counts.Focused || 0}   loading={loading} color={theme.gold} />
      <KPIBox label="Important"   value={counts.Important || 0} loading={loading} color={theme.blue} />
      <KPIBox label="Marketing"   value={counts.Marketing || 0} loading={loading} color={theme.green} />
    </div>
  );
}

export default function SalesData() {
  return (
    <RoomShell
      title="Data"
      group="Sales"
      tabs={[{
        key: 'sales_leads', label: 'Sales Leads',
        fields, columns,
        addLabel: 'Lead',
        defaults: { pool: 'Focused' },
        kpisFromRows,
      }]}
    />
  );
}
