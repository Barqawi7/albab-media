import { theme } from '../../lib/theme';
import { useCrud } from '../../lib/useCrud';
import { Toast } from '../Toast';
import {
  PageHeader, SectionHeading, Card, EmptyState,
  InlineText, IconButton, btnPrimary, errorBox,
} from '../ui';

// PERSONAL → Ideas. A freewriting page: quick bullet points + one open freewrite
// area. Both persist to Supabase (ideas table). The freewrite lives in a single
// row flagged category='freewrite'; bullets are ordinary idea rows.

export default function Ideas() {
  const { rows, loading, error, add, update, remove, undo } =
    useCrud('ideas', { order: 'created_at', ascending: true, label: 'idea' });

  const freewrite = rows.find((r) => r.category === 'freewrite');
  const bullets = rows.filter((r) => r.category !== 'freewrite');

  async function saveFreewrite(text) {
    if (freewrite) {
      if ((freewrite.notes || '') !== (text || '')) update(freewrite, { notes: text });
    } else if (text && text.trim()) {
      add({ title: 'Freewrite', category: 'freewrite', notes: text });
    }
  }

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <PageHeader
        group="Personal"
        title="Ideas"
        right={<button onClick={() => add({ title: '', status: 'raw' })} style={btnPrimary}>+ Bullet</button>}
      />

      {error && <div style={errorBox}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.4fr)', gap: 16, marginTop: 20, alignItems: 'start' }}>
        {/* Bullets */}
        <Card title="Bullet points">
          <div style={{ padding: '10px 12px' }}>
            {loading ? (
              <EmptyState>Loading…</EmptyState>
            ) : bullets.length === 0 ? (
              <EmptyState>No bullets yet.</EmptyState>
            ) : (
              bullets.map((r) => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                  <span style={{ color: theme.gold, fontSize: 16, lineHeight: 1 }}>•</span>
                  <div style={{ flex: 1 }}>
                    <InlineText
                      value={r.title}
                      onCommit={(v) => update(r, { title: v })}
                      placeholder="New thought…"
                      style={{ border: '1px solid transparent', background: 'transparent', padding: '4px 6px' }}
                    />
                  </div>
                  <IconButton title="Delete" danger onClick={() => remove(r)}>✕</IconButton>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Freewrite */}
        <Card title="Freewrite">
          <div style={{ padding: '12px 14px' }}>
            <textarea
              key={freewrite?.id || 'freewrite-new'}
              defaultValue={freewrite?.notes || ''}
              onBlur={(e) => saveFreewrite(e.target.value)}
              placeholder="Open space — write freely. Saves when you click away."
              rows={18}
              style={{
                width: '100%', background: theme.bg3, color: theme.text,
                border: `1px solid ${theme.border}`, borderRadius: 8,
                padding: '12px 14px', fontSize: 14, lineHeight: 1.6, outline: 'none',
                fontFamily: 'inherit', resize: 'vertical',
              }}
            />
            <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 6 }}>
              Autosaves to Supabase on blur.
            </div>
          </div>
        </Card>
      </div>

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}
