import { useEffect, useRef, useState } from 'react';
import { theme } from '../../lib/theme';
import { supabase } from '../../lib/supabase';

const DEFAULT_SYSTEM = 'You are an assistant for the BAB Dashboard, an internal business OS for albab media (a UAE media/influencer agency). Be concise.';

export default function AIAssistant() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [active, setActive] = useState(null); // {messages, model, system_prompt, title}
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  async function loadList() {
    const { data } = await supabase
      .from('ai_conversations')
      .select('id,title,updated_at')
      .order('updated_at', { ascending: false });
    setConversations(data || []);
  }

  async function loadConversation(id) {
    if (!id) { setActive(null); setActiveId(null); return; }
    const { data } = await supabase.from('ai_conversations').select('*').eq('id', id).single();
    setActive(data);
    setActiveId(id);
  }

  useEffect(() => { loadList(); }, []);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [active?.messages]);

  async function newConversation() {
    const { data, error } = await supabase
      .from('ai_conversations')
      .insert({ title: 'New chat', system_prompt: DEFAULT_SYSTEM, messages: [] })
      .select().single();
    if (error) { setError(error.message); return; }
    await loadList();
    loadConversation(data.id);
  }

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true); setError(null);

    let convo = active;
    let id = activeId;
    if (!id) {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({ title: text.slice(0, 60), system_prompt: DEFAULT_SYSTEM, messages: [] })
        .select().single();
      if (error) { setError(error.message); setSending(false); return; }
      id = data.id;
      convo = data;
      setActiveId(id);
    }

    const nextMessages = [...(convo.messages || []), { role: 'user', content: text, ts: new Date().toISOString() }];
    setActive({ ...convo, messages: nextMessages });
    setInput('');

    // Save the user message first
    await supabase.from('ai_conversations').update({ messages: nextMessages }).eq('id', id);

    // Call the model
    try {
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: convo.model || 'claude-sonnet-4-6',
          system: convo.system_prompt || DEFAULT_SYSTEM,
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error || `HTTP ${r.status}`);
        setSending(false);
        return;
      }
      const finalMessages = [...nextMessages, { role: 'assistant', content: data.text, ts: new Date().toISOString() }];
      setActive((a) => ({ ...a, messages: finalMessages }));
      await supabase.from('ai_conversations').update({ messages: finalMessages }).eq('id', id);
      await loadList();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  async function deleteActive() {
    if (!activeId) return;
    if (!confirm('Delete this conversation?')) return;
    await supabase.from('ai_conversations').delete().eq('id', activeId);
    setActive(null); setActiveId(null);
    loadList();
  }

  return (
    <div style={{ padding: '28px 36px 36px', color: theme.text, display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: theme.textMuted, textTransform: 'uppercase' }}>Comms</div>
          <h1 style={{ margin: '4px 0 0', fontSize: 28, fontWeight: 800, color: theme.gold }}>AI Assistant</h1>
        </div>
        <button onClick={newConversation} style={primaryBtn}>+ New chat</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 14, marginTop: 18, flex: 1, minHeight: 0 }}>
        {/* Conversation list */}
        <div style={paneStyle}>
          {conversations.length === 0 && (
            <div style={{ padding: 14, color: theme.textMuted, fontSize: 13 }}>No chats yet.</div>
          )}
          {conversations.map((c) => (
            <div key={c.id} onClick={() => loadConversation(c.id)} style={{
              padding: '10px 14px', borderBottom: `1px solid ${theme.border}`,
              cursor: 'pointer', background: c.id === activeId ? theme.bgHover : 'transparent',
              fontSize: 13, color: theme.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {c.title || '(untitled)'}
            </div>
          ))}
        </div>

        {/* Chat pane */}
        <div style={{ ...paneStyle, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
            <div style={{ color: theme.text, fontSize: 13 }}>
              {active?.title || (activeId ? '—' : 'Start a new chat')}
            </div>
            {activeId && (
              <button onClick={deleteActive} style={dangerBtn}>Delete</button>
            )}
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
            {(active?.messages || []).map((m, i) => (
              <div key={i} style={{ marginBottom: 14, display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '78%', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                  padding: '10px 14px', borderRadius: 12, fontSize: 13,
                  background: m.role === 'user' ? theme.goldTint : theme.bg3,
                  border: `1px solid ${m.role === 'user' ? '#D8A43C44' : theme.border}`,
                  color: theme.text,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {sending && <div style={{ color: theme.textMuted, fontSize: 12 }}>thinking…</div>}
            {error && <div style={{ ...errorBox, marginTop: 10 }}>{error}</div>}
          </div>

          <div style={{ padding: 12, borderTop: `1px solid ${theme.border}`, display: 'flex', gap: 8 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); }
              }}
              placeholder="Message… (Cmd/Ctrl+Enter to send)"
              rows={2}
              style={{ ...inputStyle, flex: 1, resize: 'vertical', fontFamily: 'inherit' }}
            />
            <button onClick={send} disabled={sending || !input.trim()} style={primaryBtn}>
              {sending ? '…' : 'Send'}
            </button>
          </div>
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
const dangerBtn = {
  background: 'transparent', color: theme.red,
  border: `1px solid ${theme.red}55`, borderRadius: 6,
  padding: '4px 10px', fontSize: 11, cursor: 'pointer',
};
const paneStyle = {
  background: theme.bg2, border: `1px solid ${theme.border}`, borderRadius: 10,
  overflow: 'auto', minHeight: 360,
};
const errorBox = {
  padding: 10, background: 'rgba(239,68,68,0.08)',
  border: `1px solid ${theme.red}`, borderRadius: 8, color: theme.red, fontSize: 12,
};
