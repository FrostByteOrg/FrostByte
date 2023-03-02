import { Database } from '@/types/database.supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export async function getChannelById(supabase: SupabaseClient<Database>, channelId: number) {
  return await supabase
    .from('channels')
    .select('*')
    .eq('id', channelId)
    .single();
}

type ChannelByIdResponse = Awaited<ReturnType<typeof getChannelById>>;
export type ChannelByIdResponseSuccess = ChannelByIdResponse['data'];
export type ChannelByIdResponseError = ChannelByIdResponse['error'];

export async function getChannelsInServer(supabase: SupabaseClient<Database>, serverId: number) {
  return await supabase
    .from('channels')
    .select('*')
    .eq('server_id', serverId);
}

type ChannelsInServerResponse = Awaited<ReturnType<typeof getChannelsInServer>>;
export type ChannelsInServerResponseSuccess = ChannelsInServerResponse['data'];
export type ChannelsInServerResponseError = ChannelsInServerResponse['error'];

export async function createChannel(supabase: SupabaseClient<Database>, serverId: number, name: string, desciption: string | null = null) {
  // Validate channel name is present
  if (!name) {
    return { data: null, error: 'Channel name is required' };
  }

  return await supabase
    .from('channels')
    .insert({
      server_id: serverId,
      name: name,
      description: desciption,
    })
    .select()
    .single();
}

type CreateChannelResponse = Awaited<ReturnType<typeof createChannel>>;
export type CreateChannelResponseSuccess = CreateChannelResponse['data'];
export type CreateChannelResponseError = CreateChannelResponse['error'];

export async function deleteChannel(supabase: SupabaseClient<Database>, channelId: number) {
  // NOTE: Supabase has been set up to cascade delete all messages in a channel when the channel is deleted
  return await supabase
    .from('channels')
    .delete()
    .eq('id', channelId)
    .single();
}

type DeleteChannelResponse = Awaited<ReturnType<typeof deleteChannel>>;
export type DeleteChannelResponseSuccess = DeleteChannelResponse['data'];
export type DeleteChannelResponseError = DeleteChannelResponse['error'];

export async function updateChannel(supabase: SupabaseClient<Database>, channelId: number, name: string, description: string | null) {
  return await supabase
    .from('channels')
    .update({
      name: name,
      description: description,
    })
    .eq('id', channelId)
    .select()
    .single();
}

type UpdateChannelResponse = Awaited<ReturnType<typeof updateChannel>>;
export type UpdateChannelResponseSuccess = UpdateChannelResponse['data'];
export type UpdateChannelResponseError = UpdateChannelResponse['error'];

export async function getAllChannelsForUser(supabase: SupabaseClient<Database>, userId: string) {
  return await supabase
    .rpc('get_all_channels_for_user', { p_id: userId });
}

type AllChannelsForUserResponse = Awaited<ReturnType<typeof getAllChannelsForUser>>;
export type AllChannelsForUserResponseSuccess = AllChannelsForUserResponse['data'];
export type AllChannelsForUserResponseError = AllChannelsForUserResponse['error'];

export async function getCurrentUserChannelPermissions(supabase: SupabaseClient<Database>, channelId: number) {
  return await supabase
    .rpc('get_channel_permission_flags', { c_id: channelId });
}

type CurrentUserChannelPermissionsResponse = Awaited<ReturnType<typeof getCurrentUserChannelPermissions>>;
export type CurrentUserChannelPermissionsResponseSuccess = CurrentUserChannelPermissionsResponse['data'];
export type CurrentUserChannelPermissionsResponseError = CurrentUserChannelPermissionsResponse['error'];
