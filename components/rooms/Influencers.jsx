import { useEffect, useMemo, useState } from 'react';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';

const TABS = [
  { key: 'influencers_comprehensive', label: 'Comprehensive' },
  { key: 'influencers_focused',       label: 'Focused' },
];

const STATUS_OPTIONS = ['active', 'paused', 'blacklist'];
const PLATFORMS = ['instagram', 'tiktok', 'youtube', 'x_twitter', 'snapchat'];

const EMPTY = {
  name: '', country: '', city: '',
  instagram: '', tiktok: '', youtube: '', x_twitter: '', snapchat: '',
  followers_instagram: '', followers_tiktok: '', followers_youtube: '',
  followers_x: '', followers_snapchat: '',
  primary_platform: '',
  niche: '', category: '', languages: '',
  rate_aed: '', payment_terms: '', currency_notes: '',
  status: 'active', notes: '',
  email: '', phone: '', whatsapp: '', manager_name: '',
};

function fmtFollowers(n) {
  if (n == null || n === '') return '';
  const v = Number(n);
  if (!Number.isFinite(v)) return '';
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(v >= 10_000_000 ? 0 : 1) + 'M';
  if (v >= 1_000)     return (v / 1_000).toFixed(v >= 10_000 ? 0 : 1) + 'K';
  return String(v);
}

function totalFollowers(row) {
  return PLATFORMS.reduce((sum, p) => {
    const col = p === 'x_twitter' ? 'followers_x' : `followers_${p}`;
    const v = Number(row?.[col]);
    return sum + (Number.isFinite(v) ? v : 0);
  }, 0);
}

export default function Influencers() {
  const [tab, setTab] = useState(TABS[0].key);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editing, setEditing] = useState(null); // null | EMPTY | row

  async function load() {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from(tab)
      .select('*')
      .order('created_at', { ascending: false });
    if (error) setError(error.message);
    setRows(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [tab]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (statusFilter !== 'all' && (r.status || 'active') !== statusFilter) return false;
      if (!q) return true;
      const hay = [
        r.name, r.country, r.city, r.niche, r.category, r.languages,
        r.instagram, r.tiktok, r.youtube, r.x_twitter, r.snapchat,
        r.email, r.phone, r.whatsapp, r.manager_name,
      ].filter(Boolean).join(' ').toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query, statusFilter]);

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
            People
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: theme.gold }}>Influencers</h1>
        </div>
        <button
          onClick={() => setEditing({ ...EMPTY })}
          style={primaryBtn}
        >
          + Add influencer
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginTop: 22, borderBottom: `1px solid ${theme.border}` }}>
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: 'transparent',
                border: 'none',
                color: active ? theme.gold : theme.textDim,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                cursor: 'pointer',
                borderBottom: active ? `2px solid ${theme.gold}` : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '16px 0 12px', flexWrap: 'wrap' }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, handle, niche, country…"
          style={{ ...inputStyle, flex: 1, minWidth: 240 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ ...inputStyle, width: 150 }}
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div style={{ color: theme.textMuted, fontSize: 12, marginLeft: 'auto' }}>
          {loading ? 'loading…' : `${filtered.length} of ${rows.length}`}
        </div>
      </div>

      {error && (
        <div style={{ padding: 12, background: 'rgba(239,68,68,0.08)', border: `1px solid ${theme.red}`, borderRadius: 8, color: theme.red, marginBottom: 12, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden', background: theme.bg2 }}>
        <div style={tableHeader}>
          <div style={{ flex: 2 }}>Name</div>
          <div style={{ flex: 1.2 }}>Location</div>
          <div style={{ flex: 1.4 }}>Primary</div>
          <div style={{ flex: 1, textAlign: 'right' }}>Total reach</div>
          <div style={{ flex: 1.2 }}>Niche</div>
          <div style={{ flex: 0.9, textAlign: 'right' }}>Rate (AED)</div>
          <div style={{ flex: 0.8 }}>Status</div>
        </div>
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: theme.textMuted, fontSize: 13 }}>
            {rows.length === 0 ? 'No influencers yet. Click "+ Add influencer" to add the first one.' : 'No matches.'}
          </div>
        )}
        {filtered.map((r) => (
          <div
            key={r.id}
            onClick={() => setEditing(r)}
            style={tableRow}
            onMouseEnter={(e) => (e.currentTarget.style.background = theme.bgHover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ flex: 2, minWidth: 0 }}>
              <div style={{ fontWeight: 600, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {r.name || <span style={{ color: theme.textMuted }}>(no name)</span>}
              </div>
              <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 2 }}>
                {[r.instagram && `@${r.instagram}`, r.tiktok && `tt:${r.tiktok}`].filter(Boolean).join(' · ')}
              </div>
            </div>
            <div style={{ flex: 1.2, color: theme.textDim, fontSize: 13 }}>
              {[r.city, r.country].filter(Boolean).join(', ') || '—'}
            </div>
            <div style={{ flex: 1.4, color: theme.textDim, fontSize: 13 }}>
              {r.primary_platform || '—'}
            </div>
            <div style={{ flex: 1, textAlign: 'right', color: theme.text, fontVariantNumeric: 'tabular-nums' }}>
              {fmtFollowers(totalFollowers(r)) || '—'}
            </div>
            <div style={{ flex: 1.2, color: theme.textDim, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.niche || '—'}
            </div>
            <div style={{ flex: 0.9, textAlign: 'right', color: theme.text, fontVariantNumeric: 'tabular-nums' }}>
              {r.rate_aed != null && r.rate_aed !== '' ? Number(r.rate_aed).toLocaleString() : '—'}
            </div>
            <div style={{ flex: 0.8 }}>
              <StatusPill value={r.status} />
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditDrawer
          row={editing}
          table={tab}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
          onDeleted={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function StatusPill({ value }) {
  const v = value || 'active';
  const color = v === 'active' ? theme.green : v === 'paused' ? theme.amber : theme.red;
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      color,
      background: `${color}22`,
      border: `1px solid ${color}55`,
      textTransform: 'capitalize',
    }}>
      {v}
    </span>
  );
}

function EditDrawer({ row, table, onClose, onSaved, onDeleted }) {
  const isNew = !row.id;
  const [form, setForm] = useState(() => ({ ...EMPTY, ...row }));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    setSaving(true);
    setErr(null);

    // Coerce numeric fields; empty string → null
    const numericKeys = ['followers_instagram','followers_tiktok','followers_youtube','followers_x','followers_snapchat','rate_aed'];
    const payload = {};
    for (const [k, v] of Object.entries(form)) {
      if (k === 'id' || k === 'created_at' || k === 'updated_at') continue;
      if (numericKeys.includes(k)) {
        payload[k] = v === '' || v == null ? null : Number(v);
      } else {
        payload[k] = v === '' ? null : v;
      }
    }

    const q = isNew
      ? supabase.from(table).insert(payload).select().single()
      : supabase.from(table).update(payload).eq('id', row.id).select().single();
    const { error } = await q;
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  async function remove() {
    if (!confirm(`Delete ${form.name || 'this influencer'}? This cannot be undone.`)) return;
    setSaving(true);
    const { error } = await supabase.from(table).delete().eq('id', row.id);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onDeleted();
  }

  async function moveToOther() {
    const target = table === 'influencers_comprehensive' ? 'influencers_focused' : 'influencers_comprehensive';
    const verb = target === 'influencers_focused' ? 'Promote to Focused' : 'Move to Comprehensive';
    if (!confirm(`${verb}? A copy will be inserted into the other tab.`)) return;
    setSaving(true);
    setErr(null);
    const { id, created_at, updated_at, ...rest } = form;
    const { error } = await supabase.from(target).insert(rest);
    setSaving(false);
    if (error) { setErr(error.message); return; }
    onSaved();
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 50,
        display: 'flex', justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 560, maxWidth: '100%', height: '100%', background: theme.bg2,
          borderLeft: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column',
        }}
      >
        <div style={{ padding: '16px 22px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
            <Row><Field label="Name" value={form.name} onChange={(v) => set('name', v)} autoFocus /></Row>
            <Row>
              <Field label="Country" value={form.country} onChange={(v) => set('country', v)} />
              <Field label="City" value={form.city} onChange={(v) => set('city', v)} />
            </Row>
          </Section>

          <Section title="Handles">
            <Row>
              <Field label="Instagram" value={form.instagram} onChange={(v) => set('instagram', v)} prefix="@" />
              <Field label="TikTok" value={form.tiktok} onChange={(v) => set('tiktok', v)} prefix="@" />
            </Row>
            <Row>
              <Field label="YouTube" value={form.youtube} onChange={(v) => set('youtube', v)} prefix="@" />
              <Field label="X / Twitter" value={form.x_twitter} onChange={(v) => set('x_twitter', v)} prefix="@" />
            </Row>
            <Row>
              <Field label="Snapchat" value={form.snapchat} onChange={(v) => set('snapchat', v)} prefix="@" />
              <Select label="Primary platform" value={form.primary_platform} onChange={(v) => set('primary_platform', v)}
                options={['', ...PLATFORMS]} />
            </Row>
          </Section>

          <Section title="Reach (followers)">
            <Row>
              <Field label="Instagram" type="number" value={form.followers_instagram} onChange={(v) => set('followers_instagram', v)} />
              <Field label="TikTok" type="number" value={form.followers_tiktok} onChange={(v) => set('followers_tiktok', v)} />
            </Row>
            <Row>
              <Field label="YouTube" type="number" value={form.followers_youtube} onChange={(v) => set('followers_youtube', v)} />
              <Field label="X" type="number" value={form.followers_x} onChange={(v) => set('followers_x', v)} />
            </Row>
            <Row>
              <Field label="Snapchat" type="number" value={form.followers_snapchat} onChange={(v) => set('followers_snapchat', v)} />
              <div style={{ flex: 1 }} />
            </Row>
          </Section>

          <Section title="Niche & language">
            <Row>
              <Field label="Niche" value={form.niche} onChange={(v) => set('niche', v)} placeholder="fashion, beauty, food…" />
              <Field label="Category" value={form.category} onChange={(v) => set('category', v)} placeholder="mega / macro / micro / nano" />
            </Row>
            <Row>
              <Field label="Languages" value={form.languages} onChange={(v) => set('languages', v)} placeholder="EN, AR" />
              <div style={{ flex: 1 }} />
            </Row>
          </Section>

          <Section title="Commercials">
            <Row>
              <Field label="Rate (AED)" type="number" value={form.rate_aed} onChange={(v) => set('rate_aed', v)} />
              <Field label="Payment terms" value={form.payment_terms} onChange={(v) => set('payment_terms', v)} placeholder="50% upfront, net 30…" />
            </Row>
            <Row>
              <Field label="Currency notes" value={form.currency_notes} onChange={(v) => set('currency_notes', v)} />
            </Row>
          </Section>

          <Section title="Status & contact">
            <Row>
              <Select label="Status" value={form.status || 'active'} onChange={(v) => set('status', v)} options={STATUS_OPTIONS} />
              <Field label="Manager name" value={form.manager_name} onChange={(v) => set('manager_name', v)} />
            </Row>
            <Row>
              <Field label="Email" value={form.email} onChange={(v) => set('email', v)} />
              <Field label="Phone" value={form.phone} onChange={(v) => set('phone', v)} />
            </Row>
            <Row>
              <Field label="WhatsApp" value={form.whatsapp} onChange={(v) => set('whatsapp', v)} />
              <div style={{ flex: 1 }} />
            </Row>
            <Row>
              <Field label="Notes" value={form.notes} onChange={(v) => set('notes', v)} multiline />
            </Row>
          </Section>

          {err && (
            <div style={{ padding: 12, background: 'rgba(239,68,68,0.08)', border: `1px solid ${theme.red}`, borderRadius: 8, color: theme.red, marginTop: 8, fontSize: 13 }}>
              {err}
            </div>
          )}
        </div>

        <div style={{ padding: '14px 22px', borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 8, alignItems: 'center' }}>
          {!isNew && (
            <button onClick={remove} disabled={saving} style={dangerBtn}>Delete</button>
          )}
          {!isNew && (
            <button onClick={moveToOther} disabled={saving} style={ghostBtn}>
              {table === 'influencers_comprehensive' ? '→ Focused' : '→ Comprehensive'}
            </button>
          )}
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

function Field({ label, value, onChange, type = 'text', prefix, placeholder, multiline, autoFocus }) {
  return (
    <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={fieldLabel}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'stretch', background: theme.bg3, border: `1px solid ${theme.border}`, borderRadius: 6 }}>
        {prefix && (
          <span style={{ padding: '0 8px', display: 'flex', alignItems: 'center', color: theme.textMuted, fontSize: 13, borderRight: `1px solid ${theme.border}` }}>
            {prefix}
          </span>
        )}
        {multiline ? (
          <textarea
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            style={{ ...bareInput, resize: 'vertical' }}
          />
        ) : (
          <input
            type={type}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            autoFocus={autoFocus}
            style={bareInput}
          />
        )}
      </div>
    </label>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={fieldLabel}>{label}</span>
      <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        {options.map((o) => <option key={o} value={o}>{o || '—'}</option>)}
      </select>
    </label>
  );
}

const fieldLabel = {
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1,
  color: theme.textMuted,
  textTransform: 'uppercase',
};

const inputStyle = {
  background: theme.bg3,
  color: theme.text,
  border: `1px solid ${theme.border}`,
  borderRadius: 6,
  padding: '8px 10px',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
};

const bareInput = {
  flex: 1,
  background: 'transparent',
  color: theme.text,
  border: 'none',
  padding: '8px 10px',
  fontSize: 13,
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
};

const primaryBtn = {
  background: theme.gold,
  color: '#0A0E14',
  border: 'none',
  borderRadius: 6,
  padding: '8px 14px',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};

const ghostBtn = {
  background: 'transparent',
  color: theme.textDim,
  border: `1px solid ${theme.border}`,
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 13,
  cursor: 'pointer',
};

const dangerBtn = {
  background: 'transparent',
  color: theme.red,
  border: `1px solid ${theme.red}55`,
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 13,
  cursor: 'pointer',
};

const tableHeader = {
  display: 'flex',
  gap: 14,
  padding: '10px 16px',
  background: theme.bg3,
  borderBottom: `1px solid ${theme.border}`,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: 1,
  color: theme.textMuted,
  textTransform: 'uppercase',
};

const tableRow = {
  display: 'flex',
  gap: 14,
  alignItems: 'center',
  padding: '12px 16px',
  borderBottom: `1px solid ${theme.border}`,
  fontSize: 13,
  cursor: 'pointer',
  transition: 'background .1s',
};
