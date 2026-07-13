import { theme } from '../../lib/theme';
import { useCrud } from '../../lib/useCrud';
import { Toast } from '../Toast';
import {
  PageHeader, SectionHeading, AIFeedPlaceholder, Card, EmptyState,
  InlineText, IconButton, btnPrimary, errorBox,
} from '../ui';

// CONTENT & MARKETING → Marketing.
// (a) A placeholder panel for an AI feed on digital marketing / platforms /
//     algorithm updates (wired later).
// (b) An editable area for my own ideas & strategies — saved to Supabase
//     (marketing_ideas), fully add / edit / delete with undo.

export default function Marketing() {
  const { rows, loading, error, add, update, remove, undo } =
    useCrud('marketing_ideas', { label: 'idea' });

  // Pinned first, then newest.
  const sorted = [...rows].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <PageHeader
        group="Content & Marketing"
        title="Marketing"
        right={<button onClick={() => add({ title: '', body: '', pinned: false })} style={btnPrimary}>+ Idea</button>}
      />

      {error && <div style={errorBox}>{error}</div>}

      <SectionHeading>AI marketing feed</SectionHeading>
      <div style={{ maxWidth: 720 }}>
        <AIFeedPlaceholder
          title="Digital marketing · platforms · algorithm updates"
          note="Live AI digest of platform + algorithm changes will render here. Connect your API key later — nothing is wired to a provider yet."
          lines={4}
        />
      </div>

      <SectionHeading>My ideas &amp; strategies</SectionHeading>
      {loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : sorted.length === 0 ? (
        <Card><EmptyState>No ideas yet. Hit “+ Idea” to start.</EmptyState></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
          {sorted.map((r) => (
            <Card
              key={r.id}
              style={{ borderColor: r.pinned ? theme.gold + '77' : theme.border }}
              title={<InlineTitle value={r.title} onCommit={(v) => update(r, { title: v })} />}
              right={
                <div style={{ display: 'flex', gap: 6 }}>
                  <IconButton title={r.pinned ? 'Unpin' : 'Pin'} onClick={() => update(r, { pinned: !r.pinned })}>
                    {r.pinned ? '★' : '☆'}
                  </IconButton>
                  <IconButton title="Delete" danger onClick={() => remove(r)}>✕</IconButton>
                </div>
              }
            >
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <InlineText
                  value={r.body}
                  onCommit={(v) => update(r, { body: v })}
                  placeholder="Write the idea / strategy…"
                  multiline
                  style={{ rows: 5 }}
                />
                <InlineText
                  value={r.tags}
                  onCommit={(v) => update(r, { tags: v })}
                  placeholder="tags (comma-separated)"
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}

function InlineTitle({ value, onCommit }) {
  return (
    <div style={{ flex: 1 }}>
      <InlineText
        value={value}
        onCommit={onCommit}
        placeholder="Untitled idea"
        style={{ fontWeight: 700, textTransform: 'none', border: '1px solid transparent', background: 'transparent', padding: '2px 4px' }}
      />
    </div>
  );
}
