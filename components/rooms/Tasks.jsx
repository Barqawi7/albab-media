import { useState } from 'react';
import { theme } from '../../lib/theme';
import { useCrud } from '../../lib/useCrud';
import { Toast } from '../Toast';
import { PageHeader, InlineSelect, IconButton, btnGhost, errorBox } from '../ui';

// PERSONAL → Tasks. A simple weekly to-do board — one column per day of the
// current week, plus a Backlog column for undated tasks. Everything saves to
// Supabase (tasks table) with undo.

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function mondayOf(date) {
  const d = new Date(date);
  const shift = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - shift);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(d, n) { const x = new Date(d); x.setDate(x.getDate() + n); return x; }

export default function Tasks() {
  const { rows, loading, error, add, update, remove, undo } =
    useCrud('tasks', { order: 'created_at', ascending: true, label: 'task' });
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = addDays(mondayOf(new Date()), weekOffset * 7);
  const days = DAY_NAMES.map((_, i) => ymd(addDays(weekStart, i)));
  const daySet = new Set(days);
  const todayStr = ymd(new Date());

  const backlog = rows.filter((r) => !r.due_date);
  const outside = rows.filter((r) => r.due_date && !daySet.has(r.due_date)).length;
  const byDay = (d) => rows.filter((r) => r.due_date === d);

  // Options for reassigning a task's day.
  const dayOptions = [
    { value: '', label: 'Backlog' },
    ...days.map((d, i) => ({ value: d, label: `${DAY_NAMES[i]} ${d.slice(8)}/${d.slice(5, 7)}` })),
  ];

  const weekTitle = `${weekStart.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – ${addDays(weekStart, 6).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}`;

  function Column({ title, dateStr, items, isBacklog }) {
    const isToday = dateStr === todayStr;
    return (
      <div style={{ background: theme.bg2, border: `1px solid ${isToday ? theme.gold + '77' : theme.border}`, borderRadius: 10, display: 'flex', flexDirection: 'column', minHeight: 160 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderBottom: `1px solid ${theme.border}` }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: isToday ? theme.gold : theme.textDim, textTransform: 'uppercase', letterSpacing: 0.6 }}>{title}</div>
            {dateStr && <div style={{ fontSize: 10, color: theme.textMuted }}>{dateStr.slice(8)}/{dateStr.slice(5, 7)}</div>}
          </div>
          <button
            onClick={() => add({ title: '', status: 'todo', priority: 'med', due_date: isBacklog ? null : dateStr })}
            title="Add task"
            style={{ ...btnGhost, padding: '2px 8px', fontSize: 14, lineHeight: 1 }}
          >+</button>
        </div>
        <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
          {items.length === 0 && <div style={{ color: theme.textMuted, fontSize: 11, textAlign: 'center', padding: '10px 0' }}>—</div>}
          {items.map((r) => {
            const done = String(r.status) === 'done';
            return (
              <div key={r.id} style={{ background: theme.bg3, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '7px 8px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => update(r, { status: done ? 'todo' : 'done' })}
                    style={{ marginTop: 3, accentColor: theme.gold, cursor: 'pointer' }}
                  />
                  <input
                    defaultValue={r.title || ''}
                    key={r.title || r.id}
                    onBlur={(e) => { if (e.target.value !== (r.title || '')) update(r, { title: e.target.value || null }); }}
                    onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
                    placeholder="Task…"
                    style={{
                      flex: 1, background: 'transparent', border: 'none', outline: 'none',
                      color: done ? theme.textMuted : theme.text, fontSize: 13, fontFamily: 'inherit',
                      textDecoration: done ? 'line-through' : 'none', minWidth: 0,
                    }}
                  />
                  <IconButton title="Delete" danger onClick={() => remove(r)}>✕</IconButton>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <InlineSelect
                    value={r.priority || 'med'}
                    options={['low', 'med', 'high']}
                    onCommit={(v) => update(r, { priority: v })}
                    style={{ fontSize: 11, padding: '3px 6px' }}
                  />
                  <select
                    value={daySet.has(r.due_date) ? r.due_date : ''}
                    onChange={(e) => update(r, { due_date: e.target.value || null })}
                    title="Move to day"
                    style={{ flex: 1, background: theme.bg2, color: theme.textDim, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '3px 6px', fontSize: 11, outline: 'none', cursor: 'pointer' }}
                  >
                    {dayOptions.map((o) => <option key={o.value || 'backlog'} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <PageHeader
        group="Personal"
        title="Tasks"
        right={
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button onClick={() => setWeekOffset((w) => w - 1)} style={btnGhost}>‹ Prev</button>
            <button onClick={() => setWeekOffset(0)} style={btnGhost}>This week</button>
            <button onClick={() => setWeekOffset((w) => w + 1)} style={btnGhost}>Next ›</button>
          </div>
        }
      >
        <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 6 }}>
          {weekTitle}{weekOffset === 0 ? ' · this week' : ''}{loading ? ' · loading…' : ''}
        </div>
      </PageHeader>

      {error && <div style={errorBox}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(150px, 1fr))', gap: 10, marginTop: 18, overflowX: 'auto' }}>
        {days.map((d, i) => (
          <Column key={d} title={DAY_NAMES[i]} dateStr={d} items={byDay(d)} />
        ))}
      </div>

      <div style={{ marginTop: 14, maxWidth: 360 }}>
        <Column title={`Backlog${outside ? ` · ${outside} other-week` : ''}`} dateStr={null} items={backlog} isBacklog />
      </div>

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}
