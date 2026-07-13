import { theme } from '../../lib/theme';
import { useCrud } from '../../lib/useCrud';
import { Toast } from '../Toast';
import {
  PageHeader, SectionHeading, Card, EmptyState,
  InlineText, InlineSelect, IconButton, btnPrimary, errorBox,
} from '../ui';

// CONTENT & MARKETING → Events. An editable calendar of UAE events I can fill,
// plus a placeholder for an AI events feed. Upcoming events are also surfaced on
// Home. All rows persist to Supabase (events table).

const STATUSES = ['planned', 'confirmed', 'done', 'cancelled'];

function todayYmd() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function monthLabel(ymd) {
  if (!ymd) return 'No date';
  const d = new Date(ymd + 'T00:00:00');
  if (isNaN(d)) return 'No date';
  return d.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

function dayLabel(ymd) {
  if (!ymd) return '—';
  const d = new Date(ymd + 'T00:00:00');
  if (isNaN(d)) return ymd;
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' });
}

export default function Events() {
  const { rows, loading, error, add, update, remove, undo } =
    useCrud('events', { order: 'event_date', ascending: true, label: 'event' });

  const today = todayYmd();
  const sorted = [...rows].sort((a, b) => String(a.event_date || '9999').localeCompare(String(b.event_date || '9999')));

  // Group chronologically by month.
  const groups = [];
  let current = null;
  for (const r of sorted) {
    const key = monthLabel(r.event_date);
    if (!current || current.key !== key) { current = { key, items: [] }; groups.push(current); }
    current.items.push(r);
  }

  const upcomingCount = rows.filter((r) => r.event_date && r.event_date >= today).length;

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <PageHeader
        group="Content & Marketing"
        title="Events"
        right={<button onClick={() => add({ name: '', event_date: today, status: 'planned', country: 'UAE' })} style={btnPrimary}>+ Event</button>}
      >
        <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 6 }}>
          {loading ? 'loading…' : `${rows.length} total · ${upcomingCount} upcoming`}
        </div>
      </PageHeader>

      {error && <div style={errorBox}>{error}</div>}

      <SectionHeading>AI events feed (UAE)</SectionHeading>
      <div style={{ maxWidth: 720 }}>
        <AIEventsPlaceholder />
      </div>

      <SectionHeading>My calendar</SectionHeading>
      {loading ? (
        <EmptyState>Loading…</EmptyState>
      ) : groups.length === 0 ? (
        <Card><EmptyState>No events yet. Hit “+ Event” to start filling your UAE calendar.</EmptyState></Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {groups.map((g) => (
            <div key={g.key}>
              <div style={{ fontSize: 12, fontWeight: 700, color: theme.gold, letterSpacing: 0.6, marginBottom: 8 }}>{g.key}</div>
              <Card>
                {g.items.map((r, i) => {
                  const past = r.event_date && r.event_date < today;
                  return (
                    <div key={r.id} style={{
                      display: 'grid', gridTemplateColumns: '120px 1.6fr 1.2fr 110px 32px', gap: 10, alignItems: 'center',
                      padding: '10px 14px', borderTop: i === 0 ? 'none' : `1px solid ${theme.border}`,
                      opacity: past && r.status !== 'confirmed' ? 0.7 : 1,
                    }}>
                      <div>
                        <input
                          type="date"
                          value={r.event_date || ''}
                          onChange={(e) => update(r, { event_date: e.target.value || null })}
                          style={{ background: theme.bg3, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 6, padding: '5px 7px', fontSize: 12, fontFamily: 'inherit', width: '100%' }}
                          title={dayLabel(r.event_date)}
                        />
                      </div>
                      <InlineText value={r.name} onCommit={(v) => update(r, { name: v })} placeholder="Event name" style={{ border: '1px solid transparent', background: 'transparent', fontWeight: 600 }} />
                      <InlineText value={r.city ? `${r.city}` : r.location} onCommit={(v) => update(r, { city: v })} placeholder="City / venue" />
                      <InlineSelect value={r.status} options={STATUSES} onCommit={(v) => update(r, { status: v })} />
                      <IconButton title="Delete" danger onClick={() => remove(r)}>✕</IconButton>
                    </div>
                  );
                })}
              </Card>
            </div>
          ))}
        </div>
      )}

      <Toast toast={undo.toast} onUndo={undo.runUndo} onDismiss={undo.dismiss} />
    </div>
  );
}

function AIEventsPlaceholder() {
  return (
    <div style={{ border: `1px dashed ${theme.borderStrong}`, borderRadius: 12, background: theme.bg2, padding: '16px 18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>📅</span>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>AI events feed — UAE</div>
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.gold, background: theme.goldTint, border: `1px solid ${theme.gold}55`, borderRadius: 999, padding: '2px 8px' }}>
          Connect API key later
        </span>
      </div>
      <div style={{ fontSize: 12, color: theme.textMuted }}>
        Auto-discovered UAE events (expos, launches, galas) will land here and be one click to add to your calendar. Not wired to a provider yet.
      </div>
    </div>
  );
}
