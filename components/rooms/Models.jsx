import RoomShell, { StatusPill } from './_RoomShell';

const fields = [
  { key: 'name',             label: 'Name',             section: 'Identity' },
  { key: 'type',             label: 'Type',             section: 'Identity', type: 'select', options: ['fashion', 'commercial', 'promotion', 'fit'] },
  { key: 'country',          label: 'Country',          section: 'Identity' },
  { key: 'city',             label: 'City',             section: 'Identity' },
  { key: 'languages',        label: 'Languages',        section: 'Identity', placeholder: 'EN, AR' },
  { key: 'agency',           label: 'Agency',           section: 'Identity' },

  { key: 'height_cm',        label: 'Height (cm)',      section: 'Measurements', type: 'number' },
  { key: 'bust_cm',          label: 'Bust (cm)',        section: 'Measurements', type: 'number' },
  { key: 'waist_cm',         label: 'Waist (cm)',       section: 'Measurements', type: 'number' },
  { key: 'hips_cm',          label: 'Hips (cm)',        section: 'Measurements', type: 'number' },
  { key: 'dress_size',       label: 'Dress size',       section: 'Measurements' },
  { key: 'shoe_size_eu',     label: 'Shoe size (EU)',   section: 'Measurements' },

  { key: 'instagram',        label: 'Instagram',        section: 'Social', prefix: '@' },
  { key: 'tiktok',           label: 'TikTok',           section: 'Social', prefix: '@' },
  { key: 'primary_platform', label: 'Primary platform', section: 'Social', type: 'select', options: ['instagram', 'tiktok', 'youtube', 'snapchat'] },

  { key: 'rate_aed',         label: 'Day rate (AED)',   section: 'Commercials', type: 'currency_aed' },
  { key: 'status',           label: 'Status',           section: 'Commercials', type: 'select', options: ['active', 'paused', 'blacklist'] },

  { key: 'email',            label: 'Email',            section: 'Contact' },
  { key: 'phone',            label: 'Phone',            section: 'Contact' },
  { key: 'whatsapp',         label: 'WhatsApp',         section: 'Contact' },
  { key: 'notes',            label: 'Notes',            section: 'Contact', multiline: true, full: true },
];

const columns = [
  { key: 'name',       label: 'Name',     flex: 1.8 },
  { key: 'type',       label: 'Type',     flex: 0.9 },
  { key: 'city',       label: 'City',     flex: 1, render: (_, r) => [r.city, r.country].filter(Boolean).join(', ') || '—' },
  { key: 'height_cm',  label: 'Height',   flex: 0.6, align: 'right', format: (v) => v ? `${v}cm` : '—' },
  { key: 'agency',     label: 'Agency',   flex: 1 },
  { key: 'rate_aed',   label: 'Rate AED', flex: 0.8, align: 'right', type: 'currency_aed' },
  { key: 'status',     label: 'Status',   flex: 0.8, render: (v) => <StatusPill value={v} /> },
];

export default function Models() {
  return (
    <RoomShell
      title="Models Data"
      group="Agents"
      tabs={[{ key: 'models', label: 'Models', fields, columns, addLabel: 'Model', defaults: { status: 'active' } }]}
    />
  );
}
