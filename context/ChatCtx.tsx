import { useFlagUserOffline, useFlagUserOnline } from '@/lib/store';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import {
  createContext,
} from 'react';

type ChatCtxValue = { };
export const ChatCtxDefaultVal: ChatCtxValue = { };
export const ChatCtx = createContext(ChatCtxDefaultVal);

export function ChatCtxProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseClient();
  const user = useUser();
  const flagUserOnline = useFlagUserOnline();
  const flagUserOffline = useFlagUserOffline();

  const onlinePresenceRef = supabase.channel('online-users', {
    config: {
      presence: {
        key: user?.id,
      },
    },
  });

  onlinePresenceRef
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      flagUserOnline(key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key }) => {
      flagUserOffline(key);
    });

  onlinePresenceRef.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      const status = await onlinePresenceRef.track({
        online_at: new Date().toISOString(),
      });
    }
  });

  return (
    <ChatCtx.Provider value={ChatCtxDefaultVal}>
      {children}
    </ChatCtx.Provider>
  );
}
