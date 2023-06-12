import { create } from 'zustand';
import {
  Channel,
  DetailedProfileRelation,
  Message,
  MessageWithServerProfile,
  Role,
  ServerUserProfile,
  ServersForUser,
  Profile,
} from '@/types/dbtypes';
import { Database } from '@/types/database.supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  getAllProfilesForServer,
  getCurrentUserServerPermissions,
  getServer,
  getServerForUser,
  getServersForUser,
} from '@/services/server.service';
import {
  getMessagesInChannel,
  getMessagesInChannelWithUser,
} from '@/services/message.service';
import { getCurrentUserChannelPermissions } from '@/services/channels.service';
import {
  getMessageWithServerProfile,
  getProfile,
  getServerProfileForUser,
  getServerProfileForUserByServerUser,
} from '@/services/profile.service';
import {
  getRelationships,
  relationToDetailedRelation,
} from '@/services/friends.service';
import { DMChannelWithRecipient } from '@/types/dbtypes';
import {
  getDMChannelFromServerId,
  getAllDMChannels,
} from '@/services/directmessage.service';
import { Room } from '@/types/client/room';
import {
  getRolesFromAllServersUserIsIn,
  getServerRoles,
  getHighestRolePositionForUser,
} from '@/services/roles.service';
import { ChannelPermissions, ServerPermissions } from '@/types/permissions';

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

    if (data && !data['servers']['is_dm']) {
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
    //TODO: Cache this
    const { data, error } = await getServersForUser(supabase, userId);

    if (error) {
      console.error(error);
    }

    if (data) {
      const convertedData = data.map(({ server_id, servers }) => ({
        server_id,
        servers: Array.isArray(servers) ? servers[0] : servers,
      }));

      set({ servers: convertedData as ServersForUser[] });
      // set({ servers: data as ServersForUser[] });
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
  messages: Message[];
  channelId: number;
  setChannelId: (channelId: number) => void;
  addMessage: (message: Message) => void;
  updateMessage: (newMessage: Message) => void;
  removeMessage: (messageId: number) => void;
  getMessages: (supabase: SupabaseClient<Database>, channelId: number) => void;
  loadMoreMessages: (
    supabase: SupabaseClient<Database>,
    channelId: number,
    page: number,
    pageSize: number
  ) => void;
}

const useMessagesStore = create<MessagesState>()((set) => ({
  messages: [],
  channelId: 0,
  setChannelId: (chId) => set((state) => ({ channelId: chId })),
  addMessage: async (message) => {
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
  updateMessage: async (newMessage) => {
    set((state) => ({
      messages: state.messages.map((message) => {
        // Once we hit a message that matches the id, we can return the updated message instead of the old one
        if (message.id === newMessage.id) {
          return newMessage;
        }

        // Otherwise fallback to the old one
        return message;
      }),
    }));
  },
  removeMessage: (messageId) => {
    set((state) => ({
      messages: state.messages.filter((message) => {
        return message.id !== messageId;
      }),
    }));
  },
  getMessages: async (supabase, channelId) => {
    const { data, error } = await getMessagesInChannel(supabase, channelId);

    if (error) {
      console.error(error);
    }

    if (data) {
      data.reverse();
      set({ messages: data });
    }
  },
  loadMoreMessages: async (supabase, channelId, page, pageSize) => {
    const { data, error } = await getMessagesInChannel(
      supabase,
      channelId,
      page,
      pageSize
    );

    if (error) {
      console.error(error);
    }

    if (data) {
      console.log(data);
      data.reverse();
      set((state) => ({
        messages: [...data, ...state.messages],
      }));
    }
  },
}));

/**
 * @deprecated Use ServerProfilesState instead
 */
export interface UserPermsState {
  userPerms: ChannelPermissions;
  userServerPerms: ServerPermissions;
  userHighestRolePosition: number;

  getUserPerms: (supabase: SupabaseClient<Database>, channelId: number) => void;
  getUserPermsForServer: (
    supabase: SupabaseClient<Database>,
    server_id: number,
    userId?: string
  ) => void;

  getHighestRolePositionForUser: (
    supabase: SupabaseClient<Database>,
    serverId: number,
    userId: string
  ) => void;
}

/**
 * @deprecated Use useServerProfilesStore instead
 */
const useUserPermsStore = create<UserPermsState>()((set) => ({
  userPerms: 0,
  userServerPerms: 0,
  userHighestRolePosition: 36767, // Max value for a role position

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

  getHighestRolePositionForUser: async (supabase, serverId, userId) => {
    const { data, error } = await getHighestRolePositionForUser(
      supabase,
      serverId,
      userId
    );

    if (error) {
      console.log(error);
    }

    console.log('highestRolePosSet ', data);

    if (data) {
      set({ userHighestRolePosition: data });
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

export interface TokenState {
  token: string | undefined;
  setToken: (token: string | undefined) => void;
}

const useTokenStore = create<TokenState>()((set) => ({
  token: '',
  setToken: (token) => set((state) => ({ token: token })),
}));

export interface ConnectionState {
  connection: boolean | undefined;
  setConnection: (connection: boolean | undefined) => void;
}

const useConnectionStore = create<ConnectionState>()((set) => ({
  connection: false,
  setConnection: (connection) => set((state) => ({ connection: connection })),
}));

export interface CurrentRoomState {
  currentRoom: Room;
  profileMap: Map<string, Profile>;
  setCurrentRoomId: (currentRoomId: number | undefined) => void;
  setCurrentRoomName: (currentRoomName: string | undefined) => void;
  setCurrentRoomServerId: (currentRoomServerId: number | undefined) => void;
  setCurrentRoomServerName: (
    currentRoomServerId: number | undefined,
    servers: ServersForUser[]
  ) => void;
  fetchProfile: (supabase: SupabaseClient<Database>, userId: string) => void;
}

const useCurrentRoomStore = create<CurrentRoomState>()((set) => ({
  profileMap: new Map<string, Profile>(),
  currentRoom: {
    channel_id: undefined,
    name: undefined,
    server_id: undefined,
    server_name: undefined,
  },
  setCurrentRoomId: (currentRoomId) =>
    set((state) => ({
      currentRoom: { ...state.currentRoom, channel_id: currentRoomId },
    })),
  setCurrentRoomName: (currentRoomName) =>
    set((state) => ({
      currentRoom: { ...state.currentRoom, name: currentRoomName },
    })),
  setCurrentRoomServerId: (currentRoomServerId) =>
    set((state) => ({
      currentRoom: { ...state.currentRoom, server_id: currentRoomServerId },
    })),
  setCurrentRoomServerName: (currentRoomServerId, servers) => {
    const server = servers.find(
      (server) => server.server_id == currentRoomServerId
    );
    set((state) => ({
      currentRoom: { ...state.currentRoom, server_name: server?.servers.name },
    }));
  },

  fetchProfile: async (supabase, userId) => {
    const profile: Profile | undefined = useCurrentRoomStore
      .getState()
      .profileMap.get(userId);

    if (profile) {
      return;
    }

    // Otherwise, fetch the profile from the server
    const { data, error } = await getProfile(supabase, userId);

    if (error) {
      console.error(error);
      return;
    }

    // Add the profile to the map
    set((state) => ({
      profileMap: new Map(state.profileMap.set(data.id, data)),
    }));

    return;
  },
}));

export interface CurrentProfileState {
  currentSetting: boolean | undefined;
  currentUserProfile: Profile | undefined;
  setCurrentSetting: (currentSetting: boolean | undefined) => void;
  setCurrentUserProfile: (currentUserProfile: Profile | undefined) => void;
}

const useUserStore = create<CurrentProfileState>()((set) => ({
  currentSetting: false,
  currentUserProfile: undefined,
  setCurrentSetting: (currentSetting) => set((state) => ({ currentSetting })),
  setCurrentUserProfile: (currentUser) =>
    set((state) => ({ currentUserProfile: currentUser })),
}));

export interface RelationsState {
  relations: DetailedProfileRelation[];
  addRelation: (supabase: SupabaseClient<Database>, relationId: number) => void;
  updateRelation: (
    supabase: SupabaseClient<Database>,
    relationId: number
  ) => void;
  removeRelation: (
    supabase: SupabaseClient<Database>,
    relationId: number
  ) => void;
  getRelations: (supabase: SupabaseClient<Database>) => void;
}

const useRelationsStore = create<RelationsState>()((set) => ({
  relations: [],
  addRelation: async (supabase, relationId) => {
    // Get the details of the new profile relation
    const { data, error } = await relationToDetailedRelation(
      supabase,
      relationId
    );

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
    const { data, error } = await relationToDetailedRelation(
      supabase,
      relationId
    );

    if (error) {
      console.error(error);
      return;
    }

    set((state) => ({
      relations: state.relations.map((relation) => {
        // Once we hit a relation that matches the id, we can return the updated relation instead of the old one
        if (relation.id === data['id']) {
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
      // set({ relations: data as DetailedProfileRelation[] });

      if (Array.isArray(data)) {
        set({ relations: data as DetailedProfileRelation[] });
      } else {
        set({ relations: [data] as DetailedProfileRelation[] });
      }
    }
  },
}));

type OnlineUser = {
  [key: string]: any;
};
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
        [userId]: presenceInfo,
      },
    }));
  },

  flagUserOffline: (userId) => {
    set((state) => {
      const { [userId]: _, ...rest } = state.onlineUsers;
      return {
        onlineUsers: rest,
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
      dmChannels: new Map(state.dmChannels.set(data['recipient']['id'], data)),
    }));
  },

  getDMChannels: async (supabase) => {
    const { data, error } = await getAllDMChannels(supabase);

    if (error) {
      console.error(error);
      return;
    }

    const dmChannelsData = data as
      | DMChannelWithRecipient[]
      | DMChannelWithRecipient;

    set((state) => ({
      dmChannels: new Map(
        Array.isArray(dmChannelsData)
          ? dmChannelsData.map((channel) => [
              channel.recipient.id,
              {
                ...channel,
                name: channel.recipient.username,
              },
            ])
          : [
              [
                dmChannelsData.recipient.id,
                {
                  ...dmChannelsData,
                  name: dmChannelsData.recipient.username,
                },
              ],
            ]
      ),
    }));
  },
}));

export interface ServerRolesState {
  serverRoles: Map<number, Role[]>; // Map of serverId -> Role[]

  addRole: (role: Role) => void;
  updateRole: (role: Role) => void;
  removeRole: (role: number) => void;

  getRolesForAllServers: (supabase: SupabaseClient<Database>) => void;
  getRolesForServer: (
    supabase: SupabaseClient<Database>,
    serverId: number
  ) => void;
}

const useServerRolesStore = create<ServerRolesState>()((set) => ({
  serverRoles: new Map(),

  addRole: async (role) => {
    set((state) => ({
      serverRoles: new Map(
        state.serverRoles.set(role.server_id, [
          ...(state.serverRoles.get(role.server_id) || []),
          role,
        ])
      ),
    }));
  },

  updateRole: async (role) => {
    set((state) => ({
      serverRoles: new Map(
        state.serverRoles.set(
          role.server_id,
          (state.serverRoles.get(role.server_id) || []).map((r) =>
            r.id === role.id ? role : r
          )
        )
      ),
    }));
  },

  removeRole: async (roleId) => {
    set((state) => {
      const rv = new Map();

      for (const [serverId, roles] of state.serverRoles) {
        rv.set(
          serverId,
          roles.filter((r) => r.id !== roleId)
        );
      }

      return {
        serverRoles: rv,
      };
    });
  },

  // NOTE: This should be run on app launch and at no other time
  getRolesForAllServers: async (supabase) => {
    const { data, error } = await getRolesFromAllServersUserIsIn(supabase);

    if (error) {
      console.error(error);
      return;
    }

    set((state) => {
      const rv = new Map();

      const dataArray = Array.isArray(data) ? data : [data];

      for (const role of dataArray) {
        if (!rv.has(role.server_id)) {
          rv.set(role.server_id, []);
        }

        rv.set(role.server_id, [...rv.get(role.server_id), role]);
      }

      return { serverRoles: rv };
    });
  },

  getRolesForServer: async (supabase, serverId) => {
    const { data, error } = await getServerRoles(supabase, serverId);

    if (error) {
      console.error(error);
      return;
    }

    set((state) => ({
      serverRoles: new Map(state.serverRoles.set(serverId, data)),
    }));
  },
}));

export interface ServerProfilesState {
  serverProfiles: Map<number, Map<string, ServerUserProfile>>;

  addServerProfiles: (
    supabase: SupabaseClient<Database>,
    server_id: number
  ) => void;
  updateServerProfile: (
    supabase: SupabaseClient<Database>,
    profile_id: string,
    server_id: number
  ) => void;
  updateServerProfileByServerUser: (
    supabase: SupabaseClient<Database>,
    server_user_id: number
  ) => void;
  stripServerUserAndRoles: (server_user_id: number) => void;
  removeServerProfile: (profile_id: string, server_id: number) => void;
  removeProfilesForServerByServerUserId: (
    supabase: SupabaseClient<Database>,
    server_user_id: number
  ) => void;
}

const useServerProfilesStore = create<ServerProfilesState>()((set) => ({
  serverProfiles: new Map(),

  addServerProfiles: async (supabase, server_id) => {
    const { data, error } = await getAllProfilesForServer(supabase, server_id);

    if (error) {
      console.error(error);
      return;
    }

    set((state) => {
      const rv = new Map(state.serverProfiles);

      const dataArray = Array.isArray(data) ? data : [data];

      dataArray.forEach((profile) => {
        if (!rv.has(server_id)) {
          rv.set(server_id, new Map());
        }

        rv.get(server_id)!.set(profile.id, profile);
      });

      console.table(rv);
      return {
        serverProfiles: rv,
      };
    });
  },

  updateServerProfile: async (supabase, profile_id, server_id) => {
    const { data, error } = await getServerProfileForUser(
      supabase,
      profile_id,
      server_id
    );

    if (error) {
      console.error(error);
      return;
    }

    set((state) => {
      const rv = new Map(state.serverProfiles);

      if (!rv.has(server_id)) {
        rv.set(server_id, new Map());
      }

      rv.get(server_id)!.set(profile_id, data);

      return {
        serverProfiles: rv,
      };
    });
  },

  updateServerProfileByServerUser: async (supabase, server_user_id) => {
    const { data, error } = await getServerProfileForUserByServerUser(
      supabase,
      server_user_id
    );

    if (error) {
      console.error(error);
      return;
    }

    set((state) => {
      // Sanity check
      if (!data['server_user']) {
        return {
          serverProfiles: state.serverProfiles,
        };
      }

      const rv = new Map(state.serverProfiles);

      if (!rv.has(data['server_user']['server_id'])) {
        rv.set(data['server_user']['server_id'], new Map());
      }

      console.log('updating by server user');
      console.table(data);
      rv.get(data['server_user']['server_id'])!.set(data['id'], data);

      return {
        serverProfiles: rv,
      };
    });
  },

  stripServerUserAndRoles: (server_user_id) => {
    set((state) => {
      const rv = new Map(state.serverProfiles);

      for (const [server_id, profiles] of rv) {
        for (const [profile_id, profile] of profiles) {
          if (!profile.server_user) {
            continue;
          }

          if (profile.server_user.id === server_user_id) {
            rv.get(server_id)!.get(profile_id)!.server_user = null;
            rv.get(server_id)!.get(profile_id)!.roles = null;
            break;
          }
        }
      }

      return {
        serverProfiles: rv,
      };
    });
  },

  removeServerProfile: async (profile_id, server_id) => {
    set((state) => {
      const rv = new Map(state.serverProfiles);

      if (!rv.has(server_id)) {
        rv.set(server_id, new Map());
      }

      rv.get(server_id)!.delete(profile_id);

      return {
        serverProfiles: rv,
      };
    });
  },

  removeProfilesForServerByServerUserId: async (supabase, server_user_id) => {
    const { data: user } = await supabase.auth.getUser();
    set((state) => {
      const rv = new Map(state.serverProfiles);
      let _server_id;

      console.log('User: ', user);
      // Find the server user
      for (const [server_id, profiles] of rv) {
        console.log(
          'Searching for server user',
          server_user_id,
          'in server',
          server_id,
          '...'
        );
        for (const [profile_id, profile] of profiles) {
          console.log(
            'Checking profile',
            profile_id,
            'with server_user_id',
            profile.server_user?.id,
            '...'
          );

          if (!profile.server_user) {
            continue;
          }

          if (profile.server_user.id === server_user_id) {
            console.log(
              'Found server user',
              server_user_id,
              'in server',
              server_id,
              '...'
            );
            _server_id = server_id;

            console.table(user.user);
            if (user.user && profile_id === user.user.id) {
              const currChannel = useChannelStore.getState().channel;

              if (currChannel && currChannel.server_id === server_id) {
                useChannelStore.getState().setChannel(null);
              }
            }

            break;
          }
        }
      }

      if (_server_id) {
        rv.delete(_server_id);
      }

      return { serverProfiles: rv };
    });
  },
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
export const useLoadMoreMessages = () =>
  useMessagesStore((state) => state.loadMoreMessages);
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
export const useSetToken = () => useTokenStore((state) => state.setToken);
export const useTokenRef = () => useTokenStore((state) => state.token);
export const useSetConnectionState = () =>
  useConnectionStore((state) => state.setConnection);
export const useConnectionRef = () =>
  useConnectionStore((state) => state.connection);
export const useSetCurrentRoomId = () =>
  useCurrentRoomStore((state) => state.setCurrentRoomId);
export const useCurrentRoomRef = () =>
  useCurrentRoomStore((state) => state.currentRoom);
export const useSetCurrentRoomName = () =>
  useCurrentRoomStore((state) => state.setCurrentRoomName);
export const useSetCurrentRoomServerId = () =>
  useCurrentRoomStore((state) => state.setCurrentRoomServerId);
export const useSetRoomServerName = () =>
  useCurrentRoomStore((state) => state.setCurrentRoomServerName);
export const useCurrentRoomProfilesMap = () =>
  useCurrentRoomStore((state) => state.profileMap);
export const useCurrentRoomFetchProfile = () =>
  useCurrentRoomStore((state) => state.fetchProfile);
export const useSetUserSettings = () =>
  useUserStore((state) => state.setCurrentSetting);
export const useUserSettings = () =>
  useUserStore((state) => state.currentSetting);
export const useSetUserProfile = () =>
  useUserStore((state) => state.setCurrentUserProfile);
export const useProfile = () =>
  useUserStore((state) => state.currentUserProfile);

export const useRelations = () => useRelationsStore((state) => state.relations);
export const useAddRelation = () =>
  useRelationsStore((state) => state.addRelation);
export const useUpdateRelation = () =>
  useRelationsStore((state) => state.updateRelation);
export const useRemoveRelation = () =>
  useRelationsStore((state) => state.removeRelation);
export const useGetRelations = () =>
  useRelationsStore((state) => state.getRelations);
export const useOnlineUsers = () =>
  useOnlineStore((state) => state.onlineUsers);
export const useFlagUserOnline = () =>
  useOnlineStore((state) => state.flagUserOnline);
export const useFlagUserOffline = () =>
  useOnlineStore((state) => state.flagUserOffline);
export const useGetUserPermsForServer = () =>
  useUserPermsStore((state) => state.getUserPermsForServer);

/**
 * @deprecated inconsistent behaviour.
 */
export const useGetUserHighestRolePosition = () =>
  useUserPermsStore((state) => state.getHighestRolePositionForUser);

/**
 * @deprecated use useServerUserProfilePermissions
 */
export const useUserServerPerms = () =>
  useUserPermsStore((state) => state.userServerPerms);

/**
 * @deprecated use useServerUserProfileHighestRolePosition
 */
export const useUserHighestRolePosition = () =>
  useUserPermsStore((state) => state.userHighestRolePosition);

export const useAddDMChannel = () =>
  useDMChannelsStore((state) => state.addDMChannel);
export const useDMChannels = () =>
  useDMChannelsStore((state) => state.dmChannels);
export const useGetDMChannels = () =>
  useDMChannelsStore((state) => state.getDMChannels);
export const useServerRoles = (server_id: number) =>
  useServerRolesStore((state) => state.serverRoles.get(server_id) || []);
export const useAddServerRole = () =>
  useServerRolesStore((state) => state.addRole);
export const useUpdateServerRole = () =>
  useServerRolesStore((state) => state.updateRole);
export const useRemoveServerRole = () =>
  useServerRolesStore((state) => state.removeRole);
export const useGetAllServerRoles = () =>
  useServerRolesStore((state) => state.getRolesForAllServers);
export const useGetRolesForServer = () =>
  useServerRolesStore((state) => state.getRolesForServer);
export const useGetAllServerUserProfiles = () =>
  useServerProfilesStore((state) => state.addServerProfiles);
export const useUpateServerUserProfile = () =>
  useServerProfilesStore((state) => state.updateServerProfile);
export const useUpdateServerUserProfileByServerUserId = () =>
  useServerProfilesStore((state) => state.updateServerProfileByServerUser);
export const useAllServerProfiles = () =>
  useServerProfilesStore((state) => state.serverProfiles);
export const useServerUserProfile = (server_id: number, profile_id: string) =>
  useServerProfilesStore((state) =>
    state.serverProfiles.get(server_id)?.get(profile_id)
  );
export const useRemoveServerUserProfile = () =>
  useServerProfilesStore((state) => state.removeServerProfile);
export const useStripServerUserAndRoles = () =>
  useServerProfilesStore((state) => state.stripServerUserAndRoles);
export const useRemoveProfilesForServerByServerUserId = () =>
  useServerProfilesStore(
    (state) => state.removeProfilesForServerByServerUserId
  );
export const useServerUserProfileHighestRolePosition = (
  server_id: number | null,
  profile_id: string
) =>
  useServerProfilesStore((state) => {
    if (!server_id) {
      return 32767; // Highest possible role position, smallint maxsize in postgres
    }

    const profile = state.serverProfiles.get(server_id)?.get(profile_id);

    if (!profile || !profile.roles) {
      return 32767; // Highest possible role position, smallint maxsize in postgres
    }

    // Iters over the roles and returns the highest role position
    profile.roles.sort((a, b) => a.position - b.position);

    return profile.roles[0].position;
  });
export const useServerUserProfileRoles = (
  server_id: number,
  profile_id: string
) =>
  useServerProfilesStore((state) => {
    const profile = state.serverProfiles.get(server_id)?.get(profile_id);

    if (!profile || !profile.roles) {
      return [];
    }

    // Iters over the roles and returns the highest role position
    profile.roles.sort((a, b) => a.position - b.position);

    return profile.roles;
  });
export const useServerUserProfilePermissions = (
  server_id: number | null,
  profile_id: string
) =>
  useServerProfilesStore((state) => {
    if (!server_id) {
      return 0;
    }

    const profile = state.serverProfiles.get(server_id)?.get(profile_id);

    if (!profile) {
      return 0;
    }

    if (!profile.roles) {
      return 0;
    }

    // Iters over the roles and bitwise ORs the permissions
    return profile.roles.reduce(
      (acc, role) => (acc | role.permissions) as ServerPermissions,
      0 as ServerPermissions
    );
  });
