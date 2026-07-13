import { useEffect, useState } from 'react';
import { theme } from '../../lib/theme';
import { AIFeedPlaceholder } from '../ui';

export default function Gmail() {
  const [tab, setTab] = useState('inbox'); // 'inbox' | 'calendar'
  const [messages, setMessages] = useState(null); // null = not loaded, [] = empty
  const [authed, setAuthed]   = useState(true);
  const [loading, setLoading] = useState(true);
  const [active, setActive]   = useState(null); // selected message id
  const [activeBody, setActiveBody] = useState(null);
  const [composing, setComposing] = useState(false);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('in:inbox');

  async function loadInbox() {
    setLoading(true); setError(null);
    try {
      const r = await fetch(`/api/gmail/messages?q=${encodeURIComponent(query)}`);
      if (r.status === 401) { setAuthed(false); setMessages([]); return; }
      const data = await r.json();
      setAuthed(true);
      setMessages(data.messages || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadInbox(); /* eslint-disable-next-line */ }, []);

  async function openMessage(id) {
    setActive(id); setActiveBody(null);
    const r = await fetch(`/api/gmail/messages?action=message&messageId=${id}`);
    const data = await r.json();
    setActiveBody(decodeBody(data));
  }

  return (
    <div style={{ padding: '28px 36px 60px', color: theme.text }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>
            Sales
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: theme.gold }}>Gmail</h1>
        </div>
        {authed && tab === 'inbox' && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => setComposing(true)} style={primaryBtn}>+ Compose</button>
            <button onClick={loadInbox} style={ghostBtn}>Refresh</button>
          </div>
        )}
      </div>

      {/* Tabs — Inbox and an empty Calendar shell for later */}
      <div style={{ display: 'flex', gap: 4, marginTop: 20, borderBottom: `1px solid ${theme.border}` }}>
        {[{ k: 'inbox', l: 'Inbox' }, { k: 'calendar', l: 'Calendar' }].map((t) => {
          const on = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              background: 'transparent', border: 'none',
              color: on ? theme.gold : theme.textDim,
              padding: '10px 14px', fontSize: 13, fontWeight: on ? 700 : 500, cursor: 'pointer',
              borderBottom: on ? `2px solid ${theme.gold}` : '2px solid transparent', marginBottom: -1,
            }}>{t.l}</button>
          );
        })}
      </div>

      {tab === 'calendar' ? (
        <div style={{ marginTop: 20, maxWidth: 640 }}>
          <AIFeedPlaceholder
            title="Calendar"
            note="Empty for now. Google Calendar events will render here once the calendar integration is connected — same OAuth flow as Gmail."
            lines={4}
          />
        </div>
      ) : !authed ? (
        <div style={{ marginTop: 30, padding: 24, background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 12, maxWidth: 520 }}>
          <div style={{ color: theme.text, marginBottom: 12 }}>Connect Gmail to read and send mail from this room.</div>
          <a href="/api/auth/start" style={{ ...primaryBtn, textDecoration: 'none', display: 'inline-block' }}>
            Connect Gmail
          </a>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', margin: '16px 0 12px' }}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && loadInbox()}
              placeholder="Gmail search query (e.g. in:inbox is:unread)"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button onClick={loadInbox} style={ghostBtn}>Search</button>
          </div>

          {error && <div style={errorBox}>{error}</div>}

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 360px) 1fr', gap: 14 }}>
            <div style={listStyle}>
              {loading && <div style={{ padding: 20, color: theme.textMuted, fontSize: 13 }}>loading…</div>}
              {!loading && messages?.length === 0 && <div style={{ padding: 20, color: theme.textMuted, fontSize: 13 }}>No messages.</div>}
              {messages?.map((m) => (
                <div key={m.id}
                     onClick={() => openMessage(m.id)}
                     style={{
                       padding: '12px 14px',
                       borderBottom: `1px solid ${theme.border}`,
                       cursor: 'pointer',
                       background: active === m.id ? theme.bgHover : 'transparent',
                     }}>
                  <div style={{ fontWeight: m.unread ? 700 : 500, color: m.unread ? theme.text : theme.textDim, fontSize: 13 }}>
                    {m.from?.split('<')[0].trim() || m.from || '—'}
                  </div>
                  <div style={{ color: m.unread ? theme.text : theme.textDim, fontSize: 13, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.subject || '(no subject)'}
                  </div>
                  <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {m.snippet}
                  </div>
                </div>
              ))}
            </div>
            <div style={listStyle}>
              {!active && <div style={{ padding: 24, color: theme.textMuted, fontSize: 13 }}>Select a message.</div>}
              {active && (
                <div style={{ padding: '16px 18px' }}>
                  {!activeBody && <div style={{ color: theme.textMuted, fontSize: 13 }}>loading…</div>}
                  {activeBody && (
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: theme.text, marginBottom: 4 }}>{activeBody.subject}</div>
                      <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 14 }}>{activeBody.from} · {activeBody.date}</div>
                      <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: theme.textDim, fontSize: 13, fontFamily: theme.font, margin: 0 }}>
                        {activeBody.text || '(no plaintext body)'}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {composing && <ComposeDrawer onClose={() => setComposing(false)} onSent={() => { setComposing(false); loadInbox(); }} />}
        </>
      )}
    </div>
  );
}

function decodeBody(message) {
  if (!message) return null;
  const headers = message.payload?.headers || [];
  const get = (n) => headers.find((h) => h.name === n)?.value || '';
  const text = extractPlainText(message.payload) || '';
  return {
    subject: get('Subject') || '(no subject)',
    from:    get('From'),
    date:    get('Date'),
    text,
  };
}
function extractPlainText(part) {
  if (!part) return '';
  if (part.mimeType === 'text/plain' && part.body?.data) {
    return Buffer.from(part.body.data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
  }
  if (part.parts) {
    for (const p of part.parts) {
      const t = extractPlainText(p);
      if (t) return t;
    }
  }
  return '';
}

function ComposeDrawer({ onClose, onSent }) {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState(null);

  async function send() {
    if (!to || !subject) { setErr('To and Subject required'); return; }
    setSending(true); setErr(null);
    const r = await fetch('/api/gmail/messages', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body }),
    });
    const data = await r.json();
    setSending(false);
    if (data.error) { setErr(JSON.stringify(data.error)); return; }
    onSent();
  }

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={drawerStyle}>
        <div style={drawerHeader}>
          <div style={{ fontSize: 16, fontWeight: 700, color: theme.text }}>New message</div>
          <button onClick={onClose} style={ghostBtn}>Close</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input value={to}      onChange={(e) => setTo(e.target.value)}      placeholder="To"      style={inputStyle} />
          <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject" style={inputStyle} />
          <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Message…" rows={14}
                    style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          {err && <div style={errorBox}>{err}</div>}
        </div>
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${theme.border}`, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} disabled={sending} style={ghostBtn}>Cancel</button>
          <button onClick={send} disabled={sending} style={primaryBtn}>{sending ? 'Sending…' : 'Send'}</button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  background: theme.bg3, color: theme.text,
  border: `1px solid ${theme.border}`, borderRadius: 6,
  padding: '8px 10px', fontSize: 13, outline: 'none', fontFamily: 'inherit',
};
const primaryBtn = {
  background: theme.gold, color: '#0A0E14',
  border: 'none', borderRadius: 6, padding: '8px 14px',
  fontSize: 13, fontWeight: 700, cursor: 'pointer',
};
const ghostBtn = {
  background: 'transparent', color: theme.textDim,
  border: `1px solid ${theme.border}`, borderRadius: 6,
  padding: '8px 12px', fontSize: 13, cursor: 'pointer',
};
const listStyle = {
  background: theme.bg2, border: `1px solid ${theme.border}`,
  borderRadius: 10, minHeight: 360, overflow: 'auto',
};
const errorBox = {
  padding: 12, background: 'rgba(239,68,68,0.08)',
  border: `1px solid ${theme.red}`, borderRadius: 8, color: theme.red, fontSize: 13,
};
const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 50,
  display: 'flex', justifyContent: 'flex-end',
};
const drawerStyle = {
  width: 600, maxWidth: '100%', height: '100%', background: theme.bg2,
  borderLeft: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column',
};
const drawerHeader = {
  padding: '16px 22px', borderBottom: `1px solid ${theme.border}`,
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
};
