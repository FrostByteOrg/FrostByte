import { supabase } from '@/lib/supabaseClient';
import { useState } from 'react';
import { getPagination } from './paginationHelper';

export function useStore({ channelId }: { channelId: number }) {
  //TODO:skip the user listener for now, will implement forsure later but for now its not needed
  //TODO:skip the channels listener, we wont wanna do it how they do since we need to be more specific and fetch
  // server channels instead of all like how they do
  //TODO:remove the db functions at the bottom and import them from the services once we refactor
  //to passing the supabase instance in function params

  const [messages, setMessages] = useState([]);
  const [newMessage, handleNewMessage] = useState(null);
  const [deletedMessage, handleDeletedMessage] = useState(null);
}

/**
 * Fetch all messages and their profiles
 * @param {number} channelId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export async function fetchMessages(
  channelId: number,
  setState: Function,
  page: number = 0,
  pageSize: number = 50
) {
  const { from, to } = getPagination(page, pageSize);
  try {
    const { data } = await supabase
      .from('messages')
      .select('*, profiles(*)')
      .eq('channel_id', channelId)
      .order('sent_time', { ascending: false })
      .range(from, to);
    if (setState) setState(data);
    return data;
  } 
  catch (error) {
    console.log('error', error);
  }
}
