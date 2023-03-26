import { Database } from '@/types/database.supabase';
import { DMChannelWithRecipient } from '@/types/dbtypes';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function getAllDMChannels(supabase: SupabaseClient<Database>) {
  return await supabase
    .rpc('get_dm_channels_and_target_profiles')
    .returns<DMChannelWithRecipient>();
}

export async function createDM(supabase: SupabaseClient<Database>, targetId: string) {
  return await supabase
    .rpc('create_dm', { t_p_id: targetId })
    .returns<DMChannelWithRecipient>()
    .single();
}
