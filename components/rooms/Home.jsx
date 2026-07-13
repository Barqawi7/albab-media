import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { fetchAllRows } from '../../lib/fetchAll';
import { useUndoToast, Toast } from '../Toast';
import { KPIBox, fmtCompact } from './_RoomShell';
import { Card, SectionHeading, AIFeedPlaceholder, EmptyState, btnPrimary } from '../ui';

// WORKSPACE → Home. A command center: cash position, quarter KPIs, today's
// tasks, pending quotations, reminders (+ quick-add), upcoming events, a
// cash-flow mini-trend, a live activity feed, and placeholders for the day
// schedule (Gmail) and AI/marketing news.
//
// Every query is defensive — a table that doesn't exist yet (e.g. before the
// 0021 migration runs) just yields an empty section instead of crashing Home.

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const sum = (arr, k) => (arr || []).reduce((a, r) => a + (Number(r[k]) || 0), 0);

async function safeAll(table, opts) {
  try {
    const { rows, error } = await fetchAllRows(table, opts);
    return error ? [] : (rows || []);
  } catch { return []; }
}

function rel(ts) {
  if (!ts) return '';
  const s = Math.max(0, Math.floor((Date.now() - new Date(ts).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24); if (d < 30) return `${d}d`;
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

export default function Home() {
  const [data, setData] = useState({
    cash: [], expenses: [], invoices: [], quotations: [], tasks: [], events: [], pipeline: [],
  });
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [qaText, setQaText] = useState('');
  const [qaTarget, setQaTarget] = useState('task');
  const undo = useUndoToast();

  const today = ymd(new Date());

  async function loadAll() {
    setLoading(true);
    const [cash, expenses, invoices, quotations, tasks, events, pipeline, rem] = await Promise.all([
      safeAll('cash_accounts', { select: 'account,balance,created_at' }),
      safeAll('expenses',      { select: 'item,amount,created_at' }),
      safeAll('finance_invoices', { select: 'client_name,invoice_number,revenue,amount_paid,due_payment,created_at' }),
      safeAll('quotations',    { select: 'client_name,quotation_number,status,created_at' }),
      safeAll('tasks',         { select: 'id,title,status,due_date,created_at' }),
      safeAll('events',        { select: 'name,city,event_date,status,created_at' }),
      safeAll('sales_leads',   { select: 'client,stage,value,created_at' }),
      safeAll('reminders',     { select: 'text,due_date,done,created_at' }),
    ]);
    setData({ cash, expenses, invoices, quotations, tasks, events, pipeline });
    setReminders(rem);
    setLoading(false);
  }

  useEffect(() => { loadAll(); }, []);

  // ---- Finance ----
  const cash = sum(data.cash, 'balance');
  const revenue = sum(data.invoices, 'revenue');
  const collected = sum(data.invoices, 'amount_paid');
  const pending = sum(data.invoices, 'due_payment');
  const expenses = sum(data.expenses, 'amount');
  const net = cash - expenses;

  // ---- Quarter KPIs ----
  const quarter = useMemo(() => {
    const now = new Date();
    const qStart = ymd(new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1));
    const inQ = (ts) => ts && String(ts).slice(0, 10) >= qStart;
    return {
      label: `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`,
      revenue: sum(data.invoices.filter((r) => inQ(r.created_at)), 'revenue'),
      expenses: sum(data.expenses.filter((r) => inQ(r.created_at)), 'amount'),
      awarded: data.pipeline.filter((r) => r.stage === 'awarded' && inQ(r.created_at)).length,
      quotes: data.quotations.filter((r) => inQ(r.created_at)).length,
    };
  }, [data]);

  // ---- Cash-flow mini-trend (last 6 months, net = revenue − expenses) ----
  const trend = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: `${d.getFullYear()}-${pad(d.getMonth() + 1)}`, label: d.toLocaleDateString('en-GB', { month: 'short' }), revenue: 0, expenses: 0 });
    }
    const bucket = (ts, amt, field) => {
      if (!ts) return;
      const m = months.find((x) => x.key === String(ts).slice(0, 7));
      if (m) m[field] += amt;
    };
    data.invoices.forEach((r) => bucket(r.created_at, Number(r.revenue) || 0, 'revenue'));
    data.expenses.forEach((r) => bucket(r.created_at, Number(r.amount) || 0, 'expenses'));
    months.forEach((m) => { m.net = m.revenue - m.expenses; });
    return months;
  }, [data]);

  // ---- Lists ----
  const todaysTasks = data.tasks
    .filter((t) => String(t.status) !== 'done')
    .sort((a, b) => String(a.due_date || '9999').localeCompare(String(b.due_date || '9999')))
    .slice(0, 6);
  const pendingQuotes = data.quotations.filter((q) => String(q.status || 'pending').toLowerCase() === 'pending').slice(0, 6);
  const upcomingEvents = data.events
    .filter((e) => e.event_date && e.event_date >= today)
    .sort((a, b) => String(a.event_date).localeCompare(String(b.event_date)))
    .slice(0, 6);

  const activity = useMemo(() => {
    const feed = [];
    data.invoices.forEach((r) => feed.push({ ts: r.created_at, icon: '🧾', label: `Invoice ${r.invoice_number || ''}`.trim(), sub: r.client_name || 'no client' }));
    data.quotations.forEach((r) => feed.push({ ts: r.created_at, icon: '📄', label: `Quotation ${r.quotation_number || ''}`.trim(), sub: `${r.client_name || ''} · ${r.status || ''}` }));
    data.pipeline.forEach((r) => feed.push({ ts: r.created_at, icon: '📈', label: r.client || 'Lead', sub: `${r.stage || ''}` }));
    data.tasks.forEach((r) => feed.push({ ts: r.created_at, icon: '✓', label: r.title || 'Task', sub: r.status || '' }));
    data.events.forEach((r) => feed.push({ ts: r.created_at, icon: '📅', label: r.name || 'Event', sub: r.city || '' }));
    return feed.filter((x) => x.ts).sort((a, b) => String(b.ts).localeCompare(String(a.ts))).slice(0, 12);
  }, [data]);

  // ---- Reminders (live) ----
  async function addReminder(text, dueDate = null) {
    const { data: row, error } = await supabase.from('reminders').insert({ text, due_date: dueDate, done: false }).select().single();
    if (error) return;
    setReminders((xs) => [row, ...xs]);
    undo.show('Reminder added.', async () => {
      await supabase.from('reminders').delete().eq('id', row.id);
      setReminders((xs) => xs.filter((r) => r.id !== row.id));
    });
  }
  async function toggleReminder(r) {
    setReminders((xs) => xs.map((x) => (x.id === r.id ? { ...x, done: !x.done } : x)));
    await supabase.from('reminders').update({ done: !r.done }).eq('id', r.id);
  }
  async function deleteReminder(r) {
    setReminders((xs) => xs.filter((x) => x.id !== r.id));
    await supabase.from('reminders').delete().eq('id', r.id);
    undo.show('Reminder deleted.', async () => {
      const { data: row } = await supabase.from('reminders').insert({ id: r.id, text: r.text, due_date: r.due_date, done: r.done }).select().single();
      if (row) setReminders((xs) => [row, ...xs]);
    });
  }
  async function toggleTask(t) {
    const nextStatus = String(t.status) === 'done' ? 'todo' : 'done';
    setData((d) => ({ ...d, tasks: d.tasks.map((x) => (x.id === t.id ? { ...x, status: nextStatus } : x)) }));
    await supabase.from('tasks').update({ status: nextStatus }).eq('id', t.id);
  }

  // ---- Quick add ----
  async function quickAdd() {
    const v = qaText.trim();
    if (!v) return;
    setQaText('');
    if (qaTarget === 'reminder') { addReminder(v); return; }
    const table = qaTarget === 'idea' ? 'ideas' : 'tasks';
    const payload = qaTarget === 'idea' ? { title: v, status: 'raw' } : { title: v, status: 'todo', priority: 'med' };
    const { data: row, error } = await supabase.from(table).insert(payload).select().single();
    if (error) return;
    if (qaTarget === 'task') setData((d) => ({ ...d, tasks: [row, ...d.tasks] }));
    undo.show(`Added ${qaTarget}.`, async () => {
      await supabase.from(table).delete().eq('id', row.id);
      if (qaTarget === 'task') setData((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== row.id) }));
    });
  }

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>Workspace</div>
          <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: theme.gold }}>Command Center</h1>
        </div>
        <div style={{ fontSize: 12, color: theme.textMuted }}>{quarter.label}{loading ? ' · loading…' : ''}</div>
      </div>

      {/* Quick-add bar */}
      <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
        <select value={qaTarget} onChange={(e) => setQaTarget(e.target.value)} style={{ ...selectStyle, width: 130 }}>
          <option value="task">Task</option>
          <option value="reminder">Reminder</option>
          <option value="idea">Idea</option>
        </select>
        <input
          value={qaText}
          onChange={(e) => setQaText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && quickAdd()}
          placeholder={`Quick add a ${qaTarget}…  (Enter)`}
          style={{ ...inputStyle, flex: 1, minWidth: 240 }}
        />
        <button onClick={quickAdd} style={btnPrimary}>Add</button>
      </div>

      {/* Cash position */}
      <SectionHeading>Cash position</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
        <KPIBox label="Cash"     value={cash}     loading={loading} suffix="AED" />
        <KPIBox label="Revenue"  value={revenue}  loading={loading} color={theme.blue} suffix="AED" />
        <KPIBox label="Expenses" value={expenses} loading={loading} color={theme.amber} suffix="AED" />
        <KPIBox label="Net"      value={net}      loading={loading} color={net >= 0 ? theme.green : theme.red} suffix="AED" />
        <KPIBox label="Pending"  value={pending}  loading={loading} color={theme.textDim} suffix="AED" />
      </div>

      {/* Quarter KPIs */}
      <SectionHeading>{quarter.label} KPIs</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
        <KPIBox label="Q revenue"   value={quarter.revenue}  loading={loading} suffix="AED" />
        <KPIBox label="Q expenses"  value={quarter.expenses} loading={loading} color={theme.amber} suffix="AED" />
        <KPIBox label="Q net"       value={quarter.revenue - quarter.expenses} loading={loading} color={(quarter.revenue - quarter.expenses) >= 0 ? theme.green : theme.red} suffix="AED" />
        <KPIBox label="Deals won"   value={quarter.awarded}  loading={loading} color={theme.green} />
        <KPIBox label="New quotes"  value={quarter.quotes}   loading={loading} />
      </div>

      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14, marginTop: 24, alignItems: 'start' }}>
        {/* Today's tasks */}
        <Card title="Today & upcoming tasks" right={<Link href="/tasks" style={linkStyle}>open →</Link>}>
          <div style={{ padding: '6px 8px' }}>
            {loading ? <EmptyState>Loading…</EmptyState> : todaysTasks.length === 0 ? <EmptyState>Nothing due. 🎉</EmptyState> : (
              todaysTasks.map((t, i) => (
                <div key={t.id || i} style={rowStyle}>
                  <input type="checkbox" checked={String(t.status) === 'done'} onChange={() => toggleTask(t)} style={{ accentColor: theme.gold, cursor: 'pointer' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: theme.text, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title || '(untitled)'}</div>
                    <div style={{ color: theme.textMuted, fontSize: 11 }}>{t.due_date ? (t.due_date === today ? 'today' : t.due_date) : 'no date'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Pending quotations */}
        <Card title="Pending quotations" right={<Link href="/quotations" style={linkStyle}>open →</Link>}>
          <div style={{ padding: '6px 8px' }}>
            {loading ? <EmptyState>Loading…</EmptyState> : pendingQuotes.length === 0 ? <EmptyState>None pending.</EmptyState> : (
              pendingQuotes.map((q, i) => (
                <div key={i} style={rowStyle}>
                  <span style={{ color: theme.amber, fontSize: 14 }}>●</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: theme.text, fontSize: 13 }}>{q.client_name || '(no client)'} {q.quotation_number ? <span style={{ color: theme.textMuted }}>· #{q.quotation_number}</span> : null}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Reminders */}
        <Card title="Reminders" right={<span style={{ fontSize: 11, color: theme.textMuted }}>{reminders.filter((r) => !r.done).length} open</span>}>
          <div style={{ padding: '6px 8px' }}>
            <QuickReminder onAdd={addReminder} />
            {reminders.length === 0 ? <EmptyState>No reminders.</EmptyState> : (
              reminders.slice(0, 8).map((r) => (
                <div key={r.id} style={rowStyle}>
                  <input type="checkbox" checked={!!r.done} onChange={() => toggleReminder(r)} style={{ accentColor: theme.gold, cursor: 'pointer' }} />
                  <div style={{ flex: 1, minWidth: 0, color: r.done ? theme.textMuted : theme.text, fontSize: 13, textDecoration: r.done ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.text}
                  </div>
                  <button onClick={() => deleteReminder(r)} title="Delete" style={xBtn}>✕</button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming events */}
        <Card title="Upcoming events" right={<Link href="/events" style={linkStyle}>open →</Link>}>
          <div style={{ padding: '6px 8px' }}>
            {loading ? <EmptyState>Loading…</EmptyState> : upcomingEvents.length === 0 ? <EmptyState>Nothing scheduled.</EmptyState> : (
              upcomingEvents.map((e, i) => (
                <div key={i} style={rowStyle}>
                  <span style={{ color: theme.gold, fontSize: 12, width: 54, textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>
                    {new Date(e.event_date + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: theme.text, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name || '(unnamed)'}</div>
                    <div style={{ color: theme.textMuted, fontSize: 11 }}>{e.city || ''}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* My day schedule (Gmail-ready placeholder) */}
        <Card title="My day — schedule">
          <div style={{ padding: '12px 14px' }}>
            <AIFeedPlaceholder
              title="Day schedule"
              note="Your Gmail calendar / meetings will render here once Gmail + Calendar are connected. Gmail-ready — no wiring yet."
              lines={3}
            />
          </div>
        </Card>

        {/* AI / marketing news (placeholder) */}
        <Card title="AI & marketing news">
          <div style={{ padding: '12px 14px' }}>
            <AIFeedPlaceholder
              title="AI · marketing digest"
              note="Curated AI + digital-marketing headlines will appear here. Connect your API key later."
              lines={3}
            />
          </div>
        </Card>
      </div>

      {/* Cash-flow mini-trend */}
      <SectionHeading>Cash-flow trend (6 months)</SectionHeading>
      <Card>
        <MiniTrend months={trend} loading={loading} />
      </Card>

      {/* Activity feed */}
      <SectionHeading>Recent activity</SectionHeading>
      <Card>
        <div style={{ padding: '6px 10px' }}>
          {loading ? <EmptyState>Loading…</EmptyState> : activity.length === 0 ? <EmptyState>No recent changes.</EmptyState> : (
            activity.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
                <span style={{ fontSize: 15, width: 22, textAlign: 'center' }}>{a.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: theme.text, fontSize: 13 }}>{a.label}</span>
                  {a.sub && <span style={{ color: theme.textMuted, fontSize: 12 }}> · {a.sub}</span>}
                </div>
                <span style={{ color: theme.textMuted, fontSize: 11 }}>{rel(a.ts)}</span>
              </div>
            ))
          )}
        </div>
      </Card>

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}

function QuickReminder({ onAdd }) {
  const [v, setV] = useState('');
  return (
    <div style={{ display: 'flex', gap: 6, padding: '4px 0 10px' }}>
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && v.trim()) { onAdd(v.trim()); setV(''); } }}
        placeholder="Add a reminder…"
        style={{ ...inputStyle, flex: 1, padding: '6px 8px' }}
      />
      <button onClick={() => { if (v.trim()) { onAdd(v.trim()); setV(''); } }} style={{ ...btnPrimary, padding: '6px 10px', fontSize: 12 }}>+</button>
    </div>
  );
}

function MiniTrend({ months, loading }) {
  if (loading) return <EmptyState>Loading…</EmptyState>;
  const maxAbs = Math.max(1, ...months.map((m) => Math.abs(m.net || 0)));
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, padding: '18px 18px 12px', height: 150 }}>
      {months.map((m) => {
        const h = Math.round((Math.abs(m.net) / maxAbs) * 96);
        const positive = m.net >= 0;
        return (
          <div key={m.key} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 0 }}>
            <div style={{ fontSize: 10, color: theme.textMuted, fontVariantNumeric: 'tabular-nums' }}>{m.net ? fmtCompact(m.net) : ''}</div>
            <div style={{ width: '70%', maxWidth: 46, height: Math.max(3, h), background: positive ? theme.green : theme.red, borderRadius: 4, opacity: 0.85 }} title={`${m.label}: net ${Math.round(m.net)} AED`} />
            <div style={{ fontSize: 11, color: theme.textDim }}>{m.label}</div>
          </div>
        );
      })}
    </div>
  );
}

const inputStyle = {
  background: theme.bg3, color: theme.text,
  border: `1px solid ${theme.border}`, borderRadius: 6,
  padding: '8px 10px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
};
const selectStyle = {
  background: theme.bg3, color: theme.text,
  border: `1px solid ${theme.border}`, borderRadius: 6,
  padding: '8px 10px', fontSize: 13, outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
};
const linkStyle = { fontSize: 11, color: theme.gold, textDecoration: 'none' };
const rowStyle = { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 6px', borderTop: `1px solid ${theme.border}` };
const xBtn = { background: 'transparent', color: theme.textMuted, border: 'none', cursor: 'pointer', fontSize: 13, padding: '0 4px' };
