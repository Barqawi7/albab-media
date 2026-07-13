import { useState } from 'react';
import { theme } from '../../lib/theme';
import { useCrud } from '../../lib/useCrud';
import { Toast } from '../Toast';
import {
  PageHeader, SectionHeading, Card, EmptyState,
  InlineText, InlineSelect, IconButton, btnPrimary, btnGhost, errorBox,
} from '../ui';

// CONTENT & MARKETING → Quick Comments.
// A copy-ready library of social comment snippets + emoji sets. Everything is
// stored in Supabase (quick_comments) and fully editable. Emoji sets are just
// rows with category = 'emoji', so "add your own" works for both.

const CATEGORIES = ['compliment', 'sales', 'follow-up', 'engagement', 'outreach'];

export default function QuickComments() {
  const { rows, loading, error, add, update, remove, undo } =
    useCrud('quick_comments', { label: 'snippet' });
  const [copiedId, setCopiedId] = useState(null);
  const [filter, setFilter] = useState('all');

  const snippets = rows.filter((r) => String(r.category) !== 'emoji');
  const emojis   = rows.filter((r) => String(r.category) === 'emoji');
  const shown = filter === 'all' ? snippets : snippets.filter((r) => r.category === filter);

  async function copy(row) {
    try {
      await navigator.clipboard.writeText(row.text || '');
      setCopiedId(row.id);
      setTimeout(() => setCopiedId((c) => (c === row.id ? null : c)), 1200);
      update(row, { use_count: (Number(row.use_count) || 0) + 1 });
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <PageHeader
        group="Content & Marketing"
        title="Quick Comments"
        right={
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => add({ text: '', category: 'compliment', language: 'EN', use_count: 0 })} style={btnPrimary}>+ Snippet</button>
            <button onClick={() => add({ text: '🔥❤️🙌', category: 'emoji', use_count: 0 })} style={btnGhost}>+ Emoji set</button>
          </div>
        }
      />

      {error && <div style={errorBox}>{error}</div>}

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, marginTop: 18, flexWrap: 'wrap' }}>
        {['all', ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setFilter(c)} style={{
            background: filter === c ? theme.goldTint : 'transparent',
            color: filter === c ? theme.gold : theme.textDim,
            border: `1px solid ${filter === c ? theme.gold : theme.border}`,
            borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
          }}>{c === 'all' ? 'All' : c}</button>
        ))}
      </div>

      <SectionHeading>Comment snippets</SectionHeading>
      {loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : shown.length === 0 ? (
        <Card><EmptyState>No snippets{filter !== 'all' ? ` in “${filter}”` : ''} yet.</EmptyState></Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {shown.map((r) => (
            <Card key={r.id} style={{ minHeight: 0 }}>
              <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <InlineText value={r.text} onCommit={(v) => update(r, { text: v })} placeholder="Comment text…" multiline style={{ rows: 3 }} />
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <InlineSelect value={r.category} options={CATEGORIES} onCommit={(v) => update(r, { category: v })} style={{ flex: 1 }} />
                  <InlineSelect value={r.language} options={['EN', 'AR', 'EN/AR']} onCommit={(v) => update(r, { language: v })} />
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: theme.textMuted }}>used {Number(r.use_count) || 0}×</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => copy(r)} style={{ ...btnPrimary, padding: '5px 12px', fontSize: 12 }}>
                      {copiedId === r.id ? 'Copied ✓' : 'Copy'}
                    </button>
                    <IconButton title="Delete" danger onClick={() => remove(r)}>✕</IconButton>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <SectionHeading>Emoji sets</SectionHeading>
      {emojis.length === 0 ? (
        <Card><EmptyState>No emoji sets yet. Hit “+ Emoji set”.</EmptyState></Card>
      ) : (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {emojis.map((r) => (
            <div key={r.id} style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                defaultValue={r.text || ''}
                onBlur={(e) => { if (e.target.value !== (r.text || '')) update(r, { text: e.target.value }); }}
                style={{ background: 'transparent', border: 'none', color: theme.text, fontSize: 20, width: Math.max(80, (r.text || '').length * 16), outline: 'none' }}
              />
              <button onClick={() => copy(r)} style={{ ...btnGhost, padding: '5px 10px', fontSize: 12 }}>
                {copiedId === r.id ? 'Copied ✓' : 'Copy'}
              </button>
              <IconButton title="Delete" danger onClick={() => remove(r)}>✕</IconButton>
            </div>
          ))}
        </div>
      )}

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}
