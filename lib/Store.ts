import { supabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import { getPagination } from './paginationHelper';
import { MessageWithUsersResponseSuccess, MessagesWithUsersResponseSuccess, createMessage } from '@/services/message.service';
import { getServersForUser } from '@/services/server.service';

export function useStore<T>({ channelId }: { channelId: number }, profileId = null ) {
  //TODO:skip the user listener for now, will implement forsure later but for now its not needed
  //TODO:remove the db functions at the bottom and import them from the services once we refactor
  //to passing the supabase instance in function params
  //TODO: FIX TYPESSSSS

  const [messages, setMessages] = useState<any>([]);
  const [newMessage, handleNewMessage] = useState<any>(null);
  const [deletedMessage, handleDeletedMessage] = useState<any>(null);

  // if (T == Messages)

  const [servers, setServers] = useState<any>([]);
  const [newServer, handleNewServer] = useState<any>(null);
  const [deletedServer, handleDeleteServer] = useState<any>(null);

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

    const serverListener = supabase
      .channel('public:servers')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'servers' },
        (payload) => handleNewServer(payload.new)
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'servers' },
        (payload) => handleDeleteServer(payload.old)
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(messageListener);
      supabase.removeChannel(serverListener);
    };
  }, []);

  // Update when the channel changes
  useEffect(() => {
    if (channelId > 0) {
      //TODO: messages should be typed to getmessagesinchannelwithuser
      const handleAsync = async () => {
        await fetchMessages(channelId, (messages: any) => {
          setMessages(messages);

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

  useEffect(() => {
    if (newServer) {
      setServers([...servers, newServer]);
      handleNewServer(null);
    }
  }, [newServer, servers]);

  useEffect(() => {
    if (deletedServer) setServers(servers.filter((servers: any) => servers.id !== deletedServer.id));
    handleDeleteServer(null);

  }, [deletedServer, servers]);

  // Deleted message received from postgres
  useEffect(() => {
    if (deletedMessage) setMessages(messages.filter((message: any) => message.id !== deletedMessage.id));
    handleDeletedMessage(null);

  }, [deletedMessage, messages]);

  if (profileId) {
    return {
      messages: messages as T,
      servers: servers
    };
  }

  return {
    messages: messages as T,
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


/**
 * Fetch all servers for a given user
 * @param {string} profileId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export async function fetchServers(
  profileId: string,
  setState: Function,
) {
  if (profileId) {
    try {
      const { data } = await getServersForUser(profileId);
      if (setState) setState(data);
      return data;
    } 
    catch (error) {
      console.log('error', error);
    }
  }
  return null;
}
