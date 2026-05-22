import { theme } from '../../lib/theme';

export default function Placeholder({ name, group }) {
  return (
    <div style={{ padding: '32px 36px', color: theme.text }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
        {group || 'Room'}
      </div>
      <h1 style={{ margin: '6px 0 14px', fontSize: 28, fontWeight: 800, color: theme.gold }}>
        {name}
      </h1>
      <div
        style={{
          marginTop: 24,
          padding: '20px 22px',
          background: theme.bg3,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          maxWidth: 560,
        }}
      >
        <div style={{ fontSize: 13, color: theme.textDim, lineHeight: 1.6 }}>
          This room is a shell. Functionality and real data wiring land in Round 2.
        </div>
      </div>
    </div>
  );
}
