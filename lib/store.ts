import { create, createStore, StateCreator } from 'zustand';
import {
  ChatMessageWithUser,
  Server,
  ServersForUser,
  ServerUser,
} from '@/types/dbtypes';
import { Database } from '@/types/database.supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { getServerForUser, getServersForUser } from '@/services/server.service';
import {
  createMessage,
  getMessagesInChannelWithUser,
  getMessageWithUser,
} from '@/services/message.service';
import { getCurrentUserChannelPermissions } from '@/services/channels.service';

export interface ServerState {
  servers: ServersForUser[];
  addServer: (supabase: SupabaseClient<Database>, serverUserId: number) => void;
  removeServer: (serverId: number) => void;
  getServers: (supabase: SupabaseClient<Database>, userId: string) => void;
}

const useServerStore: StateCreator<
  ServerState & MessagesState & UserPermsState,
  [],
  [],
  ServerState
> = (set) => ({
  servers: [],
  addServer: async (supabase, serverUserId) => {
    const { data, error } = await getServerForUser(supabase, serverUserId);

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      set((state) => ({ servers: [...state.servers, data as ServersForUser] }));
    }
  },
  removeServer: async (serverId) => {
    set(
      (state) => ({
        servers: state.servers.filter(
          (server) => server.server_id !== serverId
        ),
      }),
      true
    );
  },
  getServers: async (supabase, userId) => {
    const { data, error } = await getServersForUser(supabase, userId);

    if (error) {
      console.error(error);
    }

    if (data) {
      set({ servers: data as ServersForUser[] }, true);
    }
  },
});

export interface MessagesState {
  messages: ChatMessageWithUser[];
  channelId: number;
  setChannelId: (channelId: number) => void;
  addMessage: (supabase: SupabaseClient<Database>, messageId: number) => void;
  updateMessage: (
    supabase: SupabaseClient<Database>,
    messageId: number
  ) => void;
  removeMessage: (messageId: number) => void;
  getMessages: (supabase: SupabaseClient<Database>, channelId: number) => void;
}

const useMessagesStore: StateCreator<
  MessagesState & ServerState & UserPermsState,
  [],
  [],
  MessagesState
> = (set) => ({
  messages: [],
  channelId: 0,
  setChannelId: (channelId) => set((state) => ({ channelId: channelId }), true),
  addMessage: async (supabase, messageId) => {
    const { data, error } = await getMessageWithUser(supabase, messageId);

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      set((state) => ({
        messages: [...state.messages, data as ChatMessageWithUser],
      }));
    }
  },
  updateMessage: async (supabase, messageId) => {
    const { data, error } = await getMessageWithUser(supabase, messageId);

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      set((state) => ({
        messages: state.messages.map((message) => {
          // Once we hit a message that matches the id, we can return the updated message instead of the old one
          if (message.id === data.id) {
            return data as ChatMessageWithUser;
          }

          // Otherwise fallback to the old one
          return message;
        }),
      }));
    }
  },
  removeMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((message) => {
        return message.id !== messageId;
      }),
    }));
  },
  getMessages: async (supabase, channelId) => {
    const { data, error } = await getMessagesInChannelWithUser(
      supabase,
      channelId
    );

    if (error) {
      console.error(error);
    }

    if (data) {
      data.reverse();
      set({ messages: data as ChatMessageWithUser[] }, true);
    }
  },
});

export interface UserPermsState {
  userPerms: any;
  getUserPerms: (supabase: SupabaseClient<Database>, channelId: number) => void;
}

const useUserPermsStore: StateCreator<
  ServerState & MessagesState & UserPermsState,
  [],
  [],
  UserPermsState
> = (set) => ({
  userPerms: [],
  getUserPerms: async (supabase, channelId) => {
    const { data, error } = await getCurrentUserChannelPermissions(
      supabase,
      channelId
    );

    if (error) {
      console.log(error);
    }

    if (data) {
      set({ userPerms: data }, true);
    }
  },
});

const useStore = create<ServerState & MessagesState & UserPermsState>()(
  (...a) => ({
    ...useServerStore(...a),
    ...useMessagesStore(...a),
    ...useUserPermsStore(...a),
  })
);

interface BearState {
  bears: number;
  increase: (by: number) => void;
}

const useBearStore = create<BearState>()((set) => ({
  bears: 0,
  increase: (by) => set((state) => ({ bears: state.bears + by })),
}));

export const useIncrease = () => useBearStore((state) => state.increase);

export const useServers = () => useStore((state) => state.servers);
export const useAddServer = () => useStore((state) => state.addServer);
export const useRemoveServer = () => useStore((state) => state.removeServer);
export const useGetServers = () => useStore((state) => state.getServers);
export const useMessages = () => useStore((state) => state.messages);
export const useGetMessages = () => useStore((state) => state.getMessages);
export const useAddMessage = () => useStore((state) => state.addMessage);
export const useRemoveMessage = () => useStore((state) => state.removeMessage);
export const useUpdateMessage = () => useStore((state) => state.updateMessage);
export const useChannelId = () => useStore((state) => state.channelId);
export const useSetChannelId = () => useStore((state) => state.setChannelId);
export const useGetUserPerms = () => useStore((state) => state.getUserPerms);
export const useUserPerms = () => useStore((state) => state.userPerms);
