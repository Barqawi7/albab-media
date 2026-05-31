import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { theme } from '../lib/theme';
import Shell from '../components/Shell';
import { Toast, useUndoToast, LoadingSpinner } from '../components/Toast';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ── ISO week helpers ────────────────────────────────────────────────────────
function isoWeekFromDate(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`;
}

function weekMonday(weekStr) {
  const [y, w] = weekStr.split('-W').map(Number);
  const jan4 = new Date(Date.UTC(y, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const week1Monday = new Date(Date.UTC(y, 0, 4 - jan4Day + 1));
  return new Date(week1Monday.getTime() + (w - 1) * 7 * 86400000);
}

function addWeeks(weekStr, n) {
  const mon = weekMonday(weekStr);
  return isoWeekFromDate(new Date(mon.getTime() + n * 7 * 86400000));
}

function weekLabel(weekStr) {
  const mon = weekMonday(weekStr);
  const sun = new Date(mon.getTime() + 6 * 86400000);
  const fmt = (d) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  return `${fmt(mon)} – ${fmt(sun)}`;
}

const NOW_WEEK = isoWeekFromDate(new Date());

// Shared id→task lookup so drop handlers can resolve the dragged task without
// prop-drilling. Updated on every render of the cells.
const tasksLookup = new Map();

export default function ObjectivesPage({ session }) {
  return (
    <Shell currentSlug={null} userEmail={session?.user?.email}>
      <ObjectivesView />
    </Shell>
  );
}

function ObjectivesView() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startWeek, setStartWeek] = useState(NOW_WEEK);
  const visibleWeeks = useMemo(() => [0, 1, 2, 3].map((i) => addWeeks(startWeek, i)), [startWeek]);
  const undo = useUndoToast();

  async function load() {
    setLoading(true); setError(null);
    const { data, error } = await supabase
      .from('objectives_tasks')
      .select('*')
      .order('position', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });
    if (error) setError(error.message);
    setTasks(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  // Refresh lookup whenever tasks change
  tasksLookup.clear();
  for (const t of tasks) tasksLookup.set(t.id, t);

  const byCell = useMemo(() => {
    const m = new Map();
    for (const t of tasks) {
      const key = `${t.week || ''}|${t.day || ''}`;
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(t);
    }
    return m;
  }, [tasks]);

  function strip(row) {
    const { id, created_at, ...rest } = row;
    return rest;
  }

  async function addTask(week, day) {
    const title = prompt('Task title:');
    if (!title || !title.trim()) return;
    const payload = { title: title.trim(), week: week || null, day: day || null, done: false };
    const { data, error } = await supabase.from('objectives_tasks').insert(payload).select().single();
    if (error) { setError(error.message); return; }
    setTasks((xs) => [...xs, data]);
    undo.show('Added task.', async () => {
      await supabase.from('objectives_tasks').delete().eq('id', data.id);
      setTasks((xs) => xs.filter((t) => t.id !== data.id));
    });
  }

  async function moveTask(task, week, day) {
    const newWeek = week || null;
    const newDay  = day || null;
    if ((task.week || null) === newWeek && (task.day || null) === newDay) return;
    const before = { ...task };
    setTasks((xs) => xs.map((t) => t.id === task.id ? { ...t, week: newWeek, day: newDay } : t));
    const { error } = await supabase
      .from('objectives_tasks')
      .update({ week: newWeek, day: newDay })
      .eq('id', task.id);
    if (error) {
      setError(error.message);
      setTasks((xs) => xs.map((t) => t.id === task.id ? before : t));
      return;
    }
    undo.show('Moved task.', async () => {
      await supabase.from('objectives_tasks').update({ week: before.week, day: before.day }).eq('id', task.id);
      setTasks((xs) => xs.map((t) => t.id === task.id ? before : t));
    });
  }

  async function updateTask(task, patch) {
    const before = { ...task };
    const next = { ...task, ...patch };
    setTasks((xs) => xs.map((t) => t.id === task.id ? next : t));
    const { error } = await supabase.from('objectives_tasks').update(patch).eq('id', task.id);
    if (error) {
      setError(error.message);
      setTasks((xs) => xs.map((t) => t.id === task.id ? before : t));
      return;
    }
    undo.show('Updated task.', async () => {
      await supabase.from('objectives_tasks').update(strip(before)).eq('id', task.id);
      setTasks((xs) => xs.map((t) => t.id === task.id ? before : t));
    });
  }

  async function deleteTask(task) {
    setTasks((xs) => xs.filter((t) => t.id !== task.id));
    const { error } = await supabase.from('objectives_tasks').delete().eq('id', task.id);
    if (error) { setError(error.message); load(); return; }
    undo.show('Deleted task.', async () => {
      const { data } = await supabase.from('objectives_tasks').insert({ id: task.id, ...strip(task) }).select().single();
      if (data) setTasks((xs) => [...xs, data]);
    });
  }

  const counts = useMemo(() => {
    let total = 0, done = 0, thisWeek = 0;
    for (const t of tasks) {
      total++;
      if (t.done) done++;
      if (t.week === NOW_WEEK) thisWeek++;
    }
    return { total, done, thisWeek };
  }, [tasks]);

  return (
    <div style={{ padding: '24px 28px 60px', color: theme.text }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
            Workspace
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: 26, fontWeight: 800, color: theme.gold }}>Objectives</h1>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setStartWeek(addWeeks(startWeek, -1))} style={ghostBtn}>← Week</button>
          <button onClick={() => setStartWeek(NOW_WEEK)}                style={ghostBtn}>Today</button>
          <button onClick={() => setStartWeek(addWeeks(startWeek,  1))} style={ghostBtn}>Week →</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginTop: 12, fontSize: 12, color: theme.textDim, alignItems: 'center' }}>
        <span>{counts.total} tasks total</span>
        <span>{counts.done} done</span>
        <span>{counts.thisWeek} this week ({NOW_WEEK})</span>
        {loading && <LoadingSpinner size={12} />}
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 12, background: 'rgba(239,68,68,0.08)', border: `1px solid ${theme.red}`, borderRadius: 8, color: theme.red, fontSize: 13 }}>
          {error}
        </div>
      )}

      <BacklogRow
        tasks={byCell.get(`|`) || []}
        onAdd={() => addTask(null, null)}
        onDrop={(t) => moveTask(t, null, null)}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
      />

      {visibleWeeks.map((week) => (
        <WeekRow
          key={week}
          week={week}
          isCurrent={week === NOW_WEEK}
          byCell={byCell}
          onAdd={(day) => addTask(week, day)}
          onDrop={(t, day) => moveTask(t, week, day)}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
        />
      ))}

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}

function BacklogRow({ tasks, onAdd, onDrop, onUpdateTask, onDeleteTask }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        setOver(false);
        const id = e.dataTransfer.getData('text/plain');
        const t = tasksLookup.get(id);
        if (t) onDrop(t);
      }}
      style={{
        marginTop: 18, padding: '10px 12px',
        background: theme.bg2, border: `1px solid ${over ? theme.gold : theme.border}`,
        borderRadius: 12, transition: 'border-color .1s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
          Backlog (no week)
        </div>
        <button onClick={onAdd} style={smallBtn}>+ Add</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, minHeight: 40 }}>
        {tasks.length === 0 && <div style={{ color: theme.textMuted, fontSize: 12 }}>Drag tasks here to defer.</div>}
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onUpdate={onUpdateTask} onDelete={onDeleteTask} />
        ))}
      </div>
    </div>
  );
}

function WeekRow({ week, isCurrent, byCell, onAdd, onDrop, onUpdateTask, onDeleteTask }) {
  const weekBucket = byCell.get(`${week}|`) || [];
  return (
    <div style={{
      marginTop: 18, padding: '10px 12px',
      background: theme.bg2, border: `1px solid ${isCurrent ? theme.gold : theme.border}`,
      borderRadius: 12,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: isCurrent ? theme.gold : theme.text }}>{week}</div>
        <div style={{ fontSize: 11, color: theme.textMuted }}>{weekLabel(week)}</div>
        {isCurrent && <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: theme.gold, textTransform: 'uppercase' }}>current</span>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `120px repeat(${DAYS.length}, 1fr)`, gap: 6 }}>
        <DayCell
          label="Week"
          tasks={weekBucket}
          onAdd={() => onAdd(null)}
          onDrop={(t) => onDrop(t, null)}
          onUpdateTask={onUpdateTask}
          onDeleteTask={onDeleteTask}
          accent
        />
        {DAYS.map((day) => {
          const cellTasks = byCell.get(`${week}|${day}`) || [];
          return (
            <DayCell
              key={day}
              label={day}
              tasks={cellTasks}
              onAdd={() => onAdd(day)}
              onDrop={(t) => onDrop(t, day)}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
            />
          );
        })}
      </div>
    </div>
  );
}

function DayCell({ label, tasks, onAdd, onDrop, onUpdateTask, onDeleteTask, accent }) {
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        setOver(false);
        const id = e.dataTransfer.getData('text/plain');
        const t = tasksLookup.get(id);
        if (t) onDrop(t);
      }}
      style={{
        background: over ? theme.bgHover : theme.bg3,
        border: `1px solid ${over ? theme.gold : theme.border}`,
        borderRadius: 8, padding: '8px 8px', minHeight: 130,
        display: 'flex', flexDirection: 'column', gap: 6,
        transition: 'border-color .08s, background .08s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: accent ? theme.gold : theme.textMuted, textTransform: 'uppercase' }}>
          {label}
        </div>
        <button onClick={onAdd} title="Add task" style={{
          background: 'transparent', color: theme.textMuted, border: 'none',
          fontSize: 16, lineHeight: 1, padding: '0 4px', cursor: 'pointer',
        }}>+</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
        {tasks.map((t) => (
          <TaskCard key={t.id} task={t} onUpdate={onUpdateTask} onDelete={onDeleteTask} />
        ))}
      </div>
    </div>
  );
}

function TaskCard({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(task.title || '');
  useEffect(() => { setVal(task.title || ''); }, [task.title]);

  function commitTitle() {
    setEditing(false);
    if ((task.title || '') === val.trim()) return;
    onUpdate(task, { title: val.trim() || null });
  }

  return (
    <div
      draggable={!editing}
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', task.id); e.dataTransfer.effectAllowed = 'move'; }}
      style={{
        background: task.done ? 'rgba(16,185,129,0.08)' : theme.bg2,
        border: `1px solid ${task.done ? theme.green + '55' : theme.border}`,
        borderRadius: 6, padding: '6px 8px',
        display: 'flex', alignItems: 'flex-start', gap: 6,
        cursor: editing ? 'text' : 'grab',
        fontSize: 12,
      }}
    >
      <input
        type="checkbox"
        checked={!!task.done}
        onChange={(e) => onUpdate(task, { done: e.target.checked })}
        style={{ accentColor: theme.gold, marginTop: 2, cursor: 'pointer' }}
      />
      {editing ? (
        <input
          autoFocus
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') { setVal(task.title || ''); setEditing(false); }
          }}
          style={{
            flex: 1, background: theme.bg3, color: theme.text,
            border: `1px solid ${theme.gold}`, borderRadius: 4,
            padding: '2px 6px', fontSize: 12, outline: 'none', fontFamily: 'inherit',
          }}
        />
      ) : (
        <div
          onDoubleClick={() => setEditing(true)}
          style={{
            flex: 1, color: task.done ? theme.textMuted : theme.text,
            textDecoration: task.done ? 'line-through' : 'none',
            wordBreak: 'break-word',
          }}
          title="Double-click to edit"
        >
          {task.title || '(untitled)'}
        </div>
      )}
      <button
        onClick={() => onDelete(task)}
        title="Delete"
        style={{
          background: 'transparent', color: theme.textMuted, border: 'none',
          fontSize: 14, lineHeight: 1, padding: '0 2px', cursor: 'pointer',
        }}
      >×</button>
    </div>
  );
}

const ghostBtn = {
  background: 'transparent', color: theme.textDim,
  border: `1px solid ${theme.border}`, borderRadius: 6,
  padding: '6px 10px', fontSize: 12, cursor: 'pointer',
};
const smallBtn = {
  background: theme.gold, color: '#0A0E14',
  border: 'none', borderRadius: 6, padding: '4px 10px',
  fontSize: 11, fontWeight: 700, cursor: 'pointer',
};
