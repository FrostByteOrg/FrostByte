import { useEffect } from 'react';
import { IStringIndexable } from '@/types/dbtypes';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { Database } from '@/types/database.supabase';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

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
  const supabase = useSupabaseClient();

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
  }, [listenEvents, listen_db, supabase]);
}
