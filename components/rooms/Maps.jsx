import RoomShell from './_RoomShell';

const fields = [
  { key: 'name',    label: 'Name',    section: 'Place' },
  { key: 'type',    label: 'Type',    section: 'Place', placeholder: 'event, client, restaurant, studio…' },
  { key: 'address', label: 'Address', section: 'Place', full: true },
  { key: 'city',    label: 'City',    section: 'Place' },
  { key: 'country', label: 'Country', section: 'Place' },
  { key: 'lat',     label: 'Latitude',  section: 'Coords', type: 'number' },
  { key: 'lng',     label: 'Longitude', section: 'Coords', type: 'number' },
  { key: 'link',    label: 'Link',    section: 'Meta' },
  { key: 'notes',   label: 'Notes',   section: 'Meta', multiline: true, full: true },
];

const columns = [
  { key: 'name',    label: 'Name',    flex: 1.6 },
  { key: 'type',    label: 'Type',    flex: 1 },
  { key: 'city',    label: 'City',    flex: 1, render: (_, r) => [r.city, r.country].filter(Boolean).join(', ') || '—' },
  { key: 'address', label: 'Address', flex: 2 },
];

export default function Maps() {
  return (
    <RoomShell
      title="Maps (Virtual)"
      group="Connections"
      tabs={[{ key: 'map_locations', label: 'Locations', fields, columns, addLabel: 'Location' }]}
    />
  );
}
