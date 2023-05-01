import { getChannelsInServer } from '@/services/channels.service';
import { Database } from '@/types/database.supabase';
import { Channel, Server, User } from '@/types/dbtypes';
import { SupabaseClient } from '@supabase/supabase-js';

export class StoredServer {
  public id: number;
  public channels: Channel[];
  public members: User[];

  constructor(
    id: number,
    channels: Channel[],
    members: User[]
  ) {
    this.id = id;
    this.channels = channels;
    this.members = members;
  }

  static async fromServer(supabase: SupabaseClient<Database>, server: Server): Promise<StoredServer> {
    const channels = await getChannelsInServer(supabase, server.id);
    // return new StoredServer(server.id, channels, members);
  }
}
