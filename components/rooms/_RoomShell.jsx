import { useEffect, useMemo, useState } from 'react';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { fetchAllRows } from '../../lib/fetchAll';
import { Toast, useUndoToast, LoadingSpinner } from '../Toast';

// Generic schema-driven room shell.
//
// Tab shape:
//   {
//     key:     'table_name',
//     label:   'Tab label',
//     fields:  [{ key, label, type?, section?, options?, placeholder?, prefix?, multiline?, full? }],
//     columns: [{ key, label, type?, flex?, align?, render?(value, row), format?(value, row), editable? }],
//     addLabel: 'Invoice',
//     defaults: { status: 'pending' },
//     kpisFromRows: (rows, { loading, totalCount }) => <KPIRow ... />,
//     order:    'created_at' | column name,
//     ascending: false,
//   }

export default function RoomShell({ title, group, tabs }) {
  const [tabIdx, setTabIdx] = useState(0);
  const tab = tabs[tabIdx];

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          {group && (
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
              {group}
            </div>
          )}
          <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: theme.gold }}>{title}</h1>
        </div>
      </div>

      {tabs.length > 1 && (
        <div style={{ display: 'flex', gap: 4, marginTop: 22, borderBottom: `1px solid ${theme.border}` }}>
          {tabs.map((t, i) => {
            const active = i === tabIdx;
            return (
              <button
                key={t.key}
                onClick={() => setTabIdx(i)}
                style={{
                  background: 'transparent', border: 'none',
                  color: active ? theme.gold : theme.textDim,
                  padding: '10px 14px', fontSize: 13,
                  fontWeight: active ? 700 : 500, cursor: 'pointer',
                  borderBottom: active ? `2px solid ${theme.gold}` : '2px solid transparent',
                  marginBottom: -1,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      )}

      <TabBody key={tab.key} {...tab} />
    </div>
  );
}

function TabBody({
  key: tableName, fields, columns, addLabel, defaults, kpisFromRows,
  order = 'created_at', ascending = false,
}) {
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState(null);
  const { toast, show: showToast, dismiss: dismissToast, runUndo } = useUndoToast();

  const EMPTY = useMemo(() => emptyRecord(fields, defaults), [fields, defaults]);

  async function load() {
    setLoading(true); setError(null);
    const { rows, count, error } = await fetchAllRows(tableName, { order, ascending });
    if (error) setError(error.message);
    setRows(rows);
    setTotalCount(count);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tableName]);

  function clean(row) {
    const { id, created_at, updated_at, ...rest } = row;
    return rest;
  }

  function registerUndoForChange(change) {
    if (change.kind === 'insert') {
      showToast(`Created ${addLabel?.toLowerCase() || 'record'}.`, async () => {
        await supabase.from(tableName).delete().eq('id', change.id);
        load();
      });
    } else if (change.kind === 'update') {
      showToast(`Updated ${addLabel?.toLowerCase() || 'record'}.`, async () => {
        await supabase.from(tableName).update(clean(change.before)).eq('id', change.id);
        load();
      });
    } else if (change.kind === 'delete') {
      showToast(`Deleted ${addLabel?.toLowerCase() || 'record'}.`, async () => {
        await supabase.from(tableName).insert({ id: change.row.id, ...clean(change.row) }).select();
        load();
      });
    }
    load();
  }

  // Inline cell edit — used when a column has `editable: true`.
  async function commitInline(row, columnKey, nextValue, isNumber) {
    const before = { ...row };
    const v = isNumber ? (nextValue === '' || nextValue == null ? null : Number(nextValue)) : (nextValue === '' ? null : nextValue);
    if (isNumber && v != null && !Number.isFinite(v)) return;
    if ((before[columnKey] ?? null) === (v ?? null)) return;

    // Optimistic update
    setRows((xs) => xs.map((r) => r.id === row.id ? { ...r, [columnKey]: v } : r));
    const { error } = await supabase.from(tableName).update({ [columnKey]: v }).eq('id', row.id);
    if (error) {
      setError(error.message);
      setRows((xs) => xs.map((r) => r.id === row.id ? before : r));
      return;
    }
    showToast(`Updated ${addLabel?.toLowerCase() || 'record'}.`, async () => {
      await supabase.from(tableName).update({ [columnKey]: before[columnKey] }).eq('id', row.id);
      setRows((xs) => xs.map((r) => r.id === row.id ? before : r));
    });
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    const searchKeys = fields.filter((f) => f.search !== false).map((f) => f.key);
    return rows.filter((r) => {
      return searchKeys.some((k) => {
        const v = r[k];
        return v != null && String(v).toLowerCase().includes(q);
      });
    });
  }, [rows, query, fields]);

  return (
    <>
      {kpisFromRows && (
        <div style={{ marginTop: 20 }}>
          {kpisFromRows(rows, { loading, totalCount })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '16px 0 12px', flexWrap: 'wrap' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          style={{ ...inputStyle, flex: 1, minWidth: 240 }}
        />
        <div style={{ color: theme.textMuted, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading && <LoadingSpinner size={12} />}
          {loading
            ? 'loading…'
            : query
              ? `${filtered.length} match · ${fmtNumber(totalCount)} total`
              : `${fmtNumber(totalCount)} total${rows.length < totalCount ? ` · showing ${fmtNumber(rows.length)}` : ''}`}
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} style={primaryBtn}>
          + {addLabel || 'Add'}
        </button>
      </div>

      {error && (
        <div style={errorBox}>{error}</div>
      )}

      <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden', background: theme.bg2 }}>
        <div style={tableHeader}>
          {columns.map((c) => (
            <div key={c.key} style={{ flex: c.flex || 1, textAlign: c.align || 'left' }}>
              {c.label}
            </div>
          ))}
        </div>
        {loading && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: theme.textMuted, fontSize: 13, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
            <LoadingSpinner /> Loading…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: theme.textMuted, fontSize: 13 }}>
            {rows.length === 0 ? `No ${addLabel?.toLowerCase() || 'records'} yet.` : 'No matches.'}
          </div>
        )}
        {!loading && filtered.map((r) => (
          <RowView key={r.id} row={r} columns={columns} onClick={() => setEditing(r)} onInlineCommit={commitInline} />
        ))}
      </div>

      {editing && (
        <EditDrawer
          row={editing}
          fields={fields}
          tableName={tableName}
          addLabel={addLabel}
          onClose={() => setEditing(null)}
          onChange={(change) => { setEditing(null); registerUndoForChange(change); }}
        />
      )}

      <Toast toast={toast} onUndo={runUndo} onDismiss={dismissToast} />
    </>
  );
}

function RowView({ row, columns, onClick, onInlineCommit }) {
  return (
    <div
      onClick={onClick}
      style={tableRow}
      onMouseEnter={(e) => (e.currentTarget.style.background = theme.bgHover)}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      {columns.map((c) => {
        const raw = row[c.key];
        if (c.editable) {
          return (
            <InlineCell
              key={c.key}
              row={row}
              column={c}
              value={raw}
              onCommit={(v) => onInlineCommit(row, c.key, v, c.type === 'number' || c.type === 'currency_aed')}
            />
          );
        }
        let content;
        if (c.render) content = c.render(raw, row);
        else if (c.format) content = c.format(raw, row);
        else if (raw == null || raw === '') content = '—';
        else if (c.type === 'currency_aed') content = fmtCompact(raw);
        else content = String(raw);
        return (
          <div key={c.key} style={{
            flex: c.flex || 1, textAlign: c.align || 'left',
            color: theme.textDim, fontSize: 13, minWidth: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontVariantNumeric: c.align === 'right' ? 'tabular-nums' : 'normal',
          }}>
            {content}
          </div>
        );
      })}
    </div>
  );
}

function InlineCell({ row, column: c, value, onCommit }) {
  const isNum = c.type === 'number' || c.type === 'currency_aed';
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value == null ? '' : String(value));

  useEffect(() => { setV(value == null ? '' : String(value)); }, [value]);

  function commit() {
    setEditing(false);
    const trimmed = v;
    if (isNum) {
      const n = trimmed === '' ? null : Number(trimmed);
      if (n !== null && !Number.isFinite(n)) { setV(value == null ? '' : String(value)); return; }
      if ((Number(value) || null) === n) return;
      onCommit(n);
    } else {
      if ((value ?? null) === (trimmed || null)) return;
      onCommit(trimmed);
    }
  }

  if (!editing) {
    let display;
    if (c.render) display = c.render(value, row);
    else if (c.format) display = c.format(value, row);
    else if (value == null || value === '') display = '—';
    else if (c.type === 'currency_aed') display = fmtCompact(value);
    else display = String(value);
    return (
      <div
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        title="Click to edit"
        style={{
          flex: c.flex || 1, textAlign: c.align || 'left',
          color: theme.text, fontSize: 13, minWidth: 0,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontVariantNumeric: c.align === 'right' ? 'tabular-nums' : 'normal',
          cursor: 'text',
          padding: '2px 6px', margin: '-2px -6px',
          borderRadius: 4, border: '1px dashed transparent',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.border; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
      >
        {display}
      </div>
    );
  }

  return (
    <input
      autoFocus
      type={isNum ? 'number' : 'text'}
      value={v}
      onChange={(e) => setV(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') { setV(value == null ? '' : String(value)); setEditing(false); }
      }}
      style={{
        flex: c.flex || 1, textAlign: c.align || 'left',
        background: theme.bg3, color: theme.text,
        border: `1px solid ${theme.gold}`, borderRadius: 4,
        padding: '4px 6px', fontSize: 13, outline: 'none',
        fontFamily: 'inherit', minWidth: 0,
        fontVariantNumeric: c.align === 'right' ? 'tabular-nums' : 'normal',
      }}
    />
  );
}

function emptyRecord(fields, defaults) {
  const out = {};
  for (const f of fields) {
    if (defaults && f.key in defaults) out[f.key] = defaults[f.key];
    else if (f.type === 'select' && f.options?.length) out[f.key] = '';
    else out[f.key] = '';
  }
  return out;
}

function EditDrawer({ row, fields, tableName, addLabel, onClose, onChange }) {
  const isNew = !row.id;
  const [form, setForm] = useState(() => {
    const base = {};
    for (const f of fields) base[f.key] = row[f.key] ?? '';
    return base;
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  const sections = useMemo(() => {
    const map = new Map();
    for (const f of fields) {
      const s = f.section || '';
      if (!map.has(s)) map.set(s, []);
      map.get(s).push(f);
    }
    return Array.from(map.entries());
  }, [fields]);

  async function save() {
    setSaving(true); setErr(null);
    const payload = {};
    for (const f of fields) {
      const v = form[f.key];
      if (v === '' || v == null) {
        payload[f.key] = null;
      } else if (f.type === 'number' || f.type === 'currency_aed') {
        const n = Number(v);
        payload[f.key] = Number.isFinite(n) ? n : null;
      } else {
        payload[f.key] = v;
      }
    }
    const q = isNew
      ? supabase.from(tableName).insert(payload).select().single()
      : supabase.from(tableName).update(payload).eq('id', row.id).select().single();
    const { data, error } = await q;
    setSaving(false);
    if (error) { setErr(error.message); return; }

    if (isNew) {
      onChange({ kind: 'insert', id: data.id, row: data });
    } else {
      onChange({ kind: 'update', id: row.id, before: row, after: data });
    }
  }

  async function remove() {
    if (!confirm(`Delete this ${addLabel?.toLowerCase() || 'record'}? You'll have 5 seconds to undo.`)) return;
    setSaving(true);
    const { error } = await supabase.from(tableName).delete().eq('id', row.id);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onChange({ kind: 'delete', id: row.id, row });
  }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={drawerStyle}>
        <div style={drawerHeader}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
              {isNew ? `New ${addLabel?.toLowerCase() || 'record'}` : `Edit ${addLabel?.toLowerCase() || 'record'}`}
            </div>
          </div>
          <button onClick={onClose} style={ghostBtn}>Close</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          {sections.map(([sec, list], idx) => (
            <div key={sec || `_${idx}`} style={{ marginBottom: 22 }}>
              {sec && (
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: theme.gold, textTransform: 'uppercase', marginBottom: 10 }}>
                  {sec}
                </div>
              )}
              {chunk2(list).map((pair, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  {pair.map((f) => (
                    <FieldRender key={f.key} field={f} value={form[f.key]} onChange={(v) => set(f.key, v)} />
                  ))}
                  {pair.length === 1 && <div style={{ flex: 1 }} />}
                </div>
              ))}
            </div>
          ))}

          {err && <div style={errorBox}>{err}</div>}
        </div>

        <div style={drawerFooter}>
          {!isNew && <button onClick={remove} disabled={saving} style={dangerBtn}>Delete</button>}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} disabled={saving} style={ghostBtn}>Cancel</button>
          <button onClick={save} disabled={saving} style={primaryBtn}>
            {saving ? 'Saving…' : (isNew ? 'Create' : 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
}

function chunk2(list) {
  const out = [];
  for (const f of list) {
    if (f.full) { out.push([f]); continue; }
    const last = out[out.length - 1];
    if (last && last.length === 1 && !last[0].full) last.push(f);
    else out.push([f]);
  }
  return out;
}

function FieldRender({ field, value, onChange }) {
  const { label, type = 'text', options, placeholder, prefix, multiline } = field;
  return (
    <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span style={fieldLabel}>{label}</span>
      {type === 'select' ? (
        <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
          <option value="">—</option>
          {options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : type === 'textarea' || multiline ? (
        <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
      ) : (
        <div style={{ display: 'flex', alignItems: 'stretch', background: theme.bg3, border: `1px solid ${theme.border}`, borderRadius: 6 }}>
          {prefix && (
            <span style={{ padding: '0 8px', display: 'flex', alignItems: 'center', color: theme.textMuted, fontSize: 13, borderRight: `1px solid ${theme.border}` }}>
              {prefix}
            </span>
          )}
          <input
            type={type === 'currency_aed' ? 'number' : type === 'date' ? 'date' : type}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={bareInput}
          />
        </div>
      )}
    </label>
  );
}

export const StatusPill = ({ value, palette }) => {
  const v = value || '—';
  const map = palette || {
    active: theme.green, done: theme.green, won: theme.green, awarded: theme.green, received: theme.green, published: theme.green, accepted: theme.green,
    paused: theme.amber, doing: theme.amber, scheduled: theme.amber, planned: theme.amber, sent: theme.amber, pending: theme.amber, lead: theme.amber,
    blacklist: theme.red, lost: theme.red, dropped: theme.red, cancelled: theme.red, rejected: theme.red, dormant: theme.red, expired: theme.red,
    todo: theme.blue, draft: theme.textDim, idea: theme.blue, exploring: theme.blue, raw: theme.textDim, parked: theme.textMuted,
  };
  const color = map[String(v).toLowerCase()] || theme.textDim;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 999,
      fontSize: 11, fontWeight: 600, color,
      background: `${color}22`, border: `1px solid ${color}55`,
      textTransform: 'capitalize',
    }}>
      {v}
    </span>
  );
};

export const fmtDate = (v) => {
  if (!v) return '—';
  try { return new Date(v).toISOString().slice(0, 10); }
  catch { return String(v); }
};

export const fmtNumber = (v) => {
  if (v == null || v === '') return '—';
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString() : String(v);
};

// Compact human-friendly numbers: 999 → "999", 1500 → "1.5K", 1000 → "1K",
// 2345 → "2.3K", 1_000_000 → "1M", 57_500_000 → "57.5M".
export const fmtCompact = (v) => {
  if (v == null || v === '') return '—';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs < 1000) return sign + Math.round(abs).toString();
  let value, suffix;
  if (abs < 1_000_000)         { value = abs / 1_000;         suffix = 'K'; }
  else if (abs < 1_000_000_000) { value = abs / 1_000_000;    suffix = 'M'; }
  else                          { value = abs / 1_000_000_000; suffix = 'B'; }
  const rounded = Math.round(value * 10) / 10;
  const str = rounded % 1 === 0 ? String(Math.round(rounded)) : rounded.toFixed(1);
  return sign + str + suffix;
};

export const KPIBox = ({ label, value, color, suffix, loading }) => (
  <div style={{
    padding: '16px 18px', borderRadius: 12,
    background: theme.bg2, border: `1px solid ${theme.border}`,
    minWidth: 0,
  }}>
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
      {label}
    </div>
    <div style={{
      fontSize: 26, fontWeight: 800, marginTop: 6, fontVariantNumeric: 'tabular-nums',
      color: color || theme.gold,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {loading ? <LoadingSpinner /> : (
        <>
          <span>{typeof value === 'number' ? fmtCompact(value) : value}</span>
          {suffix && <span style={{ fontSize: 13, color: theme.textMuted, fontWeight: 500 }}>{suffix}</span>}
        </>
      )}
    </div>
  </div>
);

const fieldLabel = { fontSize: 10, fontWeight: 700, letterSpacing: 1, color: theme.textMuted, textTransform: 'uppercase' };
const inputStyle = {
  background: theme.bg3, color: theme.text,
  border: `1px solid ${theme.border}`, borderRadius: 6,
  padding: '8px 10px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
};
const bareInput = {
  flex: 1, background: 'transparent', color: theme.text,
  border: 'none', padding: '8px 10px', fontSize: 13, outline: 'none', fontFamily: 'inherit', width: '100%',
};
const primaryBtn = {
  background: theme.gold, color: '#0A0E14',
  border: 'none', borderRadius: 6, padding: '8px 14px',
  fontSize: 13, fontWeight: 700, cursor: 'pointer',
};
const ghostBtn = {
  background: 'transparent', color: theme.textDim,
  border: `1px solid ${theme.border}`, borderRadius: 6,
  padding: '8px 12px', fontSize: 13, cursor: 'pointer',
};
const dangerBtn = {
  background: 'transparent', color: theme.red,
  border: `1px solid ${theme.red}55`, borderRadius: 6,
  padding: '8px 12px', fontSize: 13, cursor: 'pointer',
};
const tableHeader = {
  display: 'flex', gap: 14, padding: '10px 16px',
  background: theme.bg3, borderBottom: `1px solid ${theme.border}`,
  fontSize: 10, fontWeight: 700, letterSpacing: 1,
  color: theme.textMuted, textTransform: 'uppercase',
};
const tableRow = {
  display: 'flex', gap: 14, alignItems: 'center',
  padding: '12px 16px', borderBottom: `1px solid ${theme.border}`,
  fontSize: 13, cursor: 'pointer', transition: 'background .1s',
};
const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 50,
  display: 'flex', justifyContent: 'flex-end',
};
const drawerStyle = {
  width: 560, maxWidth: '100%', height: '100%', background: theme.bg2,
  borderLeft: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column',
};
const drawerHeader = {
  padding: '16px 22px', borderBottom: `1px solid ${theme.border}`,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
};
const drawerFooter = {
  padding: '14px 22px', borderTop: `1px solid ${theme.border}`,
  display: 'flex', gap: 8, alignItems: 'center',
};
const errorBox = {
  padding: 12, background: 'rgba(239,68,68,0.08)',
  border: `1px solid ${theme.red}`, borderRadius: 8, color: theme.red,
  margin: '12px 0', fontSize: 13,
};
