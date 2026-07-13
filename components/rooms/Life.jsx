import { theme } from '../../lib/theme';
import { useCrud } from '../../lib/useCrud';
import { Toast } from '../Toast';
import { KPIBox } from './_RoomShell';
import {
  PageHeader, Card, EmptyState,
  InlineText, InlineNumber, IconButton, btnPrimary, errorBox,
} from '../ui';

// PERSONAL → Life. A clean Life KPIs dashboard — one card per life area with a
// 0–10 score bar, goal and next step. All editable, saved to Supabase.

function scoreColor(s) {
  const n = Number(s) || 0;
  if (n >= 7) return theme.green;
  if (n >= 4) return theme.amber;
  return theme.red;
}

export default function Life() {
  const { rows, loading, error, add, update, remove, undo } =
    useCrud('life_areas', { order: 'created_at', ascending: true, label: 'area' });

  const scored = rows.filter((r) => r.score != null && r.score !== '');
  const avg = scored.length
    ? Math.round((scored.reduce((a, r) => a + (Number(r.score) || 0), 0) / scored.length) * 10) / 10
    : 0;

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <PageHeader
        group="Personal"
        title="Life"
        right={<button onClick={() => add({ area: '', score: 5 })} style={btnPrimary}>+ Area</button>}
      />

      {error && <div style={errorBox}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 20 }}>
        <KPIBox label="Life areas"    value={rows.length} loading={loading} />
        <KPIBox label="Average score" value={`${avg}`} loading={loading} suffix="/ 10" color={scoreColor(avg)} />
        <KPIBox label="Tracked"       value={scored.length} loading={loading} />
      </div>

      {loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : rows.length === 0 ? (
        <Card style={{ marginTop: 18 }}><EmptyState>No life areas yet. Add health, finance, relationships…</EmptyState></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14, marginTop: 18 }}>
          {rows.map((r) => {
            const s = Math.max(0, Math.min(10, Number(r.score) || 0));
            return (
              <div key={r.id} style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <InlineText
                      value={r.area}
                      onCommit={(v) => update(r, { area: v })}
                      placeholder="Area name"
                      style={{ fontWeight: 700, fontSize: 15, border: '1px solid transparent', background: 'transparent', padding: '2px 4px' }}
                    />
                  </div>
                  <div style={{ width: 64 }}>
                    <InlineNumber value={r.score} onCommit={(v) => update(r, { score: v })} align="center" />
                  </div>
                  <IconButton title="Delete" danger onClick={() => remove(r)}>✕</IconButton>
                </div>

                {/* Score bar */}
                <div style={{ height: 8, background: theme.bg3, borderRadius: 999, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ width: `${s * 10}%`, height: '100%', background: scoreColor(s), transition: 'width .2s' }} />
                </div>

                <FieldLabel>Goal</FieldLabel>
                <InlineText value={r.goal} onCommit={(v) => update(r, { goal: v })} placeholder="What good looks like…" multiline style={{ rows: 2 }} />
                <div style={{ height: 8 }} />
                <FieldLabel>Next step</FieldLabel>
                <InlineText value={r.next_step} onCommit={(v) => update(r, { next_step: v })} placeholder="The very next action…" multiline style={{ rows: 2 }} />
              </div>
            );
          })}
        </div>
      )}

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}

function FieldLabel({ children }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: theme.textMuted, textTransform: 'uppercase', marginBottom: 4 }}>
      {children}
    </div>
  );
}
