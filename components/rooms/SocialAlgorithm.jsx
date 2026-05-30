import RoomShell, { StatusPill, fmtDate } from './_RoomShell';

const fields = [
  { key: 'platform',      label: 'Platform',       section: 'What', type: 'select', options: ['instagram', 'tiktok', 'youtube', 'x', 'general'] },
  { key: 'topic',         label: 'Topic',          section: 'What' },
  { key: 'impact',        label: 'Impact',         section: 'What', type: 'select', options: ['low', 'med', 'high'] },
  { key: 'date_observed', label: 'Date observed',  section: 'What', type: 'date' },
  { key: 'finding',       label: 'Finding',        section: 'Detail', multiline: true, full: true },
  { key: 'source',        label: 'Source',         section: 'Detail' },
  { key: 'still_valid',   label: 'Still valid?',   section: 'Detail', type: 'select', options: ['true', 'false'] },
  { key: 'notes',         label: 'Notes',          section: 'Detail', multiline: true, full: true },
];

const columns = [
  { key: 'platform',      label: 'Platform',  flex: 0.8 },
  { key: 'topic',         label: 'Topic',     flex: 1.4 },
  { key: 'finding',       label: 'Finding',   flex: 2.4 },
  { key: 'date_observed', label: 'Observed',  flex: 0.8, format: fmtDate },
  { key: 'impact',        label: 'Impact',    flex: 0.7, render: (v) => <StatusPill value={v} palette={{ high: '#EF4444', med: '#F59E0B', low: '#9BA3AF' }} /> },
];

export default function SocialAlgorithm() {
  return (
    <RoomShell
      title="Social Algorithm"
      group="Content & Marketing"
      tabs={[{ key: 'social_algorithm_notes', label: 'Notes', fields, columns, addLabel: 'Finding', defaults: { impact: 'med', still_valid: 'true' } }]}
    />
  );
}
