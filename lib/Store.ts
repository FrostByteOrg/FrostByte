import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { getPagination } from './paginationHelper';
import { MessageWithUsersResponseSuccess, createMessage } from '@/services/message.service';

export function useStore({ channelId }: { channelId: number }) {
  //TODO:skip the user listener for now, will implement forsure later but for now its not needed
  //TODO:skip the channels listener, we wont wanna do it how they do since we need to be more specific and fetch
  // server channels instead of all like how they do
  //TODO:remove the db functions at the bottom and import them from the services once we refactor
  //to passing the supabase instance in function params
  //TODO: FIX TYPESSSSS

  const [messages, setMessages] = useState<any>([]);
  const [newMessage, handleNewMessage] = useState<any>(null);
  const [deletedMessage, handleDeletedMessage] = useState<any>(null);

  // Load initial data and set up listeners
  useEffect(() => {
    // Listen for new and deleted messages
    const messageListener = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => handleNewMessage(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => handleDeletedMessage(payload.old)
      )
      .subscribe();
    // Cleanup on unmount
    return () => {
      supabase.removeChannel(messageListener);
    };
  }, []);

  // Update when the route changes
  useEffect(() => {
    if (channelId > 0) {
      //TODO: messages should be typed to getmessagesinchannelwithuser
      const handleAsync = async () => {
        await fetchMessages(channelId, (messages: any) => {
          setMessages(messages);
          // console.log(messages);
        });
      };
      handleAsync();
    }

  }, [channelId]);

  // New message received from Postgres
  useEffect(() => {
    if (newMessage && newMessage.channel_id == channelId) {
      //TODO: fix this!, make this work, currently newMessage is a message but it does not include the user profile
      //hence why react cant render the thang, with type checks it will show the errors but currently everything is
      //set to any:DDD
      // setMessages([...messages, newMessage]);
      const handleAsync = async () => {
        await fetchMessages(channelId, (messages: any) => {
          setMessages(messages);
        });
      };
      handleAsync();
      handleNewMessage(null);

    }
  }, [newMessage, messages, channelId]);

  // Deleted message received from postgres
  useEffect(() => {
    if (deletedMessage) setMessages(messages.filter((message: any) => message.id !== deletedMessage.id));

  }, [deletedMessage, messages]);

  return {
    messages: messages,
  };
}

//TODO: add better type checks
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

/**
 * Insert a new message into the DB
 * @param {string} message The message text
 * @param {number} channel_id
 * @param {string} profile_id The author profile id
 */
export async function addMessage (content: string, channel_id: number, profile_id: string) {
  const { data: message, error } = await createMessage({
    content, channel_id, profile_id
  });

  if (error) {
    console.error(error);
  }

  return message;
};
