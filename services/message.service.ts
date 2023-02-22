import { getPagination } from '@/lib/paginationHelper';
import { Database } from '@/types/database.supabase';
import { UnsavedMessage } from '@/types/dbtypes';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function getMessagesInChannel(supabase: SupabaseClient, channelId: number, page: number = 0, pageSize: number = 50) {
  // Paginate
  const { from, to } = getPagination(page, pageSize);

  return await supabase
    .from('messages')
    .select('*')
    .eq('channel_id', channelId)
    .order('sent_time', { ascending: false })
    .range(from, to);
}

export async function getMessagesInChannelWithUser(
  supabase: SupabaseClient,
  channelId: number,
  page: number = 0,
  pageSize: number = 50
) {
  // Paginate
  const { from, to } = getPagination(page, pageSize);

  return await supabase
    .from('messages')
    .select('*, profiles(\*)')
    .eq('channel_id', channelId)
    .order('sent_time', { ascending: false })
    .range(from, to);
}

type Profiles = Database['public']['Tables']['profiles']['Row'];
type MessagesWithUsersResponse = Awaited<ReturnType<typeof getMessagesInChannelWithUser>>;
export type MessagesWithUsersResponseSuccess = MessagesWithUsersResponse['data'] & {
  profiles: Profiles
}
export type MessagesWithUsersResponseError = MessagesWithUsersResponse['error']


export async function getMessageWithUser(supabase: SupabaseClient, messageId: number) {
  return await supabase
    .from('messages')
    .select('*, profiles(\*)')
    .eq('id', messageId)
    .single();
}

type MessageWithUsersResponse = Awaited<ReturnType<typeof getMessageWithUser>>;
export type MessageWithUsersResponseSuccess = MessageWithUsersResponse['data'] & {
  profiles: Profiles
}
export type MessageWithUsersResponseError = MessageWithUsersResponse['error']

export async function createMessage(supabase: SupabaseClient, message: UnsavedMessage) {
  const { content, profile_id, channel_id } = message;

  // Fetch the server_id for channel_id
  const { data: server_channel, error: serverChannelError } = await supabase
    .from('channels')
    .select('server_id')
    .eq('channel_id', channel_id)
    .single();

  if (serverChannelError) {
    console.log('Error fetching server_id for channel_id');
    console.error(serverChannelError);
  }

  // Fetch the server_user for author_id
  const { data: server_user, error: serverUserError } = await supabase
    .from('server_users')
    .select('id')
    .eq('profile_id', profile_id)
    .eq('server_id', server_channel?.server_id)
    .single();

  // NOTE: This should never happen, but just in case
  if (serverUserError) {
    console.log(`Error fetching server_user for author_id (profile_id: ${profile_id} | server_id: ${server_channel?.server_id})))`);
    console.error(serverUserError);
  }

  return await supabase
    .from('messages')
    .insert({
      content,
      profile_id,
      channel_id,
      author_id: server_user?.id!
    })
    .select('*')
    .single();
}
