import { getServerForUser } from '@/services/server.service';
import { ServerUser, ServersForUser, Server } from '@/types/dbtypes';
import { ServerState, useServerStore } from '@/lib/store';
import { UseBoundStore } from 'zustand/react';
import { StoreApi } from 'zustand/vanilla';
import { useEffect } from 'react';
import { Database } from '@/types/database.supabase';
import { useUser } from '@supabase/auth-helpers-react';
import { SupabaseClient } from '@supabase/supabase-js';

export function useRealTime(
  useServerStore: UseBoundStore<StoreApi<ServerState>>,
  supabase: SupabaseClient<Database>
) {
  const { addServer, getServers } = useServerStore();

  const user = useUser();

  //TODO: CASCADE DELETE ICONS, add store for messages, remove context server stuff

  useEffect(() => {
    //this condition makes sure that the functions in the store are initialized, realistically it can be any function, I just chose addServer
    if (addServer) {
      supabase
        .channel('server_users')
        .on<ServerUser>(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'server_users' },
          async (payload) => {
            console.log('insert');

            addServer(supabase, (payload.new as ServerUser).id);
          }
        )
        .on<ServerUser>(
          'postgres_changes',
          { event: 'DELETE', schema: 'public', table: 'server_users' },
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
        .subscribe();
    }

    // add return right here!
    // return serverUsersListener.unsubscribe();
  }, [addServer, supabase, user, getServers]);
}
