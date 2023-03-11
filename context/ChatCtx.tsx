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
  channelId: number;
  setChannelId: Dispatch<SetStateAction<number>>;
  chatName: string;
  setChatName: Dispatch<SetStateAction<string>>;
  onlinePresenceRef: RealtimeChannel | null;
};

export const ChatCtxDefaultVal: ChatCtxValue = {
  channelId: 0,
  setChannelId: (state) => {},
  chatName: '',
  setChatName: (state) => {},
  onlinePresenceRef: null,
};

export const ChatCtx = createContext(ChatCtxDefaultVal);

export function ChatCtxProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [channelId, setChannelId] = useState(ChatCtxDefaultVal.channelId);
  const [chatName, setChatName] = useState(ChatCtxDefaultVal.chatName);

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
        channelId,
        setChannelId,
        chatName,
        setChatName,
        onlinePresenceRef,
      }}
    >
      {children}
    </ChatCtx.Provider>
  );
}

export function useChannelIdValue() {
  const { channelId } = useContext(ChatCtx);
  return channelId;
}

export function useChannelIdSetter() {
  const { setChannelId } = useContext(ChatCtx);
  return setChannelId;
}

export function useChatNameValue() {
  const { chatName } = useContext(ChatCtx);
  return chatName;
}

export function useChatNameSetter() {
  const { setChatName } = useContext(ChatCtx);
  return setChatName;
}

export function useOnlinePresenceRef() {
  const { onlinePresenceRef } = useContext(ChatCtx);
  return onlinePresenceRef!;
}
