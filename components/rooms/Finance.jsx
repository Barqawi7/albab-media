import RoomShell, { StatusPill, fmtDate } from './_RoomShell';

const moneyFields = [
  { key: 'txn_date',    label: 'Date',         section: 'Income', type: 'date' },
  { key: 'source',      label: 'Source',       section: 'Income' },
  { key: 'client',      label: 'Client',       section: 'Income' },
  { key: 'amount_aed',  label: 'Amount AED',   section: 'Income', type: 'currency_aed' },
  { key: 'category',    label: 'Category',     section: 'Detail' },
  { key: 'status',      label: 'Status',       section: 'Detail', type: 'select', options: ['pending', 'received', 'cancelled'] },
  { key: 'method',      label: 'Method',       section: 'Detail', type: 'select', options: ['bank', 'cash', 'paypal', 'stripe', 'other'] },
  { key: 'invoice_ref', label: 'Invoice ref',  section: 'Detail' },
  { key: 'notes',       label: 'Notes',        section: 'Detail', multiline: true, full: true },
];

const moneyColumns = [
  { key: 'txn_date',   label: 'Date',     flex: 0.8, format: fmtDate },
  { key: 'source',     label: 'Source',   flex: 1.4 },
  { key: 'client',     label: 'Client',   flex: 1 },
  { key: 'category',   label: 'Category', flex: 1 },
  { key: 'amount_aed', label: 'Amount',   flex: 0.9, align: 'right', type: 'currency_aed' },
  { key: 'status',     label: 'Status',   flex: 0.8, render: (v) => <StatusPill value={v} /> },
];

const expFields = [
  { key: 'txn_date',   label: 'Date',        section: 'Expense', type: 'date' },
  { key: 'vendor',     label: 'Vendor',      section: 'Expense' },
  { key: 'amount_aed', label: 'Amount AED',  section: 'Expense', type: 'currency_aed' },
  { key: 'category',   label: 'Category',    section: 'Expense' },
  { key: 'method',     label: 'Method',      section: 'Detail', type: 'select', options: ['bank', 'cash', 'card', 'other'] },
  { key: 'recurring',  label: 'Recurring',   section: 'Detail', type: 'select', options: ['true', 'false'] },
  { key: 'receipt_url',label: 'Receipt URL', section: 'Detail' },
  { key: 'notes',      label: 'Notes',       section: 'Detail', multiline: true, full: true },
];

const expColumns = [
  { key: 'txn_date',   label: 'Date',     flex: 0.8, format: fmtDate },
  { key: 'vendor',     label: 'Vendor',   flex: 1.4 },
  { key: 'category',   label: 'Category', flex: 1.1 },
  { key: 'method',     label: 'Method',   flex: 0.7 },
  { key: 'amount_aed', label: 'Amount',   flex: 0.9, align: 'right', type: 'currency_aed' },
  { key: 'recurring',  label: 'Recurring',flex: 0.7, render: (v) => v === true || v === 'true' ? 'yes' : '—' },
];

export default function Finance() {
  return (
    <RoomShell
      title="Finance"
      group="Business"
      tabs={[
        { key: 'finance_money',    label: 'Money in', fields: moneyFields, columns: moneyColumns, addLabel: 'Income',  defaults: { status: 'pending' } },
        { key: 'finance_expenses', label: 'Expenses', fields: expFields,   columns: expColumns,   addLabel: 'Expense', defaults: { recurring: 'false' } },
      ]}
    />
  );
}
