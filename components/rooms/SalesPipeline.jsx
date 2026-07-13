import { useEffect, useState } from 'react';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { useCrud } from '../../lib/useCrud';
import { Toast } from '../Toast';
import { KPIBox, fmtCompact } from './_RoomShell';
import {
  PageHeader, InlineText, InlineNumber, IconButton, btnPrimary, errorBox,
} from '../ui';

// SALES → Sales Pipeline. A full opportunity board. Stages flow left→right.
// When a deal is moved to "awarded" it auto-generates an invoice (number +
// amount) in Invoices and marks the linked Quotation awarded — so Quotations,
// Invoices, Cash Flow and the Pipeline all stay connected. The whole award is
// undoable.

const STAGES = [
  { key: 'prospect',  label: 'Prospect',  color: theme.textDim },
  { key: 'funnel',    label: 'Funnel',    color: theme.blue },
  { key: 'upside',    label: 'Upside',    color: '#A78BFA' },
  { key: 'committed', label: 'Committed', color: theme.gold },
  { key: 'awarded',   label: 'Awarded',   color: theme.green },
  { key: 'dropped',   label: 'Dropped',   color: theme.amber },
  { key: 'lost',      label: 'Lost',      color: theme.red },
];
const OPEN_STAGES = new Set(['prospect', 'funnel', 'upside', 'committed']);

export default function SalesPipeline() {
  const crud = useCrud('pipeline_opportunities', { label: 'opportunity' });
  const { rows, loading, error, add, update, updateSilent, remove, setError, undo } = crud;

  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('quotations')
        .select('id,client,quotation_number,status')
        .order('created_at', { ascending: false });
      setQuotations(data || []);
    })();
  }, []);

  const quoteOptions = [
    { value: '', label: '— link quotation —' },
    ...quotations.map((q) => ({ value: q.id, label: `${q.quotation_number || '#?'} · ${q.client || 'no client'}` })),
  ];

  function moveStage(opp, newStage) {
    if (newStage === opp.stage) return;
    if (newStage === 'awarded' && opp.stage !== 'awarded') { award(opp); return; }
    update(opp, { stage: newStage });
  }

  // Award automation: create invoice + update quotation + flip stage, all undoable.
  async function award(opp) {
    const { count } = await supabase.from('invoices').select('id', { count: 'exact', head: true });
    const year = new Date().getFullYear();
    const invoiceNumber = `INV-${year}-${String((count || 0) + 1).padStart(4, '0')}`;
    const value = Number(opp.value_aed) || 0;

    const { data: inv, error: invErr } = await supabase
      .from('invoices')
      .insert({
        client: opp.client || null,
        vertical: opp.name || null,
        invoice_number: invoiceNumber,
        revenue: value,
        amount_paid: 0,
        due_payment: value,
      })
      .select()
      .single();
    if (invErr) { setError(`Award failed creating invoice: ${invErr.message}`); return; }

    // Linked quotation → awarded
    let prevQuoStatus = null;
    if (opp.quotation_id) {
      const linked = quotations.find((q) => q.id === opp.quotation_id);
      prevQuoStatus = linked?.status ?? null;
      await supabase.from('quotations').update({ status: 'awarded' }).eq('id', opp.quotation_id);
      setQuotations((qs) => qs.map((q) => (q.id === opp.quotation_id ? { ...q, status: 'awarded' } : q)));
    }

    const before = opp;
    await updateSilent(opp, { stage: 'awarded', invoice_number: invoiceNumber });

    undo.show(`Awarded — invoice ${invoiceNumber} created${opp.quotation_id ? ' · quotation marked awarded' : ''}.`, async () => {
      await supabase.from('invoices').delete().eq('id', inv.id);
      if (opp.quotation_id) {
        await supabase.from('quotations').update({ status: prevQuoStatus }).eq('id', opp.quotation_id);
        setQuotations((qs) => qs.map((q) => (q.id === opp.quotation_id ? { ...q, status: prevQuoStatus } : q)));
      }
      await updateSilent(before, { stage: before.stage, invoice_number: before.invoice_number ?? null });
    });
  }

  // KPIs
  const openValue = rows.filter((r) => OPEN_STAGES.has(r.stage)).reduce((a, r) => a + (Number(r.value_aed) || 0), 0);
  const awardedValue = rows.filter((r) => r.stage === 'awarded').reduce((a, r) => a + (Number(r.value_aed) || 0), 0);
  const awardedCount = rows.filter((r) => r.stage === 'awarded').length;

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <PageHeader
        group="Sales"
        title="Sales Pipeline"
        right={<button onClick={() => add({ name: '', client: '', stage: 'prospect', value_aed: 0 })} style={btnPrimary}>+ Opportunity</button>}
      />

      {error && <div style={errorBox}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 20 }}>
        <KPIBox label="Open pipeline"   value={openValue}    loading={loading} suffix="AED" />
        <KPIBox label="Awarded value"   value={awardedValue} loading={loading} color={theme.green} suffix="AED" />
        <KPIBox label="Awarded deals"   value={awardedCount} loading={loading} color={theme.green} />
        <KPIBox label="Opportunities"   value={rows.length}  loading={loading} />
      </div>

      <div style={{ fontSize: 11, color: theme.textMuted, margin: '10px 0 0' }}>
        Move a card to <strong style={{ color: theme.green }}>Awarded</strong> to auto-create its invoice and mark the linked quotation awarded. Undo reverses all of it.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${STAGES.length}, minmax(210px, 1fr))`, gap: 10, marginTop: 16, overflowX: 'auto', paddingBottom: 8 }}>
        {STAGES.map((st) => {
          const items = rows.filter((r) => (r.stage || 'prospect') === st.key);
          const colValue = items.reduce((a, r) => a + (Number(r.value_aed) || 0), 0);
          return (
            <div key={st.key} style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 10, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
              <div style={{ padding: '9px 11px', borderBottom: `1px solid ${theme.border}`, borderTop: `2px solid ${st.color}`, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: st.color, textTransform: 'uppercase', letterSpacing: 0.6 }}>{st.label}</span>
                  <span style={{ fontSize: 11, color: theme.textMuted }}>{items.length}</span>
                </div>
                <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                  {colValue ? `${fmtCompact(colValue)} AED` : '—'}
                </div>
              </div>
              <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.length === 0 && <div style={{ color: theme.textMuted, fontSize: 11, textAlign: 'center', padding: '10px 0' }}>—</div>}
                {items.map((r) => (
                  <div key={r.id} style={{ background: theme.bg3, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                      <InlineText value={r.name} onCommit={(v) => update(r, { name: v })} placeholder="Opportunity" style={{ fontWeight: 600, border: '1px solid transparent', background: 'transparent', padding: '3px 4px' }} />
                      <IconButton title="Delete" danger onClick={() => remove(r)}>✕</IconButton>
                    </div>
                    <InlineText value={r.client} onCommit={(v) => update(r, { client: v })} placeholder="Client" style={{ fontSize: 12, padding: '5px 7px' }} />
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: theme.textMuted }}>AED</span>
                      <InlineNumber value={r.value_aed} onCommit={(v) => update(r, { value_aed: v })} align="right" style={{ padding: '5px 7px' }} />
                    </div>
                    <select
                      value={r.quotation_id || ''}
                      onChange={(e) => update(r, { quotation_id: e.target.value || null })}
                      title="Linked quotation"
                      style={selectStyle}
                    >
                      {quoteOptions.map((o) => <option key={o.value || 'none'} value={o.value}>{o.label}</option>)}
                    </select>
                    <select
                      value={r.stage || 'prospect'}
                      onChange={(e) => moveStage(r, e.target.value)}
                      title="Move stage"
                      style={{ ...selectStyle, color: theme.text }}
                    >
                      {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                    {r.stage === 'awarded' && r.invoice_number && (
                      <div style={{ fontSize: 11, color: theme.green, fontWeight: 600 }}>🧾 {r.invoice_number}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}

const selectStyle = {
  background: theme.bg2, color: theme.textDim,
  border: `1px solid ${theme.border}`, borderRadius: 6,
  padding: '5px 7px', fontSize: 12, outline: 'none', cursor: 'pointer', width: '100%',
};
