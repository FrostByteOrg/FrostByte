import { Database } from '@/types/database.supabase';
import {
  ServerBanWithProfile,
  ServerUserProfile,
  ServersForUser,
  Profile,
} from '@/types/dbtypes';
import { ServerPermissions } from '@/types/permissions';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function createServer(
  supabase: SupabaseClient<Database>,
  name: string,
  description?: string | null
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
  server_id: number
) {
  // NOTE: only the owner should be able to delete a server. This is enforced by RLS
  // NOTE: Supabase has been set up to cascade delete all items related to a server (roles/invites/channels/messages)
  // So we can delete the server itself
  return await supabase.from('servers').delete().eq('id', server_id);
}

type DeleteServerResponse = Awaited<ReturnType<typeof deleteServer>>;
export type DeleteServerResponseSuccess = DeleteServerResponse['data'];
export type DeleteServerResponseError = DeleteServerResponse['error'];

export async function leaveServer(
  supabase: SupabaseClient<Database>,
  user_id: string,
  server_id: number
) {
  return await supabase
    .from('server_users')
    .delete()
    .eq('profile_id', user_id)
    .eq('server_id', server_id);
}

type LeaveServerResponse = Awaited<ReturnType<typeof leaveServer>>;
export type LeaveServerResponseSuccess = LeaveServerResponse['data'];
export type LeaveServerResponseError = LeaveServerResponse['error'];

export async function getServersForUser(
  supabase: SupabaseClient<Database>,
  user_id: string
) {
  return await supabase
    .from('server_users')
    .select('server_id, servers!inner( * )')
    .eq('profile_id', user_id)
    .eq('servers.is_dm', false);
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
    .select('server_id, servers!inner( * )')
    .eq('id', serverUser_id)
    .returns<ServersForUser>()
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

type IsUserInServerResponse = Awaited<ReturnType<typeof isUserInServer>>;
export type IsUserInServerResponseSuccess = IsUserInServerResponse['data'];
export type IsUserInServerResponseError = IsUserInServerResponse['error'];

export async function getRolesForUser(
  supabase: SupabaseClient<Database>,
  user_id: string,
  server_id: number
) {
  return await supabase.rpc('get_roles_for_user_in_server', {
    p_id: user_id,
    s_id: server_id,
  });
}

type GetRolesForUserResponse = Awaited<ReturnType<typeof getRolesForUser>>;
export type GetRolesForUserResponseSuccess = GetRolesForUserResponse['data'];
export type GetRolesForUserResponseError = GetRolesForUserResponse['error'];

export async function banUser(
  supabase: SupabaseClient<Database>,
  user_id: string,
  server_id: number,
  reason?: string
) {
  return await supabase
    .from('server_bans')
    .insert({ profile_id: user_id, server_id, reason })
    .select()
    .single();
}

type BanUserResponse = Awaited<ReturnType<typeof banUser>>;
export type BanUserResponseSuccess = BanUserResponse['data'];
export type BanUserResponseError = BanUserResponse['error'];

export async function unbanUser(
  supabase: SupabaseClient<Database>,
  user_id: string,
  server_id: number
) {
  return await supabase
    .from('server_bans')
    .delete()
    .eq('profile_id', user_id)
    .eq('server_id', server_id);
}

type UnbanUserResponse = Awaited<ReturnType<typeof unbanUser>>;
export type UnbanUserResponseSuccess = UnbanUserResponse['data'];
export type UnbanUserResponseError = UnbanUserResponse['error'];

export async function getServerBans(
  supabase: SupabaseClient<Database>,
  server_id: number
) {
  return await supabase
    .from('server_bans')
    .select('*, profiles(*)')
    .eq('server_id', server_id)
    .returns<ServerBanWithProfile>();
}

export async function kickUser(
  supabase: SupabaseClient<Database>,
  user_id: string,
  server_id: number
) {
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

export async function getCurrentUserServerPermissions(
  supabase: SupabaseClient<Database>,
  server_id: number,
  userId?: string
) {
  return await supabase
    .rpc('get_permission_flags_for_server_user', {
      s_id: server_id,
      p_id: userId ? userId : (await supabase.auth.getUser()).data.user?.id!,
    })
    .single();
}

type GetCurrentUserServerPermissionsResponse = Awaited<
  ReturnType<typeof getCurrentUserServerPermissions>
>;
export type GetCurrentUserServerPermissionsResponseSuccess =
  GetCurrentUserServerPermissionsResponse['data'];
export type GetCurrentUserServerPermissionsResponseError =
  GetCurrentUserServerPermissionsResponse['error'];

export async function getServerMemberCount(
  supabase: SupabaseClient<Database>,
  server_id: number
) {
  const { data: server_users, error } = await supabase
    .from('server_users')
    .select('*')
    .eq('server_id', server_id);

  if (error) {
    console.error(error);
    return 0;
  }

  return server_users.length;
}

type GetServerMemberCountResponse = Awaited<
  ReturnType<typeof getServerMemberCount>
>;

export async function getUsersInServer(
  supabase: SupabaseClient<Database>,
  server_id: number
) {
  return await supabase
    .rpc('get_users_in_server', { s_id: server_id })
    .returns<Profile>();
}

type GetUsersInServerResponse = Awaited<ReturnType<typeof getUsersInServer>>;
export type GetUsersInServerResponseSuccess = GetUsersInServerResponse['data'];
export type GetUsersInServerResponseError = GetUsersInServerResponse['error'];

export async function getServerIdFromMessageId(
  supabase: SupabaseClient<Database>,
  message_id: number
) {
  return await supabase
    .rpc('get_server_id_of_message', { m_id: message_id })
    .single();
}

type GetServerIdFromMessageIdResponse = Awaited<
  ReturnType<typeof getServerIdFromMessageId>
>;
export type GetServerIdFromMessageIdResponseSuccess =
  GetServerIdFromMessageIdResponse['data'];
export type GetServerIdFromMessageIdResponseError =
  GetServerIdFromMessageIdResponse['error'];

export async function addServerIcon(
  supabase: SupabaseClient<Database>,
  filePath: string,
  image: any,
  server_id: number
) {
  const { data, error } = await supabase.storage
    .from('servericons')
    .upload(filePath, image, { upsert: true, cacheControl: '1' });

  const publicURL = supabase.storage.from('servericons').getPublicUrl(filePath);

  return await supabase
    .from('servers')
    .update({ image_url: publicURL.data.publicUrl })
    .eq('id', server_id)
    .select()
    .single();
}

type AddServerIconResponse = Awaited<ReturnType<typeof addServerIcon>>;
export type AddServerIconResponseSuccess = AddServerIconResponse['data'];
export type AddServerIconResponseError = AddServerIconResponse['error'];

export async function getAllProfilesForServer(
  supabase: SupabaseClient<Database>,
  server_id: number
) {
  return await supabase
    .rpc('get_server_profiles_for_all_users_in_server', { s_id: server_id })
    .returns<ServerUserProfile>();
}

type GetAllProfilesForServerResponse = Awaited<
  ReturnType<typeof getAllProfilesForServer>
>;
export type GetAllProfilesForServerResponseSuccess =
  GetAllProfilesForServerResponse['data'];
export type GetAllProfilesForServerResponseError =
  GetAllProfilesForServerResponse['error'];

export async function updateServerIcon(
  supabase: SupabaseClient<Database>,
  filePath: string,
  image: any,
  server_id: number
) {
  const { data, error } = await supabase.storage
    .from('servericons')
    .upload(filePath, image, { upsert: true, cacheControl: '1' });

  const publicURL = supabase.storage
    .from('servericons')
    .getPublicUrl(data!.path);

  return await supabase
    .from('servers')
    .update({ image_url: publicURL.data.publicUrl })
    .eq('id', server_id)
    .select()
    .single();
}

type UpdateServerIconResponse = Awaited<ReturnType<typeof updateServerIcon>>;
export type UpdateServerIconResponseSuccess = UpdateServerIconResponse['data'];
export type UpdateServerIconResponseError = UpdateServerIconResponse['error'];
