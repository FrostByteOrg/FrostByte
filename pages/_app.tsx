import '@/styles/globals.css';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react';
import { AppProps } from 'next/app';
import { Source_Sans_3 } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Database } from '@/types/database.supabase';
import { useState } from 'react';
import 'highlight.js/styles/nord.css';
import 'react-tooltip/dist/react-tooltip.css';
import { ChatCtxProvider } from '@/context/ChatCtx';
import { useIsModalOpen } from '@/lib/store';

const sourceSans3 = Source_Sans_3({ subsets: ['latin'] });

function App({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  const [supabaseClient] = useState(() =>
    createBrowserSupabaseClient<Database>()
  );
  const isModalOpen = useIsModalOpen();

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={pageProps.initialSession}
    >
      <ToastContainer />
      <ChatCtxProvider>
        <main
          className={`${sourceSans3.className} ${isModalOpen ? 'blur-sm' : ''}`}
        >
          <Component {...pageProps} />
        </main>
      </ChatCtxProvider>
    </SessionContextProvider>
  );
}
export default App;
