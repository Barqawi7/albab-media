export default function handler(req, res) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const baseUrl  = process.env.NEXTAUTH_URL;
  if (!clientId || !baseUrl) {
    return res.status(500).json({
      error: 'Set GOOGLE_CLIENT_ID and NEXTAUTH_URL in .env.local',
    });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${baseUrl}/api/auth/callback`,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
    ].join(' '),
  });

  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
}
