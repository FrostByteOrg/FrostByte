import { create } from 'zustand';
import {
  Channel,
  DetailedProfileRelation,
  MessageWithServerProfile,
  ServersForUser,
} from '@/types/dbtypes';
import { Database } from '@/types/database.supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getCurrentUserServerPermissions,
  getServer,
  getServerForUser,
  getServersForUser,
} from '@/services/server.service';
import {
  getMessagesInChannelWithUser,
} from '@/services/message.service';
import { getCurrentUserChannelPermissions } from '@/services/channels.service';
import { getMessageWithServerProfile } from '@/services/profile.service';
import { getRelationships, relationToDetailedRelation } from '@/services/friends.service';
import { DMChannelWithRecipient } from '@/types/dbtypes';
import { getDMChannelFromServerId, getAllDMChannels } from '@/services/directmessage.service';

export interface ServerState {
  servers: ServersForUser[];
  addServer: (supabase: SupabaseClient<Database>, serverUserId: number) => void;
  removeServer: (serverId: number) => void;
  getServers: (supabase: SupabaseClient<Database>, userId: string) => void;
  updateServer: (supabase: SupabaseClient<Database>, serverId: number) => void;
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
    set((state) => ({
      servers: state.servers.filter((server) => server.server_id !== serverId),
    }));
  },
  getServers: async (supabase, userId) => {
    const { data, error } = await getServersForUser(supabase, userId);

    if (error) {
      console.error(error);
    }

    if (data) {
      set({ servers: data as ServersForUser[] });
    }
  },
  updateServer: async (supabase, serverId) => {
    const { data, error } = await getServer(supabase, serverId);

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      set((state) => ({
        servers: state.servers.map((server) => {
          // Once we hit a server that matches the id, we can return the updated server instead of the old one
          if (server.server_id === data[0].id) {
            return { server_id: serverId, servers: data[0] };
          }
          // Otherwise fallback to the old one
          return server;
        }),
      }));
    }
  },
}));
export interface MessagesState {
  messages: MessageWithServerProfile[];
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
    const { data, error } = await getMessageWithServerProfile(
      supabase,
      messageId
    );

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      set((state) => ({
        messages: [...state.messages, data as MessageWithServerProfile],
      }));
    }
  },
  updateMessage: async (supabase, messageId) => {
    const { data, error } = await getMessageWithServerProfile(
      supabase,
      messageId
    );

    if (error) {
      console.error(error);
      return;
    }

    if (data) {
      set((state) => ({
        messages: state.messages.map((message) => {
          // Once we hit a message that matches the id, we can return the updated message instead of the old one
          if (message.id === data.id) {
            return data as MessageWithServerProfile;
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
      set({ messages: data as MessageWithServerProfile[] });
    }
  },
}));

export interface UserPermsState {
  userPerms: any;
  userServerPerms: any;
  getUserPerms: (supabase: SupabaseClient<Database>, channelId: number) => void;
  getUserPermsForServer: (
    supabase: SupabaseClient<Database>,
    server_id: number,
    userId?: string
  ) => void;
}

const useUserPermsStore = create<UserPermsState>()((set) => ({
  userPerms: [],
  userServerPerms: [],
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
  getUserPermsForServer: async (supabase, serverId, userId) => {
    const { data, error } = await getCurrentUserServerPermissions(
      supabase,
      serverId,
      userId
    );

    if (error) {
      console.log(error);
    }

    if (data) {
      set({ userServerPerms: data });
    }
  },
}));

export interface ChannelState {
  channel: Channel | null;
  setChannel: (channel: Channel | null) => void;
}

const useChannelStore = create<ChannelState>()((set) => ({
  channel: null,
  setChannel: (channel) => set((state) => ({ channel: channel })),
}));

export interface RelationsState {
  relations: DetailedProfileRelation[];
  addRelation: (supabase: SupabaseClient<Database>, relationId: number) => void;
  updateRelation: (supabase: SupabaseClient<Database>, relationId: number) => void;
  removeRelation: (supabase: SupabaseClient<Database>, relationId: number) => void;
  getRelations: (supabase: SupabaseClient<Database>) => void;
}

const useRelationsStore = create<RelationsState>()((set) => ({
  relations: [],
  addRelation: async (supabase, relationId) => {
    // Get the details of the new profile relation
    const { data, error } = await relationToDetailedRelation(supabase, relationId);

    if (error) {
      console.error(error);
      return;
    }

    set((state) => ({
      relations: [...state.relations, data as DetailedProfileRelation],
    }));
  },

  updateRelation: async (supabase, relationId) => {
    // Get the details of the new profile relation
    const { data, error } = await relationToDetailedRelation(supabase, relationId);

    if (error) {
      console.error(error);
      return;
    }

    set((state) => ({
      relations: state.relations.map((relation) => {
        // Once we hit a relation that matches the id, we can return the updated relation instead of the old one
        if (relation.id === data.id) {
          return data as DetailedProfileRelation;
        }

        // Otherwise fallback to the old one
        return relation;
      }),
    }));
  },

  removeRelation: (supabase, relationId) => {
    set((state) => ({
      relations: state.relations.filter((relation) => {
        return relation.id !== relationId;
      }),
    }));
  },

  getRelations: async (supabase) => {
    const { data, error } = await getRelationships(supabase);

    if (error) {
      console.error(error);
    }

    if (data) {
      set({ relations: data as DetailedProfileRelation[] });
    }
  }
}));

type OnlineUser = {
  [key: string]: any;
}
export interface OnlineState {
  onlineUsers: OnlineUser;

  flagUserOnline: (userId: string, presenceInfo: any) => void;
  flagUserOffline: (userId: string) => void;
}

const useOnlineStore = create<OnlineState>()((set) => ({
  onlineUsers: {},

  flagUserOnline: (userId, presenceInfo) => {
    set((state) => ({
      onlineUsers: {
        ...state.onlineUsers,
        [userId]: presenceInfo
      }
    }));
  },

  flagUserOffline: (userId) => {
    set((state) => {
      const { [userId]: _, ...rest } = state.onlineUsers;
      return {
        onlineUsers: rest
      };
    });
  },
}));

export interface DMChannelsState {
  dmChannels: Map<string, DMChannelWithRecipient>; // Map of profileId -> DMChannel
  addDMChannel: (supabase: SupabaseClient<Database>, serverId: number) => void;
  getDMChannels: (supabase: SupabaseClient<Database>) => void;
}

const useDMChannelsStore = create<DMChannelsState>()((set) => ({
  dmChannels: new Map(),
  addDMChannel: async (supabase, serverId) => {
    const { data, error } = await getDMChannelFromServerId(supabase, serverId);

    if (error) {
      console.error(error);
      return;
    }

    set((state) => ({
      dmChannels: state.dmChannels.set(
        data.recipient.id,
        data
      )
    }));
  },

  getDMChannels: async (supabase) => {
    const { data, error } = await getAllDMChannels(supabase);

    if (error) {
      console.error(error);
      return;
    }

    set((state) => ({
      dmChannels: new Map(data.map((channel) => [channel.recipient.id, channel]))
    }));
  }
}));

export const useServers = () => useServerStore((state) => state.servers);
export const useAddServer = () => useServerStore((state) => state.addServer);
export const useRemoveServer = () =>
  useServerStore((state) => state.removeServer);
export const useUpdateServer = () =>
  useServerStore((state) => state.updateServer);
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
export const useGetUserPerms = () =>
  useUserPermsStore((state) => state.getUserPerms);
export const useUserPerms = () => useUserPermsStore((state) => state.userPerms);
export const useSetChannel = () => useChannelStore((state) => state.setChannel);
export const useChannel = () => useChannelStore((state) => state.channel);
export const useRelations = () => useRelationsStore((state) => state.relations);
export const useAddRelation = () =>
  useRelationsStore((state) => state.addRelation);
export const useUpdateRelation = () =>
  useRelationsStore((state) => state.updateRelation);
export const useRemoveRelation = () =>
  useRelationsStore((state) => state.removeRelation);
export const useGetRelations = () =>
  useRelationsStore((state) => state.getRelations);
export const useOnlineUsers = () => useOnlineStore((state) => state.onlineUsers);
export const useFlagUserOnline = () => useOnlineStore((state) => state.flagUserOnline);
export const useFlagUserOffline = () => useOnlineStore((state) => state.flagUserOffline);
export const useGetUserPermsForServer = () =>
  useUserPermsStore((state) => state.getUserPermsForServer);
export const useUserServerPerms = () =>
  useUserPermsStore((state) => state.userServerPerms);
export const useAddDMChannel = () => useDMChannelsStore((state) => state.addDMChannel);
export const useDMChannels = () => useDMChannelsStore((state) => state.dmChannels);
export const useGetDMChannels = () => useDMChannelsStore((state) => state.getDMChannels);
