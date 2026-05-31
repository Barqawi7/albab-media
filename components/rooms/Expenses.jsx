import RoomShell, { KPIBox } from './_RoomShell';
import { theme } from '../../lib/theme';

const fields = [
  { key: 'item',    label: 'Item',         section: 'Expense' },
  { key: 'amount',  label: 'Amount (AED)', section: 'Expense', type: 'currency_aed' },
];

const columns = [
  { key: 'item',   label: 'Item',   flex: 2.8 },
  { key: 'amount', label: 'Amount', flex: 1, align: 'right', type: 'currency_aed' },
];

function kpisFromRows(rows, { loading } = {}) {
  const total = rows.reduce((a, r) => a + (Number(r.amount) || 0), 0);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
      <KPIBox label="Total Monthly Expenses" value={total} loading={loading} color={theme.amber} suffix="AED" />
    </div>
  );
}

export default function Expenses() {
  return (
    <RoomShell
      title="Expenses"
      group="Business"
      tabs={[{
        key: 'expenses', label: 'Expenses',
        fields, columns,
        addLabel: 'Expense',
        kpisFromRows,
      }]}
    />
  );
}
