import RoomShell, { StatusPill, fmtDate } from './_RoomShell';

const dealFields = [
  { key: 'deal_name',       label: 'Deal',            section: 'Deal' },
  { key: 'client',          label: 'Client',          section: 'Deal' },
  { key: 'stage',           label: 'Stage',           section: 'Deal', type: 'select', options: ['lead', 'qualified', 'proposal', 'won', 'lost'] },
  { key: 'value_aed',       label: 'Value AED',       section: 'Deal', type: 'currency_aed' },
  { key: 'probability_pct', label: 'Probability %',   section: 'Pipeline', type: 'number' },
  { key: 'expected_close',  label: 'Expected close',  section: 'Pipeline', type: 'date' },
  { key: 'actual_close',    label: 'Actual close',    section: 'Pipeline', type: 'date' },
  { key: 'source',          label: 'Source',          section: 'Meta' },
  { key: 'owner',           label: 'Owner',           section: 'Meta' },
  { key: 'notes',           label: 'Notes',           section: 'Meta', multiline: true, full: true },
];

const dealColumns = [
  { key: 'deal_name',       label: 'Deal',     flex: 1.8 },
  { key: 'client',          label: 'Client',   flex: 1.2 },
  { key: 'value_aed',       label: 'Value',    flex: 0.9, align: 'right', type: 'currency_aed' },
  { key: 'probability_pct', label: 'Prob %',   flex: 0.6, align: 'right' },
  { key: 'expected_close',  label: 'Close',    flex: 0.8, format: fmtDate },
  { key: 'stage',           label: 'Stage',    flex: 0.9, render: (v) => <StatusPill value={v} /> },
];

const quoteFields = [
  { key: 'number',       label: 'Number',       section: 'Quotation' },
  { key: 'client',       label: 'Client',       section: 'Quotation' },
  { key: 'status',       label: 'Status',       section: 'Quotation', type: 'select', options: ['draft', 'sent', 'accepted', 'rejected', 'expired'] },
  { key: 'sent_date',    label: 'Sent',         section: 'Dates', type: 'date' },
  { key: 'valid_until',  label: 'Valid until',  section: 'Dates', type: 'date' },
  { key: 'items',        label: 'Items',        section: 'Lines', multiline: true, full: true, placeholder: 'one per line' },
  { key: 'subtotal_aed', label: 'Subtotal AED', section: 'Money', type: 'currency_aed' },
  { key: 'vat_aed',      label: 'VAT AED',      section: 'Money', type: 'currency_aed' },
  { key: 'total_aed',    label: 'Total AED',    section: 'Money', type: 'currency_aed' },
  { key: 'notes',        label: 'Notes',        section: 'Money', multiline: true, full: true },
];

const quoteColumns = [
  { key: 'number',      label: 'Number', flex: 1 },
  { key: 'client',      label: 'Client', flex: 1.5 },
  { key: 'total_aed',   label: 'Total',  flex: 1, align: 'right', type: 'currency_aed' },
  { key: 'sent_date',   label: 'Sent',   flex: 0.8, format: fmtDate },
  { key: 'valid_until', label: 'Valid',  flex: 0.8, format: fmtDate },
  { key: 'status',      label: 'Status', flex: 0.9, render: (v) => <StatusPill value={v} /> },
];

export default function Sales() {
  return (
    <RoomShell
      title="Sales"
      group="Business"
      tabs={[
        { key: 'sales_deals',      label: 'Deals',      fields: dealFields,  columns: dealColumns,  addLabel: 'Deal',      defaults: { stage: 'lead' } },
        { key: 'sales_quotations', label: 'Quotations', fields: quoteFields, columns: quoteColumns, addLabel: 'Quotation', defaults: { status: 'draft' } },
      ]}
    />
  );
}
