import RoomShell, { fmtDate } from './_RoomShell';

const fields = [
  { key: 'area',          label: 'Area',          section: 'Area', placeholder: 'health, relationships, finance…' },
  { key: 'score',         label: 'Score (1-10)',  section: 'Area', type: 'number' },
  { key: 'reviewed_at',   label: 'Reviewed at',   section: 'Area', type: 'date' },
  { key: 'current_state', label: 'Current state', section: 'Now', multiline: true, full: true },
  { key: 'goal',          label: 'Goal',          section: 'Direction', multiline: true, full: true },
  { key: 'next_step',     label: 'Next step',     section: 'Direction', multiline: true, full: true },
  { key: 'notes',         label: 'Notes',         section: 'Direction', multiline: true, full: true },
];

const columns = [
  { key: 'area',        label: 'Area',      flex: 1.2 },
  { key: 'score',       label: 'Score',     flex: 0.5, align: 'right' },
  { key: 'goal',        label: 'Goal',      flex: 2 },
  { key: 'next_step',   label: 'Next step', flex: 2 },
  { key: 'reviewed_at', label: 'Reviewed',  flex: 0.8, format: fmtDate },
];

export default function Life() {
  return (
    <RoomShell
      title="Life"
      group="Personal"
      tabs={[{ key: 'life_areas', label: 'Life Areas', fields, columns, addLabel: 'Area' }]}
    />
  );
}
