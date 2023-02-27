import { Database } from '@/types/database.supabase';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function createServer(
  supabase: SupabaseClient<Database>,
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

export async function getServer(supabase: SupabaseClient<Database>, id: number) {
  return await supabase.from('servers').select('*').eq('id', id);
}

type GetServerResponse = Awaited<ReturnType<typeof getServer>>;
export type GetServerResponseSuccess = GetServerResponse['data'];
export type GetServerResponseError = GetServerResponse['error'];

export async function updateServer(supabase: SupabaseClient<Database>, id: number, name: string, description: string | null) {
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

export async function deleteServer(supabase: SupabaseClient<Database>, user_id: string, server_id: number) {
  // NOTE: only the owner should be able to delete a server
  const { data: serverUser, error } = await supabase
    .from('server_users')
    .select('*')
    .eq('profile_id', user_id)
    .eq('server_id', server_id)
    .single();

  if (error) {
    // We mask this error and log it out
    console.log(`[WARNING]: Row missing in server-users for user ${user_id} and server ${server_id}`);
    console.error(error);
    return { data: null, error: { message: 'Unauthorized.' } };
  }

  if (!serverUser.is_owner) {
    return { data: null, error: { message: 'Only the owner can delete a server' } };
  }

  // NOTE: Supabase has been set up to cascade delete all items related to a server (roles/invites/channels/messages)
  // So we can delete the server itself
  return await supabase.from('servers').delete().eq('id', server_id);
}

type DeleteServerResponse = Awaited<ReturnType<typeof deleteServer>>;
export type DeleteServerResponseSuccess = DeleteServerResponse['data'];
export type DeleteServerResponseError = DeleteServerResponse['error'];

export async function getServersForUser(supabase: SupabaseClient<Database>, user_id: string) {
  return await supabase
    .from('server_users')
    .select('server_id, servers ( * )')
    .eq('profile_id', user_id);
}

type GetServersForUserResponse = Awaited<ReturnType<typeof getServersForUser>>;
export type GetServersForUserResponseSuccess = GetServersForUserResponse['data'];
export type GetServersForUserResponseError = GetServersForUserResponse['error'];

export async function getServerForUser(supabase: SupabaseClient<Database>, serverUser_id: number) {
  return await supabase
    .from('server_users')
    .select('server_id, servers ( * )')
    .eq('id', serverUser_id)
    .single();
};

type GetServerForUserResponse = Awaited<ReturnType<typeof getServerForUser>>;
export type GetServerForUserResponseSuccess = GetServerForUserResponse['data'];

export async function isUserInServer(supabase: SupabaseClient<Database>, user_id: string, server_id: number) {
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

type IsUserInServerResponse = Awaited<ReturnType<typeof isUserInServer>>;
export type IsUserInServerResponseSuccess = IsUserInServerResponse['data'];
export type IsUserInServerResponseError = IsUserInServerResponse['error'];

export async function createRole(supabase: SupabaseClient<Database>, server_id: number, name: string, color: string) {
  return await supabase
    .from('roles')
    .insert({ name, color, server_id })
    .select()
    .single();
}

type CreateRoleResponse = Awaited<ReturnType<typeof createRole>>;
export type CreateRoleResponseSuccess = CreateRoleResponse['data'];
export type CreateRoleResponseError = CreateRoleResponse['error'];

export async function getUserPermissions(supabase: SupabaseClient<Database>, user_id: string, server_id: number) {
  return await supabase
    .rpc(
      'get_permission_flags_for_server_user',
      { s_id: server_id, p_id: user_id }
    );
}

type GetUserPermissionsResponse = Awaited<ReturnType<typeof getUserPermissions>>;
export type GetUserPermissionsResponseSuccess = GetUserPermissionsResponse['data'];
export type GetUserPermissionsResponseError = GetUserPermissionsResponse['error'];

export async function getServerRoles(supabase: SupabaseClient<Database>, server_id: number) {
  return await supabase
    .from('server_roles')
    .select('*')
    .eq('server_id', server_id);
}

type GetServerRolesResponse = Awaited<ReturnType<typeof getServerRoles>>;
export type GetServerRolesResponseSuccess = GetServerRolesResponse['data'];
export type GetServerRolesResponseError = GetServerRolesResponse['error'];

export async function banUser(supabase: SupabaseClient<Database>, user_id: string, server_id: number, reason?: string) {
  return await supabase
    .from('server_bans')
    .insert({ profile_id: user_id, server_id, reason })
    .select()
    .single();
}

type BanUserResponse = Awaited<ReturnType<typeof banUser>>;
export type BanUserResponseSuccess = BanUserResponse['data'];
export type BanUserResponseError = BanUserResponse['error'];

export async function unbanUser(supabase: SupabaseClient<Database>, user_id: string, server_id: number) {
  return await supabase
    .from('server_bans')
    .delete()
    .eq('profile_id', user_id)
    .eq('server_id', server_id);
}

type UnbanUserResponse = Awaited<ReturnType<typeof unbanUser>>;
export type UnbanUserResponseSuccess = UnbanUserResponse['data'];
export type UnbanUserResponseError = UnbanUserResponse['error'];

export async function kickUser(supabase: SupabaseClient<Database>, user_id: string, server_id: number) {
  return await supabase
    .from('server_users')
    .delete()
    .eq('profile_id', user_id)
    .eq('server_id', server_id)
    .select();
}

type KickUserResponse = Awaited<ReturnType<typeof kickUser>>;
export type KickUserResponseSuccess = KickUserResponse['data'];
export type KickUserResponseError = KickUserResponse['error'];
