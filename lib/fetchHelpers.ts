import { useQuery } from 'react-query';
import { getServersForUser } from '@/services/server.service';
import { Database } from '@/types/database.supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export default function useGetServerQuery(
  supabase: SupabaseClient<Database>,
  userId: string | undefined
) {
  return useQuery(
    'getServers',
    async () => {
      if (!userId) throw new Error('No user Id');
      const { data, error } = await getServersForUser(supabase, userId);
      if (error) throw error.message;
      return data;
    },
    { enabled: false }
  );
}
