import { useEffect, useState } from 'react';
import Link from 'next/link';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';

const TILES = [
  { slug: 'influencers',  table: 'influencers_comprehensive', label: 'Influencers' },
  { slug: 'models',       table: 'models',                    label: 'Models' },
  { slug: 'clients',      table: 'clients',                   label: 'Clients' },
  { slug: 'connections',  table: 'connections',               label: 'Connections' },
  { slug: 'sales',        table: 'sales_deals',               label: 'Sales deals' },
  { slug: 'finance',      table: 'finance_money',             label: 'Income entries' },
  { slug: 'finance',      table: 'finance_expenses',          label: 'Expenses' },
  { slug: 'content',      table: 'content',                   label: 'Content' },
  { slug: 'marketing',    table: 'marketing_updates',         label: 'Campaigns' },
  { slug: 'events',       table: 'events',                    label: 'Events' },
  { slug: 'tasks',        table: 'tasks',                     label: 'Tasks' },
  { slug: 'ideas',        table: 'ideas',                     label: 'Ideas' },
];

export default function Home() {
  const [counts, setCounts] = useState({});
  const [recents, setRecents] = useState({ tasks: [], deals: [], content: [] });
  const [moneyTotals, setMoneyTotals] = useState({ income: 0, expenses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const countResults = await Promise.all(
        TILES.map((t) => supabase.from(t.table).select('id', { count: 'exact', head: true }))
      );
      const map = {};
      TILES.forEach((t, i) => { map[t.table] = countResults[i].count ?? 0; });
      setCounts(map);

      const [tasksR, dealsR, contentR, incomeR, expensesR] = await Promise.all([
        supabase.from('tasks').select('id,title,status,due_date').neq('status', 'done').order('created_at', { ascending: false }).limit(5),
        supabase.from('sales_deals').select('id,deal_name,client,stage,value_aed').neq('stage', 'won').neq('stage', 'lost').order('created_at', { ascending: false }).limit(5),
        supabase.from('content').select('id,title,platform,status,publish_date').order('created_at', { ascending: false }).limit(5),
        supabase.from('finance_money').select('amount_aed,status').eq('status', 'received'),
        supabase.from('finance_expenses').select('amount_aed'),
      ]);
      setRecents({
        tasks:   tasksR.data   || [],
        deals:   dealsR.data   || [],
        content: contentR.data || [],
      });
      const sum = (arr, k) => (arr || []).reduce((a, r) => a + (Number(r[k]) || 0), 0);
      setMoneyTotals({
        income:   sum(incomeR.data,   'amount_aed'),
        expenses: sum(expensesR.data, 'amount_aed'),
      });
      setLoading(false);
    })();
  }, []);

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
          Workspace
        </div>
        <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: theme.gold }}>Home</h1>
      </div>

      {/* Big money cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginTop: 22 }}>
        <BigStat label="Income received (AED)" value={moneyTotals.income} color={theme.green} />
        <BigStat label="Expenses (AED)"         value={moneyTotals.expenses} color={theme.amber} />
        <BigStat label="Net (AED)"              value={moneyTotals.income - moneyTotals.expenses}
                  color={moneyTotals.income >= moneyTotals.expenses ? theme.green : theme.red} />
      </div>

      {/* Room tiles */}
      <h2 style={sectionHeading}>At a glance</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10 }}>
        {TILES.map((t) => (
          <Link key={t.table} href={`/${t.slug}`} style={{ textDecoration: 'none' }}>
            <div style={tileStyle}>
              <div style={{ fontSize: 11, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1 }}>{t.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: theme.gold, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>
                {loading ? '—' : (counts[t.table] ?? 0).toLocaleString()}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recents */}
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
        <RecentList title="Active deals" href="/sales" items={recents.deals}
                    render={(d) => (
                      <>
                        <div style={{ color: theme.text }}>{d.deal_name || '(unnamed)'}</div>
                        <div style={{ color: theme.textMuted, fontSize: 11 }}>
                          {d.client || '—'} · {d.stage} · {d.value_aed ? Number(d.value_aed).toLocaleString() + ' AED' : '—'}
                        </div>
                      </>
                    )} />
        <RecentList title="Latest content" href="/content" items={recents.content}
                    render={(c) => (
                      <>
                        <div style={{ color: theme.text }}>{c.title || '(untitled)'}</div>
                        <div style={{ color: theme.textMuted, fontSize: 11 }}>
                          {[c.platform, c.status, c.publish_date].filter(Boolean).join(' · ') || '—'}
                        </div>
                      </>
                    )} />
      </div>
    </div>
  );
}

function BigStat({ label, value, color }) {
  return (
    <div style={{
      padding: '18px 20px', borderRadius: 12, background: theme.bg2,
      border: `1px solid ${theme.border}`,
    }}>
      <div style={{ fontSize: 10, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 1.2, fontWeight: 700 }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 800, color, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
        {Math.round(value || 0).toLocaleString()}
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
