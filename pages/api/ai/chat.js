// Server-side proxy to the Anthropic Messages API.
// Reads ANTHROPIC_API_KEY from env (never exposed to the browser).
// The browser sends conversation history; we forward it and return the assistant reply.

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'ANTHROPIC_API_KEY not set. Add it to .env.local to enable the AI Assistant.',
    });
  }

  const {
    model = 'claude-sonnet-4-6',
    system,
    messages = [],
    max_tokens = 2048,
  } = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages[] is required' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens,
        system: system || undefined,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    });

    const data = await r.json();
    if (!r.ok) return res.status(r.status).json(data);

    const text = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');

    return res.json({
      text,
      raw: data,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
