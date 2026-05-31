import { useEffect, useMemo, useState } from 'react';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { Toast, useUndoToast, LoadingSpinner } from '../Toast';
import { KPIBox, fmtCompact, fmtNumber } from './_RoomShell';
import { countRows, fetchPage } from '../../lib/fetchAll';

const META_KEYS = new Set(['id', 'created_at', 'updated_at']);
const PAGE_SIZE = 50;

// Order columns: prefer common real-estate fields first if present, then the rest.
const PREFERRED = [
  'title', 'name', 'reference', 'ref',
  'type', 'category', 'status',
  'price', 'price_aed', 'amount', 'rent', 'rent_aed',
  'beds', 'bedrooms', 'baths', 'bathrooms',
  'area', 'area_sqft', 'size',
  'address', 'location', 'city', 'country', 'community', 'neighborhood',
  'agent', 'owner', 'phone', 'email',
  'link', 'url',
];

function orderKeys(keys) {
  const found = new Set(keys);
  const ordered = [];
  for (const p of PREFERRED) if (found.has(p)) { ordered.push(p); found.delete(p); }
  for (const k of keys) if (found.has(k)) ordered.push(k);
  return ordered;
}

function isProbablyNumeric(v) {
  if (v == null || v === '') return false;
  return typeof v === 'number' || (typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v));
}

export default function RealEstate() {
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');

  const undo = useUndoToast();

  async function loadCount() {
    const { count } = await countRows('real_estate');
    setTotalCount(count);
  }

  async function loadPage(p) {
    setLoading(true); setError(null);
    const { rows, count, error } = await fetchPage('real_estate', { page: p, pageSize: PAGE_SIZE });
    if (error) setError(error.message);
    setRows(rows);
    if (typeof count === 'number') setTotalCount(count);
    setLoading(false);
  }

  useEffect(() => { loadCount(); }, []);
  useEffect(() => { loadPage(page); }, [page]);

  // Auto-detect columns from the first non-empty row.
  const columnKeys = useMemo(() => {
    const sample = rows[0];
    if (!sample) return [];
    const keys = Object.keys(sample).filter((k) => !META_KEYS.has(k));
    return orderKeys(keys);
  }, [rows]);

  // For the table, show up to 7 columns; the rest are still editable in the drawer.
  const visibleColumns = columnKeys.slice(0, 7);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Local search filters the *current page* (server-side full-table search is
  // impractical without a known schema).
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => columnKeys.some((k) => {
      const v = r[k]; return v != null && String(v).toLowerCase().includes(q);
    }));
  }, [rows, search, columnKeys]);

  function strip(row) {
    const out = {};
    for (const k of Object.keys(row)) if (!META_KEYS.has(k)) out[k] = row[k];
    return out;
  }

  async function commitInline(row, key, nextVal) {
    const before = { ...row };
    const isNum = isProbablyNumeric(row[key]);
    const v = nextVal === '' ? null : (isNum ? (Number.isFinite(Number(nextVal)) ? Number(nextVal) : nextVal) : nextVal);
    if ((before[key] ?? null) === (v ?? null)) return;
    setRows((xs) => xs.map((r) => r.id === row.id ? { ...r, [key]: v } : r));
    const { error } = await supabase.from('real_estate').update({ [key]: v }).eq('id', row.id);
    if (error) {
      setError(error.message);
      setRows((xs) => xs.map((r) => r.id === row.id ? before : r));
      return;
    }
    undo.show('Updated property.', async () => {
      await supabase.from('real_estate').update({ [key]: before[key] }).eq('id', row.id);
      setRows((xs) => xs.map((r) => r.id === row.id ? before : r));
    });
  }

  async function saveRow(form) {
    const isNew = !editing.id;
    if (isNew) {
      const { data, error } = await supabase.from('real_estate').insert(form).select().single();
      if (error) { setError(error.message); return; }
      setEditing(null);
      setRows((xs) => [data, ...xs]);
      setTotalCount((c) => c + 1);
      undo.show('Created property.', async () => {
        await supabase.from('real_estate').delete().eq('id', data.id);
        setRows((xs) => xs.filter((r) => r.id !== data.id));
        setTotalCount((c) => c - 1);
      });
    } else {
      const before = editing;
      const { data, error } = await supabase.from('real_estate').update(form).eq('id', editing.id).select().single();
      if (error) { setError(error.message); return; }
      setEditing(null);
      setRows((xs) => xs.map((r) => r.id === before.id ? data : r));
      undo.show('Updated property.', async () => {
        await supabase.from('real_estate').update(strip(before)).eq('id', before.id);
        setRows((xs) => xs.map((r) => r.id === before.id ? before : r));
      });
    }
  }

  async function deleteRow(row) {
    if (!confirm('Delete this property? You have 5 seconds to undo.')) return;
    const before = row;
    setRows((xs) => xs.filter((r) => r.id !== row.id));
    setTotalCount((c) => c - 1);
    const { error } = await supabase.from('real_estate').delete().eq('id', row.id);
    if (error) { setError(error.message); loadPage(page); return; }
    setEditing(null);
    undo.show('Deleted property.', async () => {
      const { data } = await supabase.from('real_estate').insert({ id: before.id, ...strip(before) }).select().single();
      if (data) {
        setRows((xs) => [data, ...xs]);
        setTotalCount((c) => c + 1);
      }
    });
  }

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
            Business
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: theme.gold }}>Real Estate</h1>
        </div>
        <button onClick={() => setEditing(emptyRow(columnKeys))} style={primaryBtn}>+ Add property</button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 22 }}>
        <KPIBox label="Total properties" value={totalCount} loading={loading && !totalCount} />
        <KPIBox label="Page size"        value={PAGE_SIZE} />
        <KPIBox label="Pages"            value={totalPages} />
        <KPIBox label="Current page"     value={`${page + 1} / ${totalPages}`} />
      </div>

      {error && <div style={errorBox}>{error}</div>}

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '16px 0 12px', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search this page…"
          style={{ ...inputStyle, flex: 1, minWidth: 240 }}
        />
        <div style={{ color: theme.textMuted, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading && <LoadingSpinner size={12} />}
          {loading ? 'loading…' : `${fmtNumber(filtered.length)} on page · ${fmtNumber(totalCount)} total`}
        </div>
      </div>

      <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden', background: theme.bg2 }}>
        <div style={tableHeader}>
          {visibleColumns.map((k) => (
            <div key={k} style={{ flex: 1, textAlign: 'left' }}>{k.replace(/_/g, ' ')}</div>
          ))}
          {visibleColumns.length === 0 && <div style={{ flex: 1 }}>(empty table)</div>}
        </div>
        {loading && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: theme.textMuted, fontSize: 13, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
            <LoadingSpinner /> Loading…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: theme.textMuted, fontSize: 13 }}>No rows.</div>
        )}
        {!loading && filtered.map((r) => (
          <RowView key={r.id} row={r} columnKeys={visibleColumns}
                   onClick={() => setEditing(r)} onInlineCommit={commitInline} />
        ))}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14 }}>
        <button onClick={() => setPage(0)}             disabled={page === 0 || loading} style={ghostBtn}>« First</button>
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || loading} style={ghostBtn}>‹ Prev</button>
        <div style={{ color: theme.textDim, fontSize: 12, padding: '0 12px' }}>
          Page {page + 1} of {fmtNumber(totalPages)}
        </div>
        <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || loading} style={ghostBtn}>Next ›</button>
        <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1 || loading} style={ghostBtn}>Last »</button>
      </div>

      {editing && (
        <PropertyDrawer
          row={editing}
          columnKeys={columnKeys}
          onClose={() => setEditing(null)}
          onSave={saveRow}
          onDelete={editing.id ? () => deleteRow(editing) : null}
        />
      )}

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}

function emptyRow(columnKeys) {
  const out = {};
  for (const k of columnKeys) out[k] = '';
  return out;
}

function RowView({ row, columnKeys, onClick, onInlineCommit }) {
  return (
    <div onClick={onClick} style={tableRow}
         onMouseEnter={(e) => (e.currentTarget.style.background = theme.bgHover)}
         onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
      {columnKeys.map((k) => (
        <InlineCell key={k} row={row} columnKey={k} value={row[k]} onCommit={(v) => onInlineCommit(row, k, v)} />
      ))}
    </div>
  );
}

function InlineCell({ row, columnKey: k, value, onCommit }) {
  const isNum = isProbablyNumeric(value);
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value == null ? '' : String(value));

  useEffect(() => { setV(value == null ? '' : String(value)); }, [value]);

  function commit() {
    setEditing(false);
    if ((value ?? null) === (v === '' ? null : v)) return;
    onCommit(v);
  }

  if (!editing) {
    let display;
    if (value == null || value === '') display = '—';
    else if (isNum && Math.abs(Number(value)) >= 1000) display = fmtCompact(value);
    else display = String(value);
    return (
      <div onClick={(e) => { e.stopPropagation(); setEditing(true); }}
           style={{
             flex: 1, color: theme.text, fontSize: 13, minWidth: 0,
             overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
             cursor: 'text', padding: '2px 6px', margin: '-2px -6px',
             borderRadius: 4, border: '1px dashed transparent',
             fontVariantNumeric: isNum ? 'tabular-nums' : 'normal',
           }}
           onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.border; }}
           onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}>
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
        flex: 1, background: theme.bg3, color: theme.text,
        border: `1px solid ${theme.gold}`, borderRadius: 4,
        padding: '4px 6px', fontSize: 13, outline: 'none',
        fontFamily: 'inherit', minWidth: 0,
      }}
    />
  );
}

function PropertyDrawer({ row, columnKeys, onClose, onSave, onDelete }) {
  const isNew = !row.id;
  const [form, setForm] = useState(() => {
    const base = {};
    for (const k of columnKeys) base[k] = row[k] ?? '';
    return base;
  });

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function submit() {
    const payload = {};
    for (const k of columnKeys) {
      const v = form[k];
      payload[k] = v === '' ? null : v;
    }
    onSave(payload);
  }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={drawerStyle}>
        <div style={drawerHeader}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
            {isNew ? 'New property' : 'Edit property'}
          </div>
          <button onClick={onClose} style={ghostBtn}>Close</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          {columnKeys.length === 0 && (
            <div style={{ color: theme.textMuted, fontSize: 13 }}>
              No column schema detected. Add at least one column in the Supabase Table Editor first.
            </div>
          )}
          {columnKeys.map((k) => (
            <label key={k} style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10 }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: theme.textMuted, textTransform: 'uppercase' }}>
                {k.replace(/_/g, ' ')}
              </span>
              <input value={form[k] ?? ''} onChange={(e) => set(k, e.target.value)} style={inputStyle} />
            </label>
          ))}
        </div>
        <div style={drawerFooter}>
          {onDelete && <button onClick={onDelete} style={dangerBtn}>Delete</button>}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={ghostBtn}>Cancel</button>
          <button onClick={submit} style={primaryBtn}>{isNew ? 'Create' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  background: theme.bg3, color: theme.text,
  border: `1px solid ${theme.border}`, borderRadius: 6,
  padding: '8px 10px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
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
  padding: '10px 16px', borderBottom: `1px solid ${theme.border}`,
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
