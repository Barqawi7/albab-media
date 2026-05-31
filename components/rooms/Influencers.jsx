import { useEffect, useMemo, useState } from 'react';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';
import { fmtCompact, fmtNumber, KPIBox } from './_RoomShell';
import { fetchAllRows } from '../../lib/fetchAll';
import { Toast, useUndoToast, LoadingSpinner } from '../Toast';

const TABLE = 'influencers_master';
const TIER_OPTIONS = ['Mega', 'Macro', 'Mid', 'Micro', 'Nano'];
const TIER_COLORS = {
  Mega:  '#A78BFA',
  Macro: theme.blue,
  Mid:   theme.gold,
  Micro: theme.green,
  Nano:  theme.textDim,
  Other: theme.textMuted,
};

const EMPTY = {
  rank: '', name: '', ig_handle: '', tier: '', category: '',
  city: '', nationality: '',
  ig_followers: '', tiktok_followers: '', youtube_subscribers: '',
  total_reach: '', engagement: '', est_rate: '',
};

function tierKey(t) {
  const v = (t == null ? '' : String(t)).trim();
  if (!v) return 'Other';
  for (const opt of TIER_OPTIONS) if (opt.toLowerCase() === v.toLowerCase()) return opt;
  return 'Other';
}

export default function Influencers() {
  const [rows, setRows] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery]             = useState('');
  const [tierFilter, setTierFilter]   = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const [editing, setEditing] = useState(null);
  const undo = useUndoToast();

  async function load() {
    setLoading(true); setError(null);
    const { rows, count, error } = await fetchAllRows(TABLE, { order: 'rank', ascending: true });
    if (error) setError(error.message);
    setRows(rows);
    setTotalCount(count);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const tierCounts = useMemo(() => {
    const c = { Mega: 0, Macro: 0, Mid: 0, Micro: 0, Nano: 0, Other: 0 };
    for (const r of rows) c[tierKey(r.tier)]++;
    return c;
  }, [rows]);

  const categories = useMemo(() => {
    const set = new Set();
    for (const r of rows) {
      const v = (r.category || '').trim();
      if (v) set.add(v);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (tierFilter !== 'all' && tierKey(r.tier) !== tierFilter) return false;
      if (categoryFilter !== 'all' && (r.category || '') !== categoryFilter) return false;
      if (!q) return true;
      const hay = [r.name, r.ig_handle, r.category, r.city, r.nationality, r.tier]
        .filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, tierFilter, categoryFilter]);

  function strip(row) {
    const { id, created_at, updated_at, ...rest } = row;
    return rest;
  }

  async function commitInline(row, key, raw, isNumber) {
    const before = { ...row };
    const v = raw === '' || raw == null
      ? null
      : (isNumber ? (Number.isFinite(Number(raw)) ? Number(raw) : null) : raw);
    if ((before[key] ?? null) === (v ?? null)) return;
    setRows((xs) => xs.map((r) => r.id === row.id ? { ...r, [key]: v } : r));
    const { error } = await supabase.from(TABLE).update({ [key]: v }).eq('id', row.id);
    if (error) {
      setError(error.message);
      setRows((xs) => xs.map((r) => r.id === row.id ? before : r));
      return;
    }
    undo.show('Updated influencer.', async () => {
      await supabase.from(TABLE).update({ [key]: before[key] }).eq('id', row.id);
      setRows((xs) => xs.map((r) => r.id === row.id ? before : r));
    });
  }

  async function saveRow(form) {
    const numericKeys = ['rank', 'ig_followers', 'tiktok_followers', 'youtube_subscribers', 'total_reach', 'engagement', 'est_rate'];
    const payload = {};
    for (const [k, raw] of Object.entries(form)) {
      if (raw === '' || raw == null) { payload[k] = null; continue; }
      if (numericKeys.includes(k)) {
        const n = Number(raw);
        payload[k] = Number.isFinite(n) ? n : null;
      } else {
        payload[k] = raw;
      }
    }
    const isNew = !editing.id;
    if (isNew) {
      const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
      if (error) { setError(error.message); return; }
      setEditing(null);
      setRows((xs) => [data, ...xs]);
      setTotalCount((c) => c + 1);
      undo.show('Created influencer.', async () => {
        await supabase.from(TABLE).delete().eq('id', data.id);
        setRows((xs) => xs.filter((r) => r.id !== data.id));
        setTotalCount((c) => c - 1);
      });
    } else {
      const before = { ...editing };
      const { data, error } = await supabase.from(TABLE).update(payload).eq('id', editing.id).select().single();
      if (error) { setError(error.message); return; }
      setEditing(null);
      setRows((xs) => xs.map((r) => r.id === before.id ? data : r));
      undo.show('Updated influencer.', async () => {
        await supabase.from(TABLE).update(strip(before)).eq('id', before.id);
        setRows((xs) => xs.map((r) => r.id === before.id ? before : r));
      });
    }
  }

  async function deleteRow(row) {
    if (!confirm(`Delete ${row.name || 'this influencer'}? 5 seconds to undo.`)) return;
    setRows((xs) => xs.filter((r) => r.id !== row.id));
    setTotalCount((c) => c - 1);
    setEditing(null);
    const { error } = await supabase.from(TABLE).delete().eq('id', row.id);
    if (error) { setError(error.message); load(); return; }
    undo.show('Deleted influencer.', async () => {
      const { data } = await supabase.from(TABLE).insert({ id: row.id, ...strip(row) }).select().single();
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
            People
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: theme.gold }}>Influencers</h1>
        </div>
        <button onClick={() => setEditing({ ...EMPTY })} style={primaryBtn}>+ Add influencer</button>
      </div>

      {/* KPI strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 18 }}>
        <KPIBox label="Total influencers" value={totalCount} loading={loading} />
        <KPIBox label="Mega (10M+)"      value={tierCounts.Mega}  loading={loading} color={TIER_COLORS.Mega} />
        <KPIBox label="Macro (1M-10M)"   value={tierCounts.Macro} loading={loading} color={TIER_COLORS.Macro} />
        <KPIBox label="Mid (100K-1M)"    value={tierCounts.Mid}   loading={loading} color={TIER_COLORS.Mid} />
        <KPIBox label="Micro (10K-100K)" value={tierCounts.Micro} loading={loading} color={TIER_COLORS.Micro} />
        <KPIBox label="Nano (<10K)"      value={tierCounts.Nano}  loading={loading} color={TIER_COLORS.Nano} />
        <KPIBox label="Other / unset"    value={tierCounts.Other} loading={loading} color={TIER_COLORS.Other} />
      </div>

      {/* Tier filter chips */}
      <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
        {['all', ...TIER_OPTIONS, 'Other'].map((t) => (
          <Chip key={t} active={tierFilter === t} onClick={() => setTierFilter(t)}>
            {t === 'all' ? 'All tiers' : t}
          </Chip>
        ))}
      </div>

      {/* Category filter chips (capped, plus an "All" + dropdown overflow) */}
      <CategoryChips
        categories={categories}
        active={categoryFilter}
        onChange={setCategoryFilter}
      />

      {/* Search bar + status */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '14px 0 12px', flexWrap: 'wrap' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, handle, niche, city, nationality…"
          style={{ ...inputStyle, flex: 1, minWidth: 240 }}
        />
        <div style={{ color: theme.textMuted, fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          {loading && <LoadingSpinner size={12} />}
          {loading
            ? 'loading…'
            : `${fmtNumber(filtered.length)} match · ${fmtNumber(totalCount)} total${rows.length < totalCount ? ` (loaded ${fmtNumber(rows.length)})` : ''}`}
        </div>
      </div>

      {error && (
        <div style={errorBox}>{error}</div>
      )}

      {/* Table */}
      <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden', background: theme.bg2 }}>
        <div style={tableHeader}>
          <div style={{ flex: 0.5, textAlign: 'right' }}>Rank</div>
          <div style={{ flex: 2 }}>Name</div>
          <div style={{ flex: 0.7 }}>Tier</div>
          <div style={{ flex: 1.2 }}>Category</div>
          <div style={{ flex: 1 }}>Location</div>
          <div style={{ flex: 0.9, textAlign: 'right' }}>Total reach</div>
          <div style={{ flex: 0.7, textAlign: 'right' }}>Engagement</div>
          <div style={{ flex: 0.8, textAlign: 'right' }}>Est. rate</div>
        </div>
        {loading && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: theme.textMuted, fontSize: 13, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
            <LoadingSpinner /> Loading…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: theme.textMuted, fontSize: 13 }}>
            {rows.length === 0 ? 'No influencers yet.' : 'No matches.'}
          </div>
        )}
        {!loading && filtered.map((r) => (
          <RowView key={r.id} row={r} onOpen={() => setEditing(r)} onInlineCommit={commitInline} />
        ))}
      </div>

      {editing && (
        <EditDrawer
          row={editing}
          categories={categories}
          onClose={() => setEditing(null)}
          onSave={saveRow}
          onDelete={editing.id ? () => deleteRow(editing) : null}
        />
      )}

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}

function CategoryChips({ categories, active, onChange }) {
  const VISIBLE = 10;
  const visible = categories.slice(0, VISIBLE);
  const overflow = categories.slice(VISIBLE);
  return (
    <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      <Chip active={active === 'all'} onClick={() => onChange('all')}>All categories</Chip>
      {visible.map((c) => (
        <Chip key={c} active={active === c} onClick={() => onChange(c)}>{c}</Chip>
      ))}
      {overflow.length > 0 && (
        <select
          value={overflow.includes(active) ? active : ''}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          style={{
            background: theme.bg3, color: theme.textDim,
            border: `1px solid ${theme.border}`, borderRadius: 999,
            padding: '4px 8px', fontSize: 12, cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="">More categories…</option>
          {overflow.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      )}
    </div>
  );
}

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      background: active ? theme.goldTint : 'transparent',
      color: active ? theme.gold : theme.textDim,
      border: `1px solid ${active ? theme.gold : theme.border}`,
      borderRadius: 999, padding: '4px 12px',
      fontSize: 12, fontWeight: 600, cursor: 'pointer',
      whiteSpace: 'nowrap',
    }}>{children}</button>
  );
}

function RowView({ row, onOpen, onInlineCommit }) {
  const tier = tierKey(row.tier);
  const tColor = TIER_COLORS[tier];
  return (
    <div onClick={onOpen} style={tableRow}
         onMouseEnter={(e) => (e.currentTarget.style.background = theme.bgHover)}
         onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
      <div style={{ flex: 0.5, textAlign: 'right', color: theme.textMuted, fontSize: 12, fontVariantNumeric: 'tabular-nums' }}>
        {row.rank == null || row.rank === '' ? '—' : row.rank}
      </div>
      <div style={{ flex: 2, minWidth: 0 }}>
        <div style={{ fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.name || <span style={{ color: theme.textMuted }}>(no name)</span>}
        </div>
        <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
          {row.ig_handle ? `@${row.ig_handle}` : ''}
          {row.ig_followers ? `${row.ig_handle ? ' · ' : ''}IG ${fmtCompact(row.ig_followers)}` : ''}
        </div>
      </div>
      <div style={{ flex: 0.7 }}>
        <span style={{
          display: 'inline-block', padding: '2px 8px', borderRadius: 999,
          fontSize: 11, fontWeight: 600, color: tColor,
          background: `${tColor}22`, border: `1px solid ${tColor}55`,
        }}>{tier}</span>
      </div>
      <div style={{ flex: 1.2, color: theme.textDim, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {row.category || '—'}
      </div>
      <div style={{ flex: 1, color: theme.textDim, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {[row.city, row.nationality].filter(Boolean).join(' / ') || '—'}
      </div>
      <InlineNumberCell flex={0.9} value={row.total_reach} onCommit={(v) => onInlineCommit(row, 'total_reach', v, true)} />
      <InlineNumberCell flex={0.7} value={row.engagement}  onCommit={(v) => onInlineCommit(row, 'engagement', v, true)} suffix="%" />
      <InlineNumberCell flex={0.8} value={row.est_rate}    onCommit={(v) => onInlineCommit(row, 'est_rate', v, true)} />
    </div>
  );
}

function InlineNumberCell({ value, onCommit, flex, suffix }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value == null ? '' : String(value));
  useEffect(() => { setV(value == null ? '' : String(value)); }, [value]);

  function commit() {
    setEditing(false);
    if ((value ?? null) === (v === '' ? null : Number(v))) return;
    onCommit(v);
  }

  if (!editing) {
    const display = value == null || value === '' ? '—' : fmtCompact(value);
    return (
      <div
        onClick={(e) => { e.stopPropagation(); setEditing(true); }}
        title="Click to edit"
        style={{
          flex, textAlign: 'right',
          color: theme.text, fontSize: 13,
          fontVariantNumeric: 'tabular-nums',
          padding: '2px 6px', margin: '-2px -6px',
          borderRadius: 4, border: '1px dashed transparent', cursor: 'text',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = theme.border; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
      >
        {display}{suffix && display !== '—' ? suffix : ''}
      </div>
    );
  }
  return (
    <input
      autoFocus
      type="number"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur();
        if (e.key === 'Escape') { setV(value == null ? '' : String(value)); setEditing(false); }
      }}
      style={{
        flex, textAlign: 'right',
        background: theme.bg3, color: theme.text,
        border: `1px solid ${theme.gold}`, borderRadius: 4,
        padding: '4px 6px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
        fontVariantNumeric: 'tabular-nums', minWidth: 0,
      }}
    />
  );
}

function EditDrawer({ row, categories, onClose, onSave, onDelete }) {
  const isNew = !row.id;
  const [form, setForm] = useState(() => ({ ...EMPTY, ...row }));
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={drawerStyle}>
        <div style={drawerHeader}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
              {isNew ? 'New influencer' : 'Edit influencer'}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginTop: 2 }}>
              {form.name || (isNew ? 'Untitled' : '—')}
            </div>
          </div>
          <button onClick={onClose} style={ghostBtn}>Close</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          <Section title="Identity">
            <Row>
              <Field label="Rank"        value={form.rank}        onChange={(v) => set('rank', v)}        type="number" />
              <Field label="Name"        value={form.name}        onChange={(v) => set('name', v)} />
            </Row>
            <Row>
              <Field label="Instagram handle" value={form.ig_handle} onChange={(v) => set('ig_handle', v)} prefix="@" />
              <Select label="Tier" value={form.tier || ''} onChange={(v) => set('tier', v)} options={['', ...TIER_OPTIONS]} />
            </Row>
            <Row>
              <Field label="Category"    value={form.category}    onChange={(v) => set('category', v)} list="cat-list" />
              <datalist id="cat-list">
                {categories.map((c) => <option key={c} value={c} />)}
              </datalist>
              <Field label="City"        value={form.city}        onChange={(v) => set('city', v)} />
            </Row>
            <Row>
              <Field label="Nationality" value={form.nationality} onChange={(v) => set('nationality', v)} />
              <div style={{ flex: 1 }} />
            </Row>
          </Section>
          <Section title="Reach">
            <Row>
              <Field label="IG followers"        value={form.ig_followers}        onChange={(v) => set('ig_followers', v)} type="number" />
              <Field label="TikTok followers"    value={form.tiktok_followers}    onChange={(v) => set('tiktok_followers', v)} type="number" />
            </Row>
            <Row>
              <Field label="YouTube subscribers" value={form.youtube_subscribers} onChange={(v) => set('youtube_subscribers', v)} type="number" />
              <Field label="Total reach"         value={form.total_reach}         onChange={(v) => set('total_reach', v)} type="number" />
            </Row>
            <Row>
              <Field label="Engagement (%)"      value={form.engagement}          onChange={(v) => set('engagement', v)} type="number" />
              <Field label="Est. rate (AED)"     value={form.est_rate}            onChange={(v) => set('est_rate', v)} type="number" />
            </Row>
          </Section>
        </div>
        <div style={drawerFooter}>
          {onDelete && <button onClick={onDelete} style={dangerBtn}>Delete</button>}
          <div style={{ flex: 1 }} />
          <button onClick={onClose} style={ghostBtn}>Cancel</button>
          <button onClick={() => onSave(form)} style={primaryBtn}>{isNew ? 'Create' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: theme.gold, textTransform: 'uppercase', marginBottom: 10 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Row({ children }) {
  return <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>{children}</div>;
}

function Field({ label, value, onChange, type = 'text', prefix, placeholder, list }) {
  return (
    <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span style={fieldLabel}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'stretch', background: theme.bg3, border: `1px solid ${theme.border}`, borderRadius: 6 }}>
        {prefix && (
          <span style={{ padding: '0 8px', display: 'flex', alignItems: 'center', color: theme.textMuted, fontSize: 13, borderRight: `1px solid ${theme.border}` }}>
            {prefix}
          </span>
        )}
        <input
          type={type}
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          list={list}
          style={bareInput}
        />
      </div>
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
      <span style={fieldLabel}>{label}</span>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        {options.map((o) => <option key={o} value={o}>{o || '—'}</option>)}
      </select>
    </label>
  );
}

const fieldLabel = { fontSize: 10, fontWeight: 700, letterSpacing: 1, color: theme.textMuted, textTransform: 'uppercase' };
const inputStyle = {
  background: theme.bg3, color: theme.text,
  border: `1px solid ${theme.border}`, borderRadius: 6,
  padding: '8px 10px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
};
const bareInput = {
  flex: 1, background: 'transparent', color: theme.text,
  border: 'none', padding: '8px 10px', fontSize: 13, outline: 'none',
  fontFamily: 'inherit', width: '100%',
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
