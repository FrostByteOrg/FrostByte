import { getPagination } from './paginationHelper';
import { createMessage } from '@/services/message.service';

//TODO: add better type checks
/**
 * Fetch all messages and their profiles
 * @param {number} channelId
 */
async function fetchMessages(
  channelId: number,
  // setState: Function,
  page: number = 0,
  pageSize: number = 50
) {
  const { from, to } = getPagination(page, pageSize);
  try {
    return await supabase
      .from('messages')
      .select('*, profiles(*)')
      .eq('channel_id', channelId)
      .order('sent_time', { ascending: false })
      .range(from, to);

    // if (setState) setState(data);

  }
  catch (error) {
    console.log('error', error);
    return { data: null, error };
  }
}

/**
 * Insert a new message into the DB
 * @param {string} message The message text
 * @param {number} channel_id
 * @param {string} profile_id The author profile id
 */
async function addMessage (content: string, channel_id: number, profile_id: string) {
  const { data: message, error } = await createMessage({
    content, channel_id, profile_id
  });

  if (error) {
    console.error(error);
  }

  return message;
};
