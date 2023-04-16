import { ServerUser, Server, ProfileRelation, Channel, Role, ServerUserRole, User } from '@/types/dbtypes';
import {
  useAddMessage,
  useAddRelation,
  useAddServer,
  useChannel,
  useGetMessages,
  useGetRelations,
  useGetServers,
  useGetUserPerms,
  useMessages,
  useRemoveMessage,
  useRemoveRelation,
  useUpdateRelation,
  useServers,
  useUpdateMessage,
  useUpdateServer,
  useAddDMChannel,
  useGetDMChannels,
  useAddServerRole,
  useUpdateServerRole,
  useRemoveServerRole,
  useGetAllServerRoles,
  useGetRolesForServer,
  useGetAllServerUserProfiles,
  useAllServerProfiles,
  useUpateServerUserProfile,
  useUpdateServerUserProfileByServerUserId,
  useStripServerUserAndRoles,
  useRemoveProfilesForServerByServerUserId,
} from '@/lib/store';
import { useEffect } from 'react';
import { Database } from '@/types/database.supabase';
import { useUser } from '@supabase/auth-helpers-react';
import { SupabaseClient } from '@supabase/supabase-js';
import type { Message as MessageType } from '@/types/dbtypes';
import { ChannelPermissions as ChannelPermissionsTableType } from '@/types/dbtypes';

export function useRealtimeStore(supabase: SupabaseClient<Database>) {
  const addServer = useAddServer();
  const getServers = useGetServers();
  const servers = useServers();
  const updateServer = useUpdateServer();

  const messages = useMessages();
  const addMessage = useAddMessage();
  const removeMessage = useRemoveMessage();
  const updateMessage = useUpdateMessage();
  const channel = useChannel();

  const getMessages = useGetMessages();
  const getUserPerms = useGetUserPerms();

  const addRelation = useAddRelation();
  const updateRelation = useUpdateRelation();
  const removeRelation = useRemoveRelation();
  const getRelations = useGetRelations();

  const addDMChannel = useAddDMChannel();
  const getDMChannels = useGetDMChannels();

  const addRole = useAddServerRole();
  const updateRole = useUpdateServerRole();
  const deleteRole = useRemoveServerRole();
  const getAllServerRoles = useGetAllServerRoles();
  const getRolesForServer = useGetRolesForServer();

  const getAllServerProfilesForServer = useGetAllServerUserProfiles();
  const updateServerUserProfile = useUpateServerUserProfile();
  const updateServerUserProfileByServerUserId = useUpdateServerUserProfileByServerUserId();
  const stripServerUserAndRoles = useStripServerUserAndRoles();
  const removeProfilesforServerByServerUserId = useRemoveProfilesForServerByServerUserId();
  const allServerProfiles = useAllServerProfiles();
  const user = useUser();

  //TODO: CASCADE DELETE ICONS

  useEffect(() => {
    //this condition makes sure that the functions in the store are initialized, realistically it can be any function, I just chose addServer

    if (addServer) {
      supabase
        .channel('server_users')
        .on<ServerUser>(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'server_users',
            filter: `profile_id=eq.${user?.id}`,
          },
          async (payload) => {
            console.log('current user joined a server');

            addServer(supabase, (payload.new as ServerUser).id);
            getRolesForServer(supabase, payload.new.server_id);
            getAllServerProfilesForServer(supabase, payload.new.id);
          }
        )
        .on<ServerUser>(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'server_users'
          },
          async (payload) => {
            console.log('A user updated their server profile');
            updateServerUserProfileByServerUserId(supabase, payload.new.id);
          }
        )
        .on<ServerUser>(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'server_users',
            filter: `profile_id=eq.${user?.id}`,
          },
          async (payload) => {
            console.log('This user left a server');

            // we should try to use the removeServer function from the store but the only resource
            // on the payload is payload.old.id which is the server_user id and not the server id
            if (user) {
              getServers(supabase, user.id);
            }

            removeProfilesforServerByServerUserId(payload.old.id!);
          }
        )
        .on<ServerUser>(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'server_users',
          },
          async (payload) => {
            console.log('Any user left a server');
            stripServerUserAndRoles(payload.old.id!);
          }
        )
        .subscribe();

      // START: Entrypoint for always active listeners
      supabase
        .channel('servers')
        .on<Server>(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'servers' },
          async (payload) => {
            console.log('update');

            if (user) {
              getServers(supabase, user.id);
            }
          }
        )
        .on<ProfileRelation>(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'profile_relations',
          },
          async (payload) => {
            console.log('Profile relation insert event');
            addRelation(supabase, payload.new.id);
          }
        )
        .on<ProfileRelation>(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profile_relations',
          },
          async (payload) => {
            console.log('Profile relation update event');
            updateRelation(supabase, payload.new.id);
          }
        )
        .on<ProfileRelation>(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'profile_relations',
          },
          async (payload) => {
            console.log('Profile relation delete event');
            removeRelation(supabase, payload.old.id as number);
          }
        )
        .on<User>(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
          },
          async (payload) => {
            console.log('Profile update event');
            console.table(payload.new);
            // This is cursed but it'll do lol
            for (const [ server_id, profiles ] of allServerProfiles) {
              updateServerUserProfile(supabase, payload.new.id, server_id);
            }
          }
        )
        .on<Server>(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'servers',
            filter: 'is_dm=eq.true',
          },
          async (payload) => {
            console.log('DM server insert event');
            addDMChannel(supabase, payload.new.id);

            // Fetch the profiles for the server
            getAllServerProfilesForServer(supabase, payload.new.id);
          }
        )
        .on<Role>(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'server_roles',
          },
          async (payload) => {
            console.log('Server role insert event');
            getAllServerProfilesForServer(supabase, payload.new.server_id);
            addRole(payload.new);
          }
        )
        .on<Role>(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'server_roles',
          },
          async (payload) => {
            console.log('Server role update event');
            getAllServerProfilesForServer(supabase, payload.new.server_id);
            updateRole(payload.new);
          }
        )
        .on<Role>(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'server_roles',
          },
          async (payload) => {
            console.log('Server role delete event');
            deleteRole(payload.old.id as number);

            for (const [server_id, profiles] of allServerProfiles) {
              for (const [profile_id, profile] of profiles) {
                if (!profile.roles) {
                  continue;
                }

                for (const role of profile.roles) {
                  // As soon as we find the role that was deleted, we trigger a server-wide profile update
                  if (role.id === payload.old.id) {
                    getAllServerProfilesForServer(supabase, server_id);
                    return;
                  }
                }
              }
            }
          }
        )
        .on<ServerUserRole>(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'server_user_roles',
          },
          async (payload) => {
            console.log('Server user role insert event');
            updateServerUserProfileByServerUserId(supabase, payload.new.server_user_id);
          }
        )
        .on<ServerUserRole>(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'server_user_roles',
          },
          async (payload) => {
            console.log('Server user role delete event', payload);

            for (const [server_id, profiles] of allServerProfiles) {
              for (const [profile_id, profile] of profiles) {
                if (!profile.roles) {
                  continue;
                }

                for (const role of profile.roles) {
                  if (role.server_user_role_id === payload.old.id) {
                    updateServerUserProfile(supabase, profile_id, server_id);
                    return;
                  }
                }
              }
            }
          }
        )
        .subscribe();

      supabase
        .channel('channels')
        .on<Channel>(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'channels' },
          async (payload) => {
            console.log('insert channel');
            const server = servers.find(
              (server) => server.server_id == payload.new.server_id
            );

            if (server) {
              updateServer(supabase, server.server_id);
            }
          }
        )
        .subscribe();
    }

    // add return right here!
    // return serverUsersListener.unsubscribe();
  }, [
    addServer,
    supabase,
    user,
    getServers,
    servers,
    updateServer,
    addRelation,
    updateRelation,
    removeRelation,
    addDMChannel,
    addRole,
    updateRole,
    deleteRole,
    getRolesForServer,
    updateServerUserProfileByServerUserId,
    getAllServerProfilesForServer,
    allServerProfiles,
    updateServerUserProfile,
    stripServerUserAndRoles,
    removeProfilesforServerByServerUserId
  ]);

  useEffect(() => {
    if (addMessage && getUserPerms && channel) {
      supabase
        .channel('chat-listener')
        .on<MessageType>(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `channel_id=eq.${channel.channel_id}`,
          },
          async (payload) => {
            console.log('New message event');
            addMessage(payload.new);
          }
        )
        .on<MessageType>(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'messages',
            filter: `channel_id=eq.${channel.channel_id}`,
          },
          async (payload) => {
            console.log('Message update event');
            updateMessage(payload.new);
          }
        )
        .on<MessageType>(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'messages',
            filter: `channel_id=eq.${channel.channel_id}`,
          },
          async (payload) => {
            console.log('Message delete event');
            if (!payload.old) {
              console.error('No old message found');
              return;
            }
            removeMessage(payload.old.id as number);
          }
        )
        .on<ChannelPermissionsTableType>(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'channel_permissions',
            filter: `channel_id=eq.${channel.channel_id}`,
          },
          async (payload) => {
            console.log('Channel permissions update event');
            getUserPerms(supabase, channel.channel_id);
          }
        )
        .subscribe();
    }
  }, [
    addMessage,
    channel,
    getUserPerms,
    messages,
    removeMessage,
    supabase,
    updateMessage,
    addRelation,
    updateRelation,
    removeRelation,
  ]);

  useEffect(() => {
    if (channel && getMessages && getUserPerms) {
      getUserPerms(supabase, channel.channel_id);
      getMessages(supabase, channel.channel_id);
    }
  }, [channel, getUserPerms, supabase, getMessages]);

  useEffect(() => {
    getRelations(supabase);
    getDMChannels(supabase);
    getAllServerRoles(supabase);
  }, [getRelations, getDMChannels, getAllServerRoles, supabase]);
}
