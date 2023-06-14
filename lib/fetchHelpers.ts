import { useQuery } from 'react-query';
import { getServersForUser } from '@/services/server.service';
import { Database } from '@/types/database.supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export default function useGetServerQuery(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  return useQuery(
    'getServers',
    async () => {
      const { data, error } = await getServersForUser(supabase, userId);
      if (error) throw error.message;
      return data;
    },
    { enabled: false }
  );
}
