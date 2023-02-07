import { getPagination } from '@/lib/paginationHelper';
import { supabase } from '@/lib/supabaseClient';

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
