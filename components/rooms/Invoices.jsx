import RoomShell, { KPIBox } from './_RoomShell';
import { theme } from '../../lib/theme';

const fields = [
  { key: 'client',          label: 'Client',          section: 'Invoice' },
  { key: 'vertical',        label: 'Vertical',        section: 'Invoice' },
  { key: 'invoice_number',  label: 'Invoice number',  section: 'Invoice' },
  { key: 'revenue',         label: 'Revenue (AED)',   section: 'Amounts', type: 'currency_aed' },
  { key: 'amount_paid',     label: 'Amount paid',     section: 'Amounts', type: 'currency_aed' },
  { key: 'due_payment',     label: 'Due payment',     section: 'Amounts', type: 'currency_aed' },
];

const columns = [
  { key: 'invoice_number', label: '#',           flex: 0.8 },
  { key: 'client',         label: 'Client',      flex: 1.6 },
  { key: 'vertical',       label: 'Vertical',    flex: 1 },
  { key: 'revenue',        label: 'Revenue',     flex: 0.9, align: 'right', type: 'currency_aed' },
  { key: 'amount_paid',    label: 'Paid',        flex: 0.9, align: 'right', type: 'currency_aed' },
  { key: 'due_payment',    label: 'Due',         flex: 0.9, align: 'right', type: 'currency_aed' },
];

const sum = (rows, k) => rows.reduce((a, r) => a + (Number(r[k]) || 0), 0);

function kpisFromRows(rows, { loading } = {}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
      <KPIBox label="Total Revenue"   value={sum(rows, 'revenue')}     loading={loading} suffix="AED" />
      <KPIBox label="Total Collected" value={sum(rows, 'amount_paid')} loading={loading} color={theme.green} suffix="AED" />
      <KPIBox label="Total Pending"   value={sum(rows, 'due_payment')} loading={loading} color={theme.amber} suffix="AED" />
    </div>
  );
}

export default function Invoices() {
  return (
    <RoomShell
      title="Invoices"
      group="Business"
      tabs={[{
        key: 'invoices', label: 'Invoices',
        fields, columns,
        addLabel: 'Invoice',
        kpisFromRows,
      }]}
    />
  );
}
