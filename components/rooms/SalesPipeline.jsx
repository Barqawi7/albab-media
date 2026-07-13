import { useEffect, useMemo, useState } from 'react';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { useCrud } from '../../lib/useCrud';
import { Toast } from '../Toast';
import { KPIBox } from './_RoomShell';
import { PageHeader, InlineText, IconButton, btnPrimary, errorBox } from '../ui';

// SALES → Sales Pipeline.
//  · Funnel = quotations counted by status (Awarded / Dropped / Lost / Pending).
//  · Active board = sales_leads grouped by their `stage`, filterable by `pool`
//    (Focused / Important / Marketing). Stage columns are derived from the data,
//    so nothing is hardcoded. Cards are editable and save to Supabase with undo.

const FUNNEL = ['Awarded', 'Dropped', 'Lost', 'Pending'];
const FUNNEL_COLOR = { Awarded: theme.green, Dropped: theme.amber, Lost: theme.red, Pending: theme.blue };

export default function SalesPipeline() {
  const { rows, loading, error, add, update, remove, undo } =
    useCrud('sales_leads', { order: 'created_at', ascending: true, label: 'lead' });

  const [quotations, setQuotations] = useState([]);
  const [pool, setPool] = useState('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('quotations').select('status');
      setQuotations(data || []);
    })();
  }, []);

  // Funnel counts (case-insensitive on status)
  const funnel = useMemo(() => {
    const c = Object.fromEntries(FUNNEL.map((s) => [s, 0]));
    for (const q of quotations) {
      const key = FUNNEL.find((s) => s.toLowerCase() === String(q.status || '').toLowerCase());
      if (key) c[key]++;
    }
    return c;
  }, [quotations]);
  const funnelTotal = quotations.length;
  const winRate = funnelTotal ? Math.round((funnel.Awarded / funnelTotal) * 100) : 0;

  // Pools + stages derived from data
  const pools = useMemo(() => {
    const set = new Set();
    for (const r of rows) if (r.pool) set.add(r.pool);
    return Array.from(set).sort();
  }, [rows]);

  const poolRows = pool === 'all' ? rows : rows.filter((r) => r.pool === pool);

  const allStages = useMemo(() => {
    const set = new Set();
    for (const r of rows) set.add(r.stage || 'Unstaged');
    return Array.from(set).sort();
  }, [rows]);

  const boardStages = useMemo(() => {
    const set = new Set();
    for (const r of poolRows) set.add(r.stage || 'Unstaged');
    return Array.from(set).sort();
  }, [poolRows]);

  function addLead(stage) {
    add({ client: '', stage, pool: pool === 'all' ? null : pool });
  }

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <PageHeader
        group="Sales"
        title="Sales Pipeline"
        right={<button onClick={() => addLead(boardStages[0] || 'New')} style={btnPrimary}>+ Lead</button>}
      />

      {error && <div style={errorBox}>{error}</div>}

      {/* Quotation funnel */}
      <div style={{ fontSize: 12, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700, margin: '22px 0 10px' }}>
        Quotation funnel
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
        <KPIBox label="Quotations" value={funnelTotal} loading={loading} />
        {FUNNEL.map((s) => <KPIBox key={s} label={s} value={funnel[s]} color={FUNNEL_COLOR[s]} />)}
        <KPIBox label="Win rate" value={`${winRate}`} suffix="%" color={theme.green} />
      </div>

      {/* Active board */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, margin: '26px 0 10px' }}>
        <div style={{ fontSize: 12, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700 }}>
          Active pipeline · {poolRows.length} leads
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', ...pools].map((p) => (
            <button key={p} onClick={() => setPool(p)} style={{
              background: pool === p ? theme.goldTint : 'transparent',
              color: pool === p ? theme.gold : theme.textDim,
              border: `1px solid ${pool === p ? theme.gold : theme.border}`,
              borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>{p === 'all' ? 'All pools' : p}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: theme.textMuted, fontSize: 13, padding: '20px 0' }}>Loading…</div>
      ) : boardStages.length === 0 ? (
        <div style={{ color: theme.textMuted, fontSize: 13, padding: '20px 0' }}>No leads yet. Import sales_leads.csv, then refresh.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${boardStages.length}, minmax(210px, 1fr))`, gap: 10, overflowX: 'auto', paddingBottom: 8 }}>
          {boardStages.map((stage) => {
            const items = poolRows.filter((r) => (r.stage || 'Unstaged') === stage);
            return (
              <div key={stage} style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 10, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
                <div style={{ padding: '9px 11px', borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: theme.gold, textTransform: 'uppercase', letterSpacing: 0.5 }}>{stage}</span>
                  <span style={{ fontSize: 11, color: theme.textMuted }}>{items.length}</span>
                </div>
                <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.length === 0 && <div style={{ color: theme.textMuted, fontSize: 11, textAlign: 'center', padding: '10px 0' }}>—</div>}
                  {items.map((r) => (
                    <div key={r.id} style={{ background: theme.bg3, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                        <InlineText value={r.client} onCommit={(v) => update(r, { client: v })} placeholder="Client" style={{ fontWeight: 600, border: '1px solid transparent', background: 'transparent', padding: '3px 4px' }} />
                        <IconButton title="Delete" danger onClick={() => remove(r)}>✕</IconButton>
                      </div>
                      {r.spoc && <div style={{ fontSize: 11, color: theme.textMuted }}>SPOC: {r.spoc}</div>}
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: theme.textMuted }}>Value</span>
                        <InlineText value={r.value} onCommit={(v) => update(r, { value: v })} placeholder="—" style={{ fontSize: 12, padding: '4px 6px' }} />
                      </div>
                      <select
                        value={r.stage || 'Unstaged'}
                        onChange={(e) => update(r, { stage: e.target.value })}
                        title="Move stage"
                        style={{ background: theme.bg2, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '5px 7px', fontSize: 12, outline: 'none', cursor: 'pointer', width: '100%' }}
                      >
                        {allStages.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {r.pool && <div style={{ fontSize: 10, color: theme.textMuted }}>{r.pool}</div>}
                    </div>
                  ))}
                  <button onClick={() => addLead(stage)} style={{ background: 'transparent', color: theme.textMuted, border: `1px dashed ${theme.border}`, borderRadius: 6, padding: '5px', fontSize: 12, cursor: 'pointer' }}>+ add</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}
