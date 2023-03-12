import { sanitizeMessage } from '@/lib/messageHelpers';
import { getPagination } from '@/lib/paginationHelper';
import { Database } from '@/types/database.supabase';
import { MessageWithServerProfile, UnsavedMessage } from '@/types/dbtypes';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function getMessagesInChannel(supabase: SupabaseClient<Database>, channelId: number, page: number = 0, pageSize: number = 50) {
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
  supabase: SupabaseClient<Database>,
  channelId: number,
  page: number = 0,
  pageSize: number = 50
) {
  // Paginate
  const { from, to } = getPagination(page, pageSize);

  return await supabase
    .rpc('get_messages_in_channel_with_server_profile', {
      c_id: channelId,
    })
    .order('sent_time', { ascending: false })
    .range(from, to)
    .returns<MessageWithServerProfile>();
}

type Profiles = Database['public']['Tables']['profiles']['Row'];
type MessagesWithUsersResponse = Awaited<ReturnType<typeof getMessagesInChannelWithUser>>;
// export type MessagesWithUsersResponseSuccess = MessagesWithUsersResponse['data'] & {
//   profiles: Profiles
// }
export type MessagesWithUsersResponseError = MessagesWithUsersResponse['error']


export async function getMessageWithUser(supabase: SupabaseClient<Database>, messageId: number) {
  return await supabase
    .from('messages')
    .select('*, profiles(\*), server_users(nickname)')
    .eq('id', messageId)
    .single();
}

type MessageWithUsersResponse = Awaited<ReturnType<typeof getMessageWithUser>>;
export type MessageWithUsersResponseSuccess = MessageWithUsersResponse['data'] & {
  profiles: Profiles
}
export type MessageWithUsersResponseError = MessageWithUsersResponse['error']

export async function createMessage(supabase: SupabaseClient<Database>, message: UnsavedMessage) {
  const { profile_id, channel_id } = message;
  const content = sanitizeMessage(message.content.trim());

  return await supabase
    .rpc('createmessage', { content, p_id: profile_id, c_id: channel_id });
}

export async function deleteMessage(supabase: SupabaseClient<Database>, messageId: number) {
  return await supabase
    .from('messages')
    .delete().eq('id', messageId)
    .single();
}

export async function editMessage(supabase: SupabaseClient<Database>, messageId: number, content: string) {
  // process anything necessary here
  content = sanitizeMessage(content);

  return await supabase
    .from('messages')
    .update({ content })
    .eq('id', messageId)
    .single();
}
