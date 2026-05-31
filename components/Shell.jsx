import Sidebar from './Sidebar';
import { theme } from '../lib/theme';

export default function Shell({ currentSlug, children }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: theme.bg,
        color: theme.text,
        fontFamily: theme.font,
      }}
    >
      <Sidebar currentSlug={currentSlug} />
      <main style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}
