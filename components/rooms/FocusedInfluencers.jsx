import RoomShell, { StatusPill, KPIBox, fmtCompact } from './_RoomShell';
import { theme } from '../../lib/theme';

// AGENTS → Focused Influencers. Backed by the `influencers_focused` table (the
// curated shortlist), schema per migration 0002. Add / edit / delete + undo come
// from RoomShell.

const fields = [
  { key: 'name',              label: 'Name',            section: 'Identity' },
  { key: 'category',          label: 'Category',        section: 'Identity' },
  { key: 'niche',             label: 'Niche',           section: 'Identity' },
  { key: 'country',           label: 'Country',         section: 'Identity' },
  { key: 'city',              label: 'City',            section: 'Identity' },
  { key: 'languages',         label: 'Languages',       section: 'Identity', placeholder: 'EN, AR' },

  { key: 'instagram',         label: 'Instagram',       section: 'Social', prefix: '@' },
  { key: 'tiktok',            label: 'TikTok',          section: 'Social', prefix: '@' },
  { key: 'youtube',           label: 'YouTube',         section: 'Social' },
  { key: 'primary_platform',  label: 'Primary platform', section: 'Social', type: 'select', options: ['instagram', 'tiktok', 'youtube', 'snapchat', 'x'] },

  { key: 'followers_instagram', label: 'IG followers',    section: 'Reach', type: 'number' },
  { key: 'followers_tiktok',    label: 'TikTok followers', section: 'Reach', type: 'number' },
  { key: 'followers_youtube',   label: 'YouTube subs',     section: 'Reach', type: 'number' },

  { key: 'rate_aed',          label: 'Rate (AED)',      section: 'Commercials', type: 'currency_aed' },
  { key: 'payment_terms',     label: 'Payment terms',   section: 'Commercials' },
  { key: 'status',            label: 'Status',          section: 'Commercials', type: 'select', options: ['active', 'paused', 'blacklist'] },

  { key: 'manager_name',      label: 'Manager',         section: 'Contact' },
  { key: 'email',             label: 'Email',           section: 'Contact' },
  { key: 'phone',             label: 'Phone',           section: 'Contact' },
  { key: 'whatsapp',          label: 'WhatsApp',        section: 'Contact' },
  { key: 'notes',             label: 'Notes',           section: 'Contact', multiline: true, full: true },
];

const columns = [
  { key: 'name',                label: 'Name',     flex: 1.8 },
  { key: 'category',            label: 'Category', flex: 1.1 },
  { key: 'city',                label: 'Location', flex: 1, render: (_, r) => [r.city, r.country].filter(Boolean).join(', ') || '—' },
  { key: 'followers_instagram', label: 'IG',       flex: 0.7, align: 'right', format: (v) => (v ? fmtCompact(v) : '—') },
  { key: 'rate_aed',            label: 'Rate AED', flex: 0.8, align: 'right', type: 'currency_aed' },
  { key: 'status',              label: 'Status',   flex: 0.8, render: (v) => <StatusPill value={v} /> },
];

function kpisFromRows(rows, { loading, totalCount } = {}) {
  const active = rows.filter((r) => String(r.status).toLowerCase() === 'active').length;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
      <KPIBox label="Focused list" value={totalCount ?? rows.length} loading={loading} />
      <KPIBox label="Active"       value={active} loading={loading} color={theme.green} />
    </div>
  );
}

export default function FocusedInfluencers() {
  return (
    <RoomShell
      title="Focused Influencers"
      group="Agents"
      tabs={[{
        key: 'influencers_focused', label: 'Focused',
        fields, columns,
        addLabel: 'Influencer',
        defaults: { status: 'active' },
        kpisFromRows,
      }]}
    />
  );
}
