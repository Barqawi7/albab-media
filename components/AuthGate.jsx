import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { theme } from '../lib/theme';

export default function AuthGate({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) {
    return <CenterScreen>Loading…</CenterScreen>;
  }
  if (!session) {
    return <SignIn />;
  }
  return typeof children === 'function' ? children(session) : children;
}

function SignIn() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  const signIn = async () => {
    setBusy(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });
    if (error) {
      setErr(error.message);
      setBusy(false);
    }
  };

  return (
    <CenterScreen>
      <div
        style={{
          width: 360,
          padding: '32px 28px',
          background: theme.bg2,
          border: `1px solid ${theme.border}`,
          borderRadius: 14,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 22, fontWeight: 900, color: theme.gold, letterSpacing: 0.5 }}>
          BAB Dashboard
        </div>
        <div style={{ fontSize: 12, color: theme.textMuted, marginTop: 6, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          Business OS
        </div>
        <button
          onClick={signIn}
          disabled={busy}
          style={{
            marginTop: 28,
            width: '100%',
            padding: '11px',
            borderRadius: 10,
            border: 'none',
            background: theme.gold,
            color: '#1A140A',
            fontSize: 14,
            fontWeight: 800,
            cursor: busy ? 'wait' : 'pointer',
            opacity: busy ? 0.6 : 1,
          }}
        >
          {busy ? 'Redirecting…' : 'Sign in with Google'}
        </button>
        {err && (
          <div style={{ marginTop: 14, fontSize: 12, color: theme.red }}>{err}</div>
        )}
      </div>
    </CenterScreen>
  );
}

function CenterScreen({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: theme.bg,
        color: theme.text,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: theme.font,
      }}
    >
      {children}
    </div>
  );
}
