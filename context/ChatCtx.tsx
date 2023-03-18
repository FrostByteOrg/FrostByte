import { getServersForUser } from '@/services/server.service';
import { ServersForUser } from '@/types/dbtypes';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { RealtimeChannel } from '@supabase/supabase-js';
import {
  createContext,
  SetStateAction,
  useContext,
  useState,
  Dispatch,
  useEffect,
} from 'react';

type ChatCtxValue = {
  onlinePresenceRef: RealtimeChannel | null;
};

export const ChatCtxDefaultVal: ChatCtxValue = {
  onlinePresenceRef: null,
};

export const ChatCtx = createContext(ChatCtxDefaultVal);

export function ChatCtxProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseClient();
  const user = useUser();

  const onlinePresenceRef = supabase.channel('online-users', {
    config: {
      presence: {
        key: user?.id,
      },
    },
  });

  onlinePresenceRef.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      const status = await onlinePresenceRef.track({
        online_at: new Date().toISOString(),
      });
    }
  });

  return (
    <ChatCtx.Provider
      value={{
        onlinePresenceRef,
      }}
    >
      {children}
    </ChatCtx.Provider>
  );
}

export function useOnlinePresenceRef() {
  const { onlinePresenceRef } = useContext(ChatCtx);
  return onlinePresenceRef!;
}
