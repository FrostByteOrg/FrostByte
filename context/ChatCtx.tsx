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
  servers: ServersForUser[] | [];
  setServers: Dispatch<SetStateAction<ServersForUser[]>>;
};

export const ChatCtxDefaultVal: ChatCtxValue = {
  channelId: 0,
  setChannelId: (state) => {},
  chatName: '',
  setChatName: (state) => {},
  onlinePresenceRef: null,
  servers: [],
  setServers: (state) => {},
};

export const ChatCtx = createContext(ChatCtxDefaultVal);

export function ChatCtxProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [channelId, setChannelId] = useState(ChatCtxDefaultVal.channelId);
  const [chatName, setChatName] = useState(ChatCtxDefaultVal.chatName);
  const [servers, setServers] = useState<ServersForUser[]>(
    ChatCtxDefaultVal.servers
  );

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

  useEffect(() => {
    if (user) {
      const handleAsync = async () => {
        const { data, error } = await getServersForUser(supabase, user.id);

        if (error) {
          console.error(error);
        }

        if (data) {
          setServers(data as ServersForUser[]);
        }
      };

      handleAsync();
    }
  }, [user, supabase]);

  return (
    <ChatCtx.Provider
      value={{
        channelId,
        setChannelId,
        chatName,
        setChatName,
        onlinePresenceRef,
        servers,
        setServers,
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

export function useServers() {
  const { servers } = useContext(ChatCtx);
  return servers;
}

export function useServersSetter() {
  const { setServers } = useContext(ChatCtx);
  return setServers;
}
