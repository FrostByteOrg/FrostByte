import { Database } from '@/types/database.supabase';
import { DMChannelWithRecipient } from '@/types/dbtypes';
import { Profile } from '@/types/dbtypes';
import { SupabaseClient } from '@supabase/supabase-js';
import { createDM } from '@/services/directmessage.service';

export async function getOrCreateDMChannel(
  supabase: SupabaseClient<Database>,
  profile: Profile,
  dmChannels: Map<string, DMChannelWithRecipient>
) {
  // First check if we already have a DM channel with this user
  const channel = dmChannels.get(profile.id);

  if (channel) {
    return {
      channel_id: channel.channel_id,
      server_id: channel.server_id,
      name: profile.username,
      is_media: false,
      description: null,
      created_at: null,
    };
  }

  // If not, create a new DM channel
  const { data, error } = await createDM(supabase, profile.id);

  if (error) {
    console.error(error);
    return null;
  }

  if (data) {
    return {
      channel_id: data['channel_id'],
      server_id: data['server_id'],
      name: profile.username,
      is_media: false,
      description: null,
      created_at: null,
    };
  }

  return null;
}
