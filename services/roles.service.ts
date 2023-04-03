import { Database } from '@/types/database.supabase';
import { Role } from '@/types/dbtypes';
import { ServerPermissions } from '@/types/permissions';
import { SupabaseClient } from '@supabase/supabase-js';

export async function createRole(
  supabase: SupabaseClient<Database>,
  server_id: number,
  name: string,
  position: number,
  permissions: ServerPermissions,
  color: string
) {
  return await supabase
    .from('server_roles')
    .insert({ name, color, server_id, position, permissions })
    .select()
    .single();
}

type CreateRoleResponse = Awaited<ReturnType<typeof createRole>>;
export type CreateRoleResponseSuccess = CreateRoleResponse['data'];
export type CreateRoleResponseError = CreateRoleResponse['error'];

export async function updateRole(
  supabase: SupabaseClient<Database>,
  id: number,
  name: string,
  position: number,
  permissions: ServerPermissions,
  color: string
) {
  return await supabase
    .from('server_roles')
    .update({ name, color, position, permissions })
    .eq('id', id)
    .select()
    .single();
}

type UpdateRoleResponse = Awaited<ReturnType<typeof updateRole>>;
export type UpdateRoleResponseSuccess = UpdateRoleResponse['data'];
export type UpdateRoleResponseError = UpdateRoleResponse['error'];

export async function deleteRole(
  supabase: SupabaseClient<Database>,
  id: number
) {
  return await supabase
    .from('server_roles')
    .delete()
    .eq('id', id)
    .single();
}

type DeleteRoleResponse = Awaited<ReturnType<typeof deleteRole>>;
export type DeleteRoleResponseSuccess = DeleteRoleResponse['data'];
export type DeleteRoleResponseError = DeleteRoleResponse['error'];

export async function getServerRoles(
  supabase: SupabaseClient<Database>,
  server_id: number
) {
  return await supabase
    .from('server_roles')
    .select('*')
    .eq('server_id', server_id);
}

type GetServerRolesResponse = Awaited<ReturnType<typeof getServerRoles>>;
export type GetServerRolesResponseSuccess = GetServerRolesResponse['data'];
export type GetServerRolesResponseError = GetServerRolesResponse['error'];

export async function getRolesFromAllServersUserIsIn(supabase: SupabaseClient<Database>) {
  return await supabase
    .rpc('get_roles_for_servers')
    .returns<Role>();
}

type GetRolesFromAllServersUserIsInResponse = Awaited<ReturnType<typeof getRolesFromAllServersUserIsIn>>;
export type GetRolesFromAllServersUserIsInResponseSuccess = GetRolesFromAllServersUserIsInResponse['data'];
export type GetRolesFromAllServersUserIsInResponseError = GetRolesFromAllServersUserIsInResponse['error'];

// NOTE: The swaps for these two functions are intentional
export async function incrementRolePosition(
  supabase: SupabaseClient<Database>,
  role_id: number
) {
  return await supabase
    .rpc('decrement_role_position', { role_id });
}

type IncrementRolePositionResponse = Awaited<ReturnType<typeof incrementRolePosition>>;
export type IncrementRolePositionResponseSuccess = IncrementRolePositionResponse['data'];
export type IncrementRolePositionResponseError = IncrementRolePositionResponse['error'];

export async function decrementRolePosition(
  supabase: SupabaseClient<Database>,
  role_id: number
) {
  return await supabase
    .rpc('increment_role_position', { role_id });
}

type DecrementRolePositionResponse = Awaited<ReturnType<typeof decrementRolePosition>>;
export type DecrementRolePositionResponseSuccess = DecrementRolePositionResponse['data'];
export type DecrementRolePositionResponseError = DecrementRolePositionResponse['error'];

export async function getHighestRolePositionForUser(
  supabase: SupabaseClient<Database>,
  server_id: number,
  user_id: string
) {
  return await supabase
    .rpc('get_highest_role_position_for_user', { s_id: server_id, p_id: user_id })
    .returns<number>()
    .single();
}
