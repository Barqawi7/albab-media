async function refreshAccessToken(refreshToken) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  return res.json();
}

function parseCookies(req) {
  const list = {};
  const header = req.headers.cookie || "";
  header.split(";").forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    if (name) list[name.trim()] = decodeURIComponent(rest.join("="));
  });
  return list;
}

export default async function handler(req, res) {
  const cookies = parseCookies(req);
  let accessToken = cookies.gmail_access;
  const refreshToken = cookies.gmail_refresh;

  if (!accessToken && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);
    if (refreshed.access_token) {
      accessToken = refreshed.access_token;
      res.setHeader("Set-Cookie", `gmail_access=${accessToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`);
    }
  }

  if (!accessToken) return res.status(401).json({ error: "Not authenticated" });

  // LIST messages
  if (req.method === "GET") {
    const { action, messageId, q } = req.query;

    if (action === "profile") {
      const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json(await r.json());
    }

    if (action === "message" && messageId) {
      const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return res.json(await r.json());
    }

    // List inbox
    const query = q || "in:inbox";
    const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=25&q=${encodeURIComponent(query)}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const data = await r.json();

    if (!data.messages) return res.json({ messages: [] });

    // Fetch snippets for each message
    const messages = await Promise.all(
      data.messages.slice(0, 20).map(async (m) => {
        const mr = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const md = await mr.json();
        const headers = md.payload?.headers || [];
        const get = (name) => headers.find((h) => h.name === name)?.value || "";
        return {
          id: m.id,
          subject: get("Subject") || "(no subject)",
          from: get("From"),
          date: get("Date"),
          snippet: md.snippet || "",
          unread: md.labelIds?.includes("UNREAD"),
        };
      })
    );

    return res.json({ messages });
  }

  // SEND email
  if (req.method === "POST") {
    const { to, subject, body } = req.body;
    if (!to || !subject || !body) return res.status(400).json({ error: "Missing fields" });

    const email = [`To: ${to}`, `Subject: ${subject}`, `Content-Type: text/plain; charset=utf-8`, ``, body].join("\n");
    const encoded = Buffer.from(email).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const r = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ raw: encoded }),
    });

    const result = await r.json();
    return res.json(result);
  }

  res.status(405).json({ error: "Method not allowed" });
}
