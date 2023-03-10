import {
  createContext,
  SetStateAction,
  useContext,
  useState,
  Dispatch,
} from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Server, ServersForUser, ServerUser } from '@/types/dbtypes';
import { getServerForUser, getServersForUser } from '@/services/server.service';
import { useServers, useServersSetter } from './ChatCtx';

export const RealTimeCtx = createContext(null);

export function RealTimeProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseClient();
  const setServers = useServersSetter();
  const servers = useServers();
  const user = useUser();

  //TODO: DELETE SERVER USERS realtime, add description, CASCADE DELETE images, change the context name, port messages state to the same context
  supabase
    .channel('server_users')
    .on<ServerUser>(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'server_users' },
      async (payload) => {
        console.log('insert');
        const { data, error } = await getServerForUser(
          supabase,
          (payload.new as ServerUser).id
        );

        if (error) {
          console.error(error);
          return;
        }

        setServers(servers.concat(data as ServersForUser));
      }
    )
    .on<ServerUser>(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'server_users' },
      async (payload) => {
        console.log('remove user from server');
        const { data, error } = await getServersForUser(supabase, user!.id);

        if (error) {
          console.error(error);
        }

        if (data) {
          setServers(data as ServersForUser[]);
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
        const { data, error } = await getServersForUser(supabase, user!.id);

        if (error) {
          console.error(error);
        }

        if (data) {
          setServers(data as ServersForUser[]);
        }
      }
    )
    .on<Server>(
      'postgres_changes',
      { event: 'DELETE', schema: 'public', table: 'servers' },
      async (payload) => {
        console.log('Delete server');

        setServers(
          servers.filter((server) => server.server_id !== payload.old.id)
        );
      }
    )
    .subscribe();

  return <RealTimeCtx.Provider value={null}>{children}</RealTimeCtx.Provider>;
}
