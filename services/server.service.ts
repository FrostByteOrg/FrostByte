import { Database } from '@/types/database.supabase';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function createServer(
  supabase: SupabaseClient<Database>,
  owner_id: string,
  name: string,
  description: string | null
) {
  // Validate server name is present
  if (!name) {
    return { data: null, error: 'Server name is required' };
  }

  const dbResp = await supabase
    .from('servers')
    .insert({ name, description })
    .select()
    .single();

  if (dbResp.error) {
    return dbResp;
  }

  // Let's add the owner to the server
  await supabase.from('server_users').insert({
    profile_id: owner_id,
    server_id: dbResp.data.id,
    is_owner: true,
  });

  // Now that we have a server, we need to create a default channel for it
  await supabase
    .from('channels')
    .insert({ name: 'general', server_id: dbResp.data.id });

  return dbResp;
}

type CreateServerResponse = Awaited<ReturnType<typeof createServer>>;
export type CreateServerResponseSuccess = CreateServerResponse['data'];
export type CreateServerResponseError = CreateServerResponse['error'];

export async function getServers(supabase: SupabaseClient<Database>) {
  return await supabase.from('servers').select('*');
}

type GetServersResponse = Awaited<ReturnType<typeof getServers>>;
export type GetServersResponseSuccess = GetServersResponse['data'];
export type GetServersResponseError = GetServersResponse['error'];

export async function getServer(
  supabase: SupabaseClient<Database>,
  id: number
) {
  return await supabase.from('servers').select('*').eq('id', id);
}

type GetServerResponse = Awaited<ReturnType<typeof getServer>>;
export type GetServerResponseSuccess = GetServerResponse['data'];
export type GetServerResponseError = GetServerResponse['error'];

export async function updateServer(
  supabase: SupabaseClient<Database>,
  id: number,
  name: string,
  description: string | null
) {
  return await supabase
    .from('servers')
    .update({ name, description })
    .eq('id', id)
    .select()
    .single();
}

type UpdateServerResponse = Awaited<ReturnType<typeof updateServer>>;
export type UpdateServerResponseSuccess = UpdateServerResponse['data'];
export type UpdateServerResponseError = UpdateServerResponse['error'];

export async function deleteServer(
  supabase: SupabaseClient<Database>,
  user_id: string,
  server_id: number
) {
  // NOTE: only the owner should be able to delete a server
  const { data: serverUser, error } = await supabase
    .from('server_users')
    .select('*')
    .eq('profile_id', user_id)
    .eq('server_id', server_id)
    .single();

  if (error) {
    // We mask this error and log it out
    console.log(
      `[WARNING]: Row missing in server-users for user ${user_id} and server ${server_id}`
    );
    console.error(error);
    return { data: null, error: { message: 'Unauthorized.' } };
  }

  if (!serverUser.is_owner) {
    return {
      data: null,
      error: { message: 'Only the owner can delete a server' },
    };
  }

  // NOTE: Supabase has been set up to cascade delete all items related to a server (roles/invites/channels/messages)
  // So we can delete the server itself
  return await supabase.from('servers').delete().eq('id', server_id);
}

type DeleteServerResponse = Awaited<ReturnType<typeof deleteServer>>;
export type DeleteServerResponseSuccess = DeleteServerResponse['data'];
export type DeleteServerResponseError = DeleteServerResponse['error'];

export async function getServersForUser(
  supabase: SupabaseClient<Database>,
  user_id: string
) {
  return await supabase
    .from('server_users')
    .select('server_id, servers ( * )')
    .eq('profile_id', user_id);
}

type GetServersForUserResponse = Awaited<ReturnType<typeof getServersForUser>>;
export type GetServersForUserResponseSuccess =
  GetServersForUserResponse['data'];
export type GetServersForUserResponseError = GetServersForUserResponse['error'];

export async function getServerForUser(
  supabase: SupabaseClient<Database>,
  serverUser_id: number
) {
  return await supabase
    .from('server_users')
    .select('server_id, servers ( * )')
    .eq('id', serverUser_id)
    .single();
}

type GetServerForUserResponse = Awaited<ReturnType<typeof getServerForUser>>;
export type GetServerForUserResponseSuccess = GetServerForUserResponse['data'];

export async function isUserInServer(
  supabase: SupabaseClient<Database>,
  user_id: string,
  server_id: number
) {
  const { data, error } = await supabase
    .from('server_users')
    .select('*')
    .eq('profile_id', user_id)
    .eq('server_id', server_id)
    .single();

  if (error) {
    return { data: null, error };
  }

  return { data: data !== null, error: null };
}
