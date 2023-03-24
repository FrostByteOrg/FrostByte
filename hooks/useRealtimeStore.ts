import { ServerUser, Server, ProfileRelation } from '@/types/dbtypes';
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
  useUpdateMessage,
  useUpdateRelation,
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

  const user = useUser();

  //TODO: CASCADE DELETE ICONS

  useEffect(() => {
    //this condition makes sure that the functions in the store are initialized, realistically it can be any function, I just chose addServer
    if (addServer) {
      supabase
        .channel('server_users')
        .on<ServerUser>(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'server_users', filter: `profile_id=eq.${user?.id}` },
          async (payload) => {
            console.log('insert');

            addServer(supabase, (payload.new as ServerUser).id);
          }
        )
        .on<ServerUser>(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'server_users', filter: `profile_id=eq.${user?.id}` },
          async (payload) => {
            console.log('remove user from server');

            //we should try to use the removeServer function from the store but the only resource on the payload is payload.old.id which is the server_user id
            //and not the server id
            if (user) {
              getServers(supabase, user.id);
            }
          }
        )
        .subscribe();

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
        .subscribe();
    }

    // add return right here!
    // return serverUsersListener.unsubscribe();
  }, [addServer, supabase, user, getServers, addRelation, updateRelation, removeRelation]);

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
            filter: `channel_id=eq.${channel?.channel_id}`,
          },
          async (payload) => {
            console.log('New message event');
            addMessage(supabase, (payload.new as MessageType).id);
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
            updateMessage(supabase, (payload.new as MessageType).id);
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
  }, [getRelations, supabase]);
}
