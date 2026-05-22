import AuthGate from '../components/AuthGate';

export default function MyApp({ Component, pageProps }) {
  return (
    <>
      <style jsx global>{`
        html, body, #__next {
          margin: 0;
          padding: 0;
          background: #0A0E14;
          color: #E8ECF1;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        }
        * { box-sizing: border-box; }
        a { color: inherit; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-thumb { background: #2E3A4B; border-radius: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
      `}</style>
      <AuthGate>
        {(session) => <Component {...pageProps} session={session} />}
      </AuthGate>
    </>
  );
}
