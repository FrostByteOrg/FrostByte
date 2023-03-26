import { Database } from '@/types/database.supabase';
import { DMChannelWithRecipient } from '@/types/dbtypes';
import { User } from '@/types/dbtypes';
import { SupabaseClient } from '@supabase/supabase-js';
import { Channel } from '@/types/dbtypes';
import { createDM } from '@/services/directmessage.service';

export async function getOrCreateDMChannel(
  supabase: SupabaseClient<Database>,
  profile: User,
  dmChannels: Map<string, DMChannelWithRecipient>,
  setChannel: (channel: Channel) => void,
) {
  // First check if we already have a DM channel with this user
  const channel = dmChannels.get(profile.id);

  if (channel) {
    setChannel(channel);
    return channel;
  }

  // If not, create a new DM channel
  const { data, error } = await createDM(supabase, profile.id);

  if (error) {
    console.error(error);
    return;
  }

  if (data) {
    setChannel({
      channel_id: data.channel_id,
      server_id: data.server_id,
      name: profile.username,
      is_media: false,
      description: null,
      created_at: null
    });
  }

  return data;
}
