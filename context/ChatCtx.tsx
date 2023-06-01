'use client';

import { useFlagUserOffline, useFlagUserOnline } from '@/lib/store';
import { useUser } from '@supabase/auth-helpers-react';
import { createContext, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type ChatCtxValue = {};
export const ChatCtxDefaultVal: ChatCtxValue = {};
export const ChatCtx = createContext(ChatCtxDefaultVal);

export function ChatCtxProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClientComponentClient();
  const user = useUser();
  const flagUserOnline = useFlagUserOnline();
  const flagUserOffline = useFlagUserOffline();

  useEffect(() => {
    console.log('[PRESENCE]: initializing');
    const onlinePresenceRef = supabase
      .channel('online-users', {
        config: {
          presence: {
            key: user?.id,
          },
        },
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('joined');
        flagUserOnline(key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        flagUserOffline(key);
      })
      .subscribe(async (status, err) => {
        console.log('[PRESENCE]: status', status);

        if (err) {
          console.error('[PRESENCE]: error', err);
        }
        if (status === 'SUBSCRIBED') {
          const status = await onlinePresenceRef.track({
            online_at: new Date().toISOString(),
          });
        }
      });
  }, [flagUserOffline, flagUserOnline, supabase, user?.id, user]);

  return (
    <ChatCtx.Provider value={ChatCtxDefaultVal}>{children}</ChatCtx.Provider>
  );
}
