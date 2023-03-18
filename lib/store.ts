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
import { getProfile } from '@/services/profile.service';

export interface ServerState {
  servers: ServersForUser[];
  addServer: (supabase: SupabaseClient<Database>, serverUserId: number) => void;
  removeServer: (serverId: number) => void;
  getServers: (supabase: SupabaseClient<Database>, userId: string) => void;
}

const useServerStore = create<ServerState>()((set) => ({
  servers: [],
  addServer: async (supabase, serverUserId) => {
    const { data, error } = await getServerForUser(supabase, serverUserId);

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      set((state) => ({
        servers: [...state.servers, data as ServersForUser],
      }));
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
}));
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

const useMessagesStore = create<MessagesState>()((set) => ({
  messages: [],
  channelId: 0,
  setChannelId: (chId) => set((state) => ({ channelId: chId })),
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
      set({ messages: data as ChatMessageWithUser[] });
    }
  },
}));

export interface UserPermsState {
  userPerms: any;
  getUserPerms: (supabase: SupabaseClient<Database>, channelId: number) => void;
}

const useUserPermsStore = create<UserPermsState>()((set) => ({
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
      set({ userPerms: data });
    }
  },
}));

export const useServers = () => useServerStore((state) => state.servers);
export const useAddServer = () => useServerStore((state) => state.addServer);
export const useRemoveServer = () =>
  useServerStore((state) => state.removeServer);
export const useGetServers = () => useServerStore((state) => state.getServers);
export const useMessages = () => useMessagesStore((state) => state.messages);
export const useGetMessages = () =>
  useMessagesStore((state) => state.getMessages);
export const useAddMessage = () =>
  useMessagesStore((state) => state.addMessage);
export const useRemoveMessage = () =>
  useMessagesStore((state) => state.removeMessage);
export const useUpdateMessage = () =>
  useMessagesStore((state) => state.updateMessage);
export const useChannelId = () => useMessagesStore((state) => state.channelId);
export const useSetChannelId = () =>
  useMessagesStore((state) => state.setChannelId);
export const useGetUserPerms = () =>
  useUserPermsStore((state) => state.getUserPerms);
export const useUserPerms = () => useUserPermsStore((state) => state.userPerms);
