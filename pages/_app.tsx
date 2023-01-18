import '@/styles/globals.css';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react';
import { AppProps } from 'next/app';
import { useState } from 'react';
import { Source_Sans_3 } from '@next/font/google';

const sourceSans3 = Source_Sans_3({ subsets: ['latin'] });

function App({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  const [supabase] = useState(() => createBrowserSupabaseClient());

  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <main className={sourceSans3.className}>
        <Component {...pageProps} />
      </main>
    </SessionContextProvider>
  );
}
export default App;
