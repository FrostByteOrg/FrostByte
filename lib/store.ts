import { create } from 'zustand';
import { Server, ServersForUser, ServerUser } from '@/types/dbtypes';
import { Database } from '@/types/database.supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { getServerForUser, getServersForUser } from '@/services/server.service';

export interface ServerState {
  servers: ServersForUser[];
  addServer: (supabase: SupabaseClient<Database>, serverUserId: number) => void;
  removeServer: (serverId: number) => void;
  getServers: (supabase: SupabaseClient<Database>, userId: string) => void;
}

export const useServerStore = create<ServerState>()((set) => ({
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
}));
