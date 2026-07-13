import { useMemo } from 'react';
import { theme } from '../../lib/theme';
import { useCrud } from '../../lib/useCrud';
import { Toast } from '../Toast';
import { KPIBox } from './_RoomShell';
import { PageHeader, InlineText, IconButton, btnPrimary, errorBox } from '../ui';

// CONTENT & MARKETING → Content. VFX / production assets from content_assets,
// grouped by status, with an "on HDD" badge. Editable + undo.

const KNOWN_STATUSES = ['Approved', 'Discontinued', 'Pending', 'Rejected'];
const STATUS_COLOR = { Approved: theme.green, Pending: theme.amber, Discontinued: theme.textMuted, Rejected: theme.red };

function onHddYes(v) {
  const s = String(v ?? '').trim().toLowerCase();
  return s === 'yes' || s === 'true' || s === 'y' || s === '1' || s === 'on hdd';
}

export default function Content() {
  const { rows, loading, error, add, update, remove, undo } =
    useCrud('content_assets', { order: 'created_at', ascending: true, label: 'asset' });

  const statuses = useMemo(() => {
    const set = new Set(KNOWN_STATUSES);
    for (const r of rows) if (r.status) set.add(r.status);
    return Array.from(set);
  }, [rows]);

  const columns = useMemo(() => {
    const present = new Set();
    for (const r of rows) present.add(r.status || 'Unset');
    // Keep known order first, then any extras, then Unset
    const ordered = [...KNOWN_STATUSES.filter((s) => present.has(s))];
    for (const s of present) if (!ordered.includes(s) && s !== 'Unset') ordered.push(s);
    if (present.has('Unset')) ordered.push('Unset');
    return ordered;
  }, [rows]);

  const onHddCount = rows.filter((r) => onHddYes(r.on_hdd)).length;

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <PageHeader
        group="Content & Marketing"
        title="Content"
        right={<button onClick={() => add({ name: '', status: 'Pending', on_hdd: 'No' })} style={btnPrimary}>+ Asset</button>}
      />

      {error && <div style={errorBox}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 20 }}>
        <KPIBox label="Total assets" value={rows.length} loading={loading} />
        {KNOWN_STATUSES.map((s) => (
          <KPIBox key={s} label={s} value={rows.filter((r) => r.status === s).length} color={STATUS_COLOR[s]} />
        ))}
        <KPIBox label="On HDD" value={onHddCount} color={theme.blue} />
      </div>

      {loading ? (
        <div style={{ color: theme.textMuted, fontSize: 13, padding: '20px 0' }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ color: theme.textMuted, fontSize: 13, padding: '20px 0' }}>No assets yet. Import content_assets.csv, then refresh.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.max(1, columns.length)}, minmax(230px, 1fr))`, gap: 10, marginTop: 18, overflowX: 'auto', paddingBottom: 8 }}>
          {columns.map((status) => {
            const items = rows.filter((r) => (r.status || 'Unset') === status);
            const color = STATUS_COLOR[status] || theme.textDim;
            return (
              <div key={status} style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 10, display: 'flex', flexDirection: 'column', minHeight: 200 }}>
                <div style={{ padding: '9px 11px', borderTop: `2px solid ${color}`, borderTopLeftRadius: 10, borderTopRightRadius: 10, borderBottom: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: 0.5 }}>{status}</span>
                  <span style={{ fontSize: 11, color: theme.textMuted }}>{items.length}</span>
                </div>
                <div style={{ flex: 1, padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {items.map((r) => {
                    const hdd = onHddYes(r.on_hdd);
                    return (
                      <div key={r.id} style={{ background: theme.bg3, border: `1px solid ${theme.border}`, borderRadius: 8, padding: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4 }}>
                          <InlineText value={r.name} onCommit={(v) => update(r, { name: v })} placeholder="Asset name" style={{ fontWeight: 600, border: '1px solid transparent', background: 'transparent', padding: '3px 4px' }} />
                          <IconButton title="Delete" danger onClick={() => remove(r)}>✕</IconButton>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 6 }}>
                          <button
                            onClick={() => update(r, { on_hdd: hdd ? 'No' : 'Yes' })}
                            title="Toggle on-HDD"
                            style={{
                              fontSize: 10, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
                              color: hdd ? theme.blue : theme.textMuted,
                              background: hdd ? theme.blue + '22' : 'transparent',
                              border: `1px solid ${hdd ? theme.blue + '77' : theme.border}`,
                              borderRadius: 999, padding: '2px 8px', cursor: 'pointer',
                            }}
                          >{hdd ? '💾 On HDD' : 'Not on HDD'}</button>
                          <select
                            value={r.status || 'Unset'}
                            onChange={(e) => update(r, { status: e.target.value })}
                            style={{ marginLeft: 'auto', background: theme.bg2, color: theme.textDim, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '3px 6px', fontSize: 11, outline: 'none', cursor: 'pointer' }}
                          >
                            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}
