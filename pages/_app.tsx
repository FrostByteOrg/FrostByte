import '@/styles/globals.css';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react';
import { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { Source_Sans_3 } from '@next/font/google';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { EventProvider, PWRecoveryEventContext, PWRecoveryEventCtxDefaultVal } from 'context/EventContext';
// import supabase from '@/lib/supabase-browser';

import { Database } from '@/types/database.supabase';


const sourceSans3 = Source_Sans_3({ subsets: ['latin'] });

function App({
  Component,
  pageProps,
}: AppProps<{
  initialSession: Session;
}>) {
  const [pwRecoveryEvent, setPWRecoveryEvent] = useState(PWRecoveryEventCtxDefaultVal.pwRecoveryEvent);
  //tsonevstanley@gmail.com
  //prob just gonna have to remove the event check fully
  const supabase = createBrowserSupabaseClient<Database>();
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == 'PASSWORD_RECOVERY') {
        toast('yerer');
        setPWRecoveryEvent(true);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);
  
  return (
    <SessionContextProvider
      supabaseClient={supabase}
      initialSession={pageProps.initialSession}
    >
      <PWRecoveryEventContext.Provider value={{ pwRecoveryEvent, setPWRecoveryEvent }}>
        <ToastContainer  />
        <main className={sourceSans3.className}>
          <Component {...pageProps} />
        </main>
      </PWRecoveryEventContext.Provider>
    </SessionContextProvider>
  );
}
export default App;
