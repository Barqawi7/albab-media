import { useEffect, useState } from 'react';
import { theme } from '../lib/theme';

// Shared UI kit for the restructured rooms — buttons, cards, inline editors and
// the "connect API key later" placeholder used by every AI feed shell.

export const btnPrimary = {
  background: theme.gold, color: '#0A0E14',
  border: 'none', borderRadius: 6, padding: '8px 14px',
  fontSize: 13, fontWeight: 700, cursor: 'pointer',
};
export const btnGhost = {
  background: 'transparent', color: theme.textDim,
  border: `1px solid ${theme.border}`, borderRadius: 6,
  padding: '8px 12px', fontSize: 13, cursor: 'pointer',
};
export const btnDanger = {
  background: 'transparent', color: theme.red,
  border: `1px solid ${theme.red}55`, borderRadius: 6,
  padding: '8px 12px', fontSize: 13, cursor: 'pointer',
};
export const inputStyle = {
  background: theme.bg3, color: theme.text,
  border: `1px solid ${theme.border}`, borderRadius: 6,
  padding: '8px 10px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
};
export const errorBox = {
  padding: 12, background: 'rgba(239,68,68,0.08)',
  border: `1px solid ${theme.red}`, borderRadius: 8, color: theme.red,
  margin: '12px 0', fontSize: 13,
};

export function PageHeader({ group, title, right, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
          {group}
        </div>
        <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: theme.gold }}>{title}</h1>
        {children}
      </div>
      {right}
    </div>
  );
}

export function Card({ title, right, children, style }) {
  return (
    <div style={{ background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden', display: 'flex', flexDirection: 'column', ...style }}>
      {(title || right) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderBottom: `1px solid ${theme.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: theme.text, textTransform: 'uppercase', letterSpacing: 0.8 }}>{title}</div>
          {right}
        </div>
      )}
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

export function SectionHeading({ children }) {
  return (
    <h2 style={{ fontSize: 12, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 1.4, fontWeight: 700, margin: '26px 0 10px' }}>
      {children}
    </h2>
  );
}

// Clearly-marked shell for AI features that aren't wired yet.
export function AIFeedPlaceholder({ title = 'AI feed', note, lines = 3 }) {
  return (
    <div style={{
      border: `1px dashed ${theme.borderStrong}`, borderRadius: 12,
      background: theme.bg2, padding: '16px 18px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>✨</span>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>{title}</div>
        <span style={{
          fontSize: 10, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
          color: theme.gold, background: theme.goldTint, border: `1px solid ${theme.gold}55`,
          borderRadius: 999, padding: '2px 8px',
        }}>Connect API key later</span>
      </div>
      <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 14 }}>
        {note || 'This panel is a UI shell. Add your API key to make it live — nothing is wired to an AI provider yet.'}
      </div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} style={{
          height: 12, borderRadius: 6, marginBottom: 8,
          background: `linear-gradient(90deg, ${theme.bg3}, ${theme.bgHover}, ${theme.bg3})`,
          width: `${90 - i * 12}%`,
        }} />
      ))}
    </div>
  );
}

export function EmptyState({ children }) {
  return (
    <div style={{ padding: '28px 16px', color: theme.textMuted, fontSize: 13, textAlign: 'center' }}>
      {children}
    </div>
  );
}

// ---- Inline editors (commit on blur / Enter) --------------------------------

export function InlineText({ value, onCommit, placeholder, style, multiline }) {
  const [v, setV] = useState(value ?? '');
  useEffect(() => { setV(value ?? ''); }, [value]);
  function commit() {
    if ((v ?? '') === (value ?? '')) return;
    onCommit(v === '' ? null : v);
  }
  const base = {
    background: theme.bg3, color: theme.text,
    border: `1px solid ${theme.border}`, borderRadius: 6,
    padding: '7px 9px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
    width: '100%', minWidth: 0, ...style,
  };
  if (multiline) {
    return (
      <textarea
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={commit}
        placeholder={placeholder}
        rows={style?.rows || 3}
        style={{ ...base, resize: 'vertical' }}
      />
    );
  }
  return (
    <input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      placeholder={placeholder}
      style={base}
    />
  );
}

export function InlineNumber({ value, onCommit, align = 'right', style }) {
  const [v, setV] = useState(value == null ? '' : String(value));
  useEffect(() => { setV(value == null ? '' : String(value)); }, [value]);
  function commit() {
    const num = v === '' ? null : Number(v);
    if (num !== null && !Number.isFinite(num)) return;
    if (num === (value == null ? null : Number(value))) return;
    onCommit(num);
  }
  return (
    <input
      type="number"
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      style={{
        background: theme.bg3, color: theme.text,
        border: `1px solid ${theme.border}`, borderRadius: 6,
        padding: '7px 9px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
        textAlign: align, fontVariantNumeric: 'tabular-nums', width: '100%', minWidth: 0, ...style,
      }}
    />
  );
}

export function InlineSelect({ value, options, onCommit, style }) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onCommit(e.target.value || null)}
      style={{
        background: theme.bg3, color: theme.text,
        border: `1px solid ${theme.border}`, borderRadius: 6,
        padding: '7px 9px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
        cursor: 'pointer', ...style,
      }}
    >
      <option value="">—</option>
      {options.map((o) => (
        typeof o === 'string'
          ? <option key={o} value={o}>{o}</option>
          : <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function IconButton({ onClick, title, children, danger }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: 'transparent', color: theme.textMuted,
        border: `1px solid ${theme.border}`, borderRadius: 6,
        padding: '5px 8px', fontSize: 12, cursor: 'pointer', lineHeight: 1,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = danger ? theme.red : theme.text; e.currentTarget.style.borderColor = (danger ? theme.red : theme.borderStrong) + '88'; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = theme.textMuted; e.currentTarget.style.borderColor = theme.border; }}
    >
      {children}
    </button>
  );
}
