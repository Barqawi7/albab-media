import Link from 'next/link';
import { GROUPS } from './rooms/registry';
import { theme } from '../lib/theme';

export default function Sidebar({ currentSlug }) {
  return (
    <aside
      style={{
        width: 232,
        flexShrink: 0,
        background: theme.bg2,
        borderRight: `1px solid ${theme.border}`,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}
    >
      <div style={{ padding: '22px 22px 18px', borderBottom: `1px solid ${theme.border}` }}>
        <div style={{ fontSize: 18, fontWeight: 900, color: theme.gold, letterSpacing: 0.5 }}>
          BAB Dashboard
        </div>
        <div style={{ fontSize: 10, color: theme.textMuted, marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' }}>
          Business OS
        </div>
      </div>

      <nav style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }}>
        {GROUPS.map((group) => (
          <div key={group.label} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.3,
                color: theme.textMuted,
                textTransform: 'uppercase',
                padding: '0 22px 6px',
              }}
            >
              {group.label}
            </div>
            {group.rooms.map((room) => {
              const active = room.slug === currentSlug;
              return (
                <Link
                  key={room.slug}
                  href={`/${room.slug}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 22px',
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    color: active ? theme.gold : theme.textDim,
                    background: active ? theme.goldTint : 'transparent',
                    borderLeft: active ? `2px solid ${theme.gold}` : '2px solid transparent',
                    textDecoration: 'none',
                    transition: 'background .12s, color .12s',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = theme.bgHover;
                      e.currentTarget.style.color = theme.text;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = theme.textDim;
                    }
                  }}
                >
                  {room.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

    </aside>
  );
}
