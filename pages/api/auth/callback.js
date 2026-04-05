export default async function handler(req, res) {
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: "No code provided" });

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenRes.json();
    if (tokens.error) return res.status(400).json(tokens);

    // Store tokens in a cookie (simple single-user approach)
    res.setHeader("Set-Cookie", [
      `gmail_access=${tokens.access_token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600`,
      `gmail_refresh=${tokens.refresh_token || ""}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
    ]);

    res.redirect("/?page=gmail&connected=true");
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
