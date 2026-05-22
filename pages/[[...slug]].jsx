import { useRouter } from 'next/router';
import Shell from '../components/Shell';
import Placeholder from '../components/rooms/Placeholder';
import { ROOMS, DEFAULT_SLUG } from '../components/rooms/registry';

export default function RoomRoute({ session }) {
  const router = useRouter();
  const slug = router.query.slug?.[0] || DEFAULT_SLUG;
  const room = ROOMS[slug];

  if (!room) {
    return (
      <Shell currentSlug={null} userEmail={session?.user?.email}>
        <div style={{ padding: '32px 36px' }}>
          <h1 style={{ color: '#D8A43C' }}>Not found</h1>
          <p style={{ color: '#9BA3AF' }}>No room registered for /{slug}.</p>
        </div>
      </Shell>
    );
  }

  const Component = room.component;

  return (
    <Shell currentSlug={room.slug} userEmail={session?.user?.email}>
      {Component
        ? <Component />
        : <Placeholder name={room.label} group={room.group} />}
    </Shell>
  );
}
