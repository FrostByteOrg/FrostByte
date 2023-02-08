import { getPagination } from '@/lib/paginationHelper';
import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/database.supabase';

export async function getMessagesInChannel(channelId: number, page: number = 0, pageSize: number = 50) {
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
  profiles: Profiles[]
  }
export type MessagesWithUsersResponseError = MessagesWithUsersResponse['error']


export async function getMessageWithUser(
  messageId: number
) {

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
