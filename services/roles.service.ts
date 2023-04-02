import { Database } from '@/types/database.supabase';
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
    .from('roles')
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
    .from('roles')
    .update({ name, color, position, permissions })
    .eq('id', id)
    .select()
    .single();
}
