import { useEffect, useMemo, useState } from 'react';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { useUndoToast, Toast, LoadingSpinner } from '../Toast';
import { KPIBox, fmtNumber } from './_RoomShell';
import { PageHeader, InlineText, IconButton, btnPrimary, btnGhost, inputStyle, errorBox } from '../ui';

// CONNECTIONS → Directory. Paginated B2B directory over `clients`
// (company / category). Server-side search on company + filter on category so
// it stays fast across 8k+ rows. Rows are inline-editable and save with undo.

const PAGE_SIZE = 50;
const EDIT_COLS = [
  { key: 'company',        label: 'Company',  flex: 1.8 },
  { key: 'category',       label: 'Category', flex: 1.2 },
  { key: 'contact_person', label: 'Contact',  flex: 1.2 },
  { key: 'email',          label: 'Email',    flex: 1.4 },
  { key: 'phone',          label: 'Phone',    flex: 1 },
  { key: 'stage',          label: 'Stage',    flex: 0.9 },
];
const strip = (row) => { const { id, created_at, ...rest } = row; return rest; };

export default function ClientsDirectory() {
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const undo = useUndoToast();

  // Distinct categories (once).
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('clients').select('category').limit(20000);
      const set = new Set();
      for (const r of data || []) if (r.category) set.add(r.category);
      setCategories(Array.from(set).sort((a, b) => a.localeCompare(b)));
    })();
  }, []);

  async function load() {
    setLoading(true); setError(null);
    let q = supabase.from('clients').select('*', { count: 'exact' }).order('company', { ascending: true });
    if (search) q = q.ilike('company', `%${search}%`);
    if (category !== 'all') q = q.eq('category', category);
    const start = page * PAGE_SIZE;
    q = q.range(start, start + PAGE_SIZE - 1);
    const { data, count, error } = await q;
    if (error) setError(error.message);
    setRows(data || []);
    if (typeof count === 'number') setCount(count);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page, search, category]);

  const totalPages = Math.max(1, Math.ceil(count / PAGE_SIZE));

  function applySearch() { setPage(0); setSearch(searchInput.trim()); }

  async function updateCell(row, key, value) {
    const before = row;
    const v = value === '' ? null : value;
    if ((before[key] ?? null) === (v ?? null)) return;
    setRows((xs) => xs.map((r) => (r.id === row.id ? { ...r, [key]: v } : r)));
    const { error } = await supabase.from('clients').update({ [key]: v }).eq('id', row.id);
    if (error) { setError(error.message); setRows((xs) => xs.map((r) => (r.id === row.id ? before : r))); return; }
    undo.show('Updated company.', async () => {
      await supabase.from('clients').update({ [key]: before[key] }).eq('id', row.id);
      setRows((xs) => xs.map((r) => (r.id === row.id ? before : r)));
    });
  }

  async function addCompany() {
    const { data, error } = await supabase.from('clients').insert({ company: 'New company' }).select().single();
    if (error) { setError(error.message); return; }
    setRows((xs) => [data, ...xs]);
    setCount((c) => c + 1);
    undo.show('Added company.', async () => {
      await supabase.from('clients').delete().eq('id', data.id);
      setRows((xs) => xs.filter((r) => r.id !== data.id));
      setCount((c) => c - 1);
    });
  }

  async function deleteCompany(row) {
    setRows((xs) => xs.filter((r) => r.id !== row.id));
    setCount((c) => c - 1);
    const { error } = await supabase.from('clients').delete().eq('id', row.id);
    if (error) { setError(error.message); load(); return; }
    undo.show('Deleted company.', async () => {
      const { data } = await supabase.from('clients').insert({ id: row.id, ...strip(row) }).select().single();
      if (data) { setRows((xs) => [data, ...xs]); setCount((c) => c + 1); }
    });
  }

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <PageHeader
        group="Connections"
        title="Directory"
        right={<button onClick={addCompany} style={btnPrimary}>+ Company</button>}
      />

      {error && <div style={errorBox}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginTop: 20 }}>
        <KPIBox label="Companies"  value={count} loading={loading && !count} />
        <KPIBox label="Categories" value={categories.length} />
        <KPIBox label="Page"       value={`${page + 1} / ${fmtNumber(totalPages)}`} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', margin: '16px 0 12px', flexWrap: 'wrap' }}>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && applySearch()}
          placeholder="Search company…"
          style={{ ...inputStyle, flex: 1, minWidth: 220 }}
        />
        <button onClick={applySearch} style={btnGhost}>Search</button>
        <select
          value={category}
          onChange={(e) => { setPage(0); setCategory(e.target.value); }}
          style={{ ...inputStyle, cursor: 'pointer', maxWidth: 240 }}
        >
          <option value="all">All categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div style={{ color: theme.textMuted, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading && <LoadingSpinner size={12} />}
          {loading ? 'loading…' : `${fmtNumber(count)} match`}
        </div>
      </div>

      {/* Table */}
      <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden', background: theme.bg2 }}>
        <div style={{ display: 'flex', gap: 12, padding: '10px 14px', background: theme.bg3, borderBottom: `1px solid ${theme.border}`, fontSize: 10, fontWeight: 700, letterSpacing: 1, color: theme.textMuted, textTransform: 'uppercase' }}>
          {EDIT_COLS.map((c) => <div key={c.key} style={{ flex: c.flex }}>{c.label}</div>)}
          <div style={{ width: 34 }} />
        </div>
        {loading && rows.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: theme.textMuted, fontSize: 13 }}>Loading…</div>
        )}
        {!loading && rows.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: theme.textMuted, fontSize: 13 }}>
            No companies. Import clients.csv, then refresh.
          </div>
        )}
        {rows.map((r) => (
          <div key={r.id} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 14px', borderBottom: `1px solid ${theme.border}` }}>
            {EDIT_COLS.map((c) => (
              <div key={c.key} style={{ flex: c.flex, minWidth: 0 }}>
                <InlineText value={r[c.key]} onCommit={(v) => updateCell(r, c.key, v)} placeholder="—" style={{ padding: '5px 7px', fontSize: 13 }} />
              </div>
            ))}
            <div style={{ width: 34, textAlign: 'right' }}>
              <IconButton title="Delete" danger onClick={() => deleteCompany(r)}>✕</IconButton>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14 }}>
        <button onClick={() => setPage(0)} disabled={page === 0 || loading} style={btnGhost}>« First</button>
        <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || loading} style={btnGhost}>‹ Prev</button>
        <div style={{ color: theme.textDim, fontSize: 12, padding: '0 12px' }}>Page {page + 1} of {fmtNumber(totalPages)}</div>
        <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || loading} style={btnGhost}>Next ›</button>
        <button onClick={() => setPage(totalPages - 1)} disabled={page >= totalPages - 1 || loading} style={btnGhost}>Last »</button>
      </div>

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}
