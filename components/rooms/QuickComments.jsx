import RoomShell from './_RoomShell';

const fields = [
  { key: 'text',      label: 'Comment text', section: 'Comment', multiline: true, full: true },
  { key: 'category',  label: 'Category',     section: 'Meta', type: 'select', options: ['compliment', 'sales', 'follow-up', 'engagement', 'outreach'] },
  { key: 'platform',  label: 'Platform',     section: 'Meta', type: 'select', options: ['instagram', 'tiktok', 'general', 'linkedin'] },
  { key: 'language',  label: 'Language',     section: 'Meta', type: 'select', options: ['EN', 'AR', 'EN/AR'] },
  { key: 'use_count', label: 'Use count',    section: 'Meta', type: 'number' },
  { key: 'notes',     label: 'Notes',        section: 'Meta', multiline: true, full: true },
];

const columns = [
  { key: 'text',      label: 'Comment',  flex: 3 },
  { key: 'category',  label: 'Category', flex: 1 },
  { key: 'platform',  label: 'Platform', flex: 1 },
  { key: 'language',  label: 'Lang',     flex: 0.5 },
  { key: 'use_count', label: 'Used',     flex: 0.5, align: 'right' },
];

export default function QuickComments() {
  return (
    <RoomShell
      title="Quick Comments"
      group="Content & Marketing"
      tabs={[{ key: 'quick_comments', label: 'Quick Comments', fields, columns, addLabel: 'Comment', defaults: { language: 'EN', use_count: 0 } }]}
    />
  );
}
