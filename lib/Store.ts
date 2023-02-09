import { supabase } from '@/lib/supabaseClient';
import { useEffect } from 'react';
import { getPagination } from './paginationHelper';
import { createMessage } from '@/services/message.service';
import { getServersForUser } from '@/services/server.service';
import { IStringIndexable } from '@/types/dbtypes';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Database } from '@/types/database.supabase';

export type RealtimeListenerEvent<T extends IStringIndexable> = {
  type: 'postgres_changes',
  filter: {
    schema: 'public',
    table: keyof Database['public']['Tables']
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
  },
  callback: (payload: RealtimePostgresChangesPayload<T>) => void
}

export function useRealtime<T extends IStringIndexable>(
  listen_db: string,
  listenEvents: RealtimeListenerEvent<T>[]
) {
  // Load initial data and set up listeners
  useEffect(() => {
    const listener = supabase.channel(listen_db);

    for (const event of listenEvents) {
      const { type, filter, callback } = event;

      // @ts-expect-error I just need this to be dynamic, this type value definition
      // when used with some attention to detail (matching events + callback types
      // will not actually raise an error or be invalid.
      // I'll note this as a TODO: for when we have the time to fix the types to
      // always match at least one of the overloads to this function
      listener.on<T>(type, filter, callback);
    }

    listener.subscribe();

    // Cleanup on unmount
    return () => {
      supabase.removeChannel(listener);
    };
  }, []);
}

//TODO: add better type checks
/**
 * Fetch all messages and their profiles
 * @param {number} channelId
 * @param {function} setState Optionally pass in a hook or callback to set the state
 */
export async function fetchMessages(
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
