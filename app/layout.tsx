'use client';

import { ChatCtxProvider } from '@/context/ChatCtx';
import './globals.css';
import { Source_Sans_3 } from '@next/font/google';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { SessionContextProvider, Session } from '@supabase/auth-helpers-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import 'react-tooltip/dist/react-tooltip.css';
import { Database } from '@/types/database.supabase';
import ToastProvider from '@/lib/ToastProvider';
import { QueryClient, QueryClientProvider } from 'react-query';

const queryClient = new QueryClient();

const sourceSans3 = Source_Sans_3({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabaseClient] = useState(() => createPagesBrowserClient<Database>());
  return (
    <html lang="en">
      <SessionContextProvider supabaseClient={supabaseClient}>
        <ChatCtxProvider>
          <QueryClientProvider client={queryClient}>
            <body className={sourceSans3.className}>
              <ToastProvider>{children}</ToastProvider>
            </body>
          </QueryClientProvider>
        </ChatCtxProvider>
      </SessionContextProvider>
    </html>
  );
}
