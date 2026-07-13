import { theme } from '../../lib/theme';
import { useCrud } from '../../lib/useCrud';
import { Toast } from '../Toast';
import { PageHeader, Card, EmptyState, InlineText, IconButton, btnGhost, errorBox } from '../ui';

// PERSONAL → Objectives. Two columns split by category: Main / Secondary.
// Editable, saved to Supabase (objectives table) with undo.

const COLUMNS = ['Main', 'Secondary'];

export default function Objectives() {
  const { rows, loading, error, add, update, remove, undo } =
    useCrud('objectives', { order: 'created_at', ascending: true, label: 'objective' });

  const byCat = (cat) => rows.filter((r) => String(r.category || '').toLowerCase() === cat.toLowerCase());
  const other = rows.filter((r) => !COLUMNS.some((c) => c.toLowerCase() === String(r.category || '').toLowerCase()));

  function ColumnCard({ cat }) {
    const items = byCat(cat);
    return (
      <Card
        title={`${cat} · ${items.length}`}
        right={<button onClick={() => add({ category: cat, task: '' })} style={{ ...btnGhost, padding: '4px 10px', fontSize: 12 }}>+ Add</button>}
      >
        <div style={{ padding: '8px 10px' }}>
          {loading ? <EmptyState>Loading…</EmptyState> : items.length === 0 ? <EmptyState>No {cat.toLowerCase()} objectives yet.</EmptyState> : (
            items.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '5px 0', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
                <span style={{ color: cat === 'Main' ? theme.gold : theme.blue, fontSize: 15, lineHeight: 1.4 }}>•</span>
                <div style={{ flex: 1 }}>
                  <InlineText value={r.task} onCommit={(v) => update(r, { task: v })} placeholder="Objective…" multiline style={{ rows: 2, border: '1px solid transparent', background: 'transparent', padding: '4px 6px' }} />
                </div>
                <IconButton title="Delete" danger onClick={() => remove(r)}>✕</IconButton>
              </div>
            ))
          )}
        </div>
      </Card>
    );
  }

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <PageHeader group="Personal" title="Objectives" />

      {error && <div style={errorBox}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, marginTop: 20, alignItems: 'start' }}>
        {COLUMNS.map((c) => <ColumnCard key={c} cat={c} />)}
      </div>

      {other.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Card title={`Other · ${other.length}`}>
            <div style={{ padding: '8px 10px' }}>
              {other.map((r, i) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}` }}>
                  <span style={{ fontSize: 11, color: theme.textMuted, minWidth: 70 }}>{r.category || '—'}</span>
                  <div style={{ flex: 1 }}>
                    <InlineText value={r.task} onCommit={(v) => update(r, { task: v })} placeholder="Objective…" style={{ border: '1px solid transparent', background: 'transparent' }} />
                  </div>
                  <IconButton title="Delete" danger onClick={() => remove(r)}>✕</IconButton>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}
