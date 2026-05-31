import { useEffect, useState } from 'react';
import Link from 'next/link';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { fmtCompact, KPIBox } from './_RoomShell';
import { fetchAllRows } from '../../lib/fetchAll';

const TILES = [
  { slug: 'real-estate',  table: 'real_estate',                label: 'Properties' },
  { slug: 'influencers',  table: 'influencers_comprehensive',  label: 'Influencers' },
  { slug: 'invoices',     table: 'invoices',                   label: 'Invoices' },
  { slug: 'quotations',   table: 'quotations',                 label: 'Quotations' },
  { slug: 'expenses',     table: 'expenses',                   label: 'Expenses' },
  { slug: 'models',       table: 'models',                     label: 'Models' },
  { slug: 'clients',      table: 'clients',                    label: 'Clients' },
  { slug: 'connections',  table: 'connections',                label: 'Connections' },
  { slug: 'sales',        table: 'sales_deals',                label: 'Sales deals' },
  { slug: 'content',      table: 'content',                    label: 'Content' },
  { slug: 'marketing',    table: 'marketing_updates',          label: 'Campaigns' },
  { slug: 'events',       table: 'events',                     label: 'Events' },
  { slug: 'tasks',        table: 'tasks',                      label: 'Tasks' },
  { slug: 'ideas',        table: 'ideas',                      label: 'Ideas' },
];

const QUOTATION_STATUSES = ['awarded', 'dropped', 'lost', 'pending'];

export default function Home() {
  const [counts, setCounts] = useState({});
  const [recents, setRecents] = useState({ tasks: [], invoices: [] });
  const [finance, setFinance] = useState({ cash: 0, expenses: 0, pending: 0, collected: 0, revenue: 0 });
  const [quotationCounts, setQuotationCounts] = useState({ awarded: 0, dropped: 0, lost: 0, pending: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      // Per-tile real counts via head: true
      const countResults = await Promise.all(
        TILES.map((t) => supabase.from(t.table).select('id', { count: 'exact', head: true }))
      );
      const map = {};
      TILES.forEach((t, i) => { map[t.table] = countResults[i].count ?? 0; });
      setCounts(map);

      // Recents (small lists)
      const [tasksR, invR] = await Promise.all([
        supabase.from('tasks').select('id,title,status,due_date').neq('status', 'done').order('created_at', { ascending: false }).limit(5),
        supabase.from('invoices').select('id,client,invoice_number,revenue,amount_paid,due_payment').order('created_at', { ascending: false }).limit(5),
      ]);
      setRecents({
        tasks:    tasksR.data || [],
        invoices: invR.data   || [],
      });

      // Finance totals (sum across the relevant tables)
      const [cashR, expR, invAllR, quoAllR] = await Promise.all([
        fetchAllRows('cash_accounts', { select: 'balance' }),
        fetchAllRows('expenses',      { select: 'amount' }),
        fetchAllRows('invoices',      { select: 'revenue,amount_paid,due_payment' }),
        fetchAllRows('quotations',    { select: 'status' }),
      ]);
      const sum = (arr, k) => (arr || []).reduce((a, r) => a + (Number(r[k]) || 0), 0);
      const cash      = sum(cashR.rows, 'balance');
      const expenses  = sum(expR.rows,  'amount');
      const revenue   = sum(invAllR.rows, 'revenue');
      const collected = sum(invAllR.rows, 'amount_paid');
      const pending   = sum(invAllR.rows, 'due_payment');
      setFinance({ cash, expenses, pending, collected, revenue });

      // Quotation counts from the real table
      const qc = { awarded: 0, dropped: 0, lost: 0, pending: 0 };
      for (const r of quoAllR.rows || []) {
        const s = String(r.status || 'pending').toLowerCase().trim();
        if (qc[s] != null) qc[s]++;
      }
      const total = (quoAllR.rows || []).length || (quoAllR.count || 0);
      setQuotationCounts({ ...qc, total });

      setLoading(false);
    })();
  }, []);

  const netNow      = finance.cash - finance.expenses;
  const expectedNet = (finance.cash + finance.pending) - finance.expenses;
  const winRate     = quotationCounts.total > 0 ? Math.round((quotationCounts.awarded / quotationCounts.total) * 100) : 0;

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
          Workspace
        </div>
        <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: theme.gold }}>Home</h1>
      </div>

      <h2 style={sectionHeading}>Cash position</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <KPIBox label="Total Cash"      value={finance.cash}    loading={loading} suffix="AED" />
        <KPIBox label="Pending Revenue" value={finance.pending} loading={loading} color={theme.blue}  suffix="AED" />
        <KPIBox label="Expenses"        value={finance.expenses} loading={loading} color={theme.amber} suffix="AED" />
        <KPIBox label="Net Now"         value={netNow} loading={loading} color={netNow >= 0 ? theme.green : theme.red} suffix="AED" />
        <KPIBox label="Expected Net"    value={expectedNet} loading={loading} color={expectedNet >= 0 ? theme.green : theme.red} suffix="AED" />
      </div>

      <h2 style={sectionHeading}>Quotations</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        <KPIBox label="Total"   value={quotationCounts.total}   loading={loading} />
        <KPIBox label="Awarded" value={quotationCounts.awarded} loading={loading} color={theme.green} />
        <KPIBox label="Dropped" value={quotationCounts.dropped} loading={loading} color={theme.red} />
        <KPIBox label="Lost"    value={quotationCounts.lost}    loading={loading} color={theme.red} />
        <KPIBox label="Pending" value={quotationCounts.pending} loading={loading} color={theme.amber} />
        <KPIBox label="Win rate" value={`${winRate}`} loading={loading} suffix="%" />
      </div>

      <h2 style={sectionHeading}>At a glance</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        {TILES.map((t) => (
          <Link key={t.table} href={`/${t.slug}`} style={{ textDecoration: 'none' }}>
            <div style={tileStyle}>
              <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{t.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: theme.gold, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                {loading ? '—' : fmtCompact(counts[t.table] ?? 0)}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, marginTop: 22 }}>
        <RecentList title="Open tasks" href="/tasks" items={recents.tasks}
                    render={(t) => (
                      <>
                        <div style={{ color: theme.text }}>{t.title || '(untitled)'}</div>
                        <div style={{ color: theme.textMuted, fontSize: 11 }}>
                          {t.due_date || 'no due date'} · {t.status}
                        </div>
                      </>
                    )} />
        <RecentList title="Latest invoices" href="/invoices" items={recents.invoices}
                    render={(i) => (
                      <>
                        <div style={{ color: theme.text }}>
                          {i.client || '(no client)'}
                          {i.invoice_number ? <span style={{ color: theme.textMuted }}> · #{i.invoice_number}</span> : null}
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: 11 }}>
                          {`Revenue ${fmtCompact(i.revenue)} · Paid ${fmtCompact(i.amount_paid)} · Pending ${fmtCompact(i.due_payment)} AED`}
                        </div>
                      </>
                    )} />
      </div>
    </div>
  );
}

function RecentList({ title, href, items, render }) {
  return (
    <div style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '14px 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700 }}>{title}</div>
        <Link href={href} style={{ fontSize: 11, color: theme.gold, textDecoration: 'none' }}>open →</Link>
      </div>
      {items.length === 0 ? (
        <div style={{ color: theme.textMuted, fontSize: 13, padding: '12px 0' }}>—</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map((it) => (
            <div key={it.id} style={{ padding: '8px 0', borderTop: `1px solid ${theme.border}`, fontSize: 13 }}>
              {render(it)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const sectionHeading = {
  fontSize: 12, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 1.4,
  fontWeight: 700, margin: '28px 0 10px',
};

const tileStyle = {
  background: theme.bg2, border: `1px solid ${theme.border}`,
  borderRadius: 10, padding: '14px 16px', cursor: 'pointer',
  transition: 'background .12s, border-color .12s',
};
