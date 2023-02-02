import { supabase } from '@/lib/supabaseClient';
import { deleteChannel, getChannelsInServer } from './channels.service';

export async function createServer(owner_id: string, name: string, description: string | null) {
  const dbResp = await supabase.from('servers').insert({ name, description }).select().single();

  if (dbResp.error) {
    return dbResp;
  }

  // Let's add the owner to the server
  await supabase
    .from('server_users')
    .insert({ profile_id: owner_id, server_id: dbResp.data.id, is_owner: true });

  // Now that we have a server, we need to create a default channel for it
  await supabase
    .from('channels')
    .insert({ name: 'general', server_id: dbResp.data.id });

  return dbResp;
}

type CreateServerResponse = Awaited<ReturnType<typeof createServer>>;
export type CreateServerResponseSuccess = CreateServerResponse['data'];
export type CreateServerResponseError = CreateServerResponse['error'];

export async function getServers() {
  return await supabase.from('servers').select('*');
}

type GetServersResponse = Awaited<ReturnType<typeof getServers>>;
export type GetServersResponseSuccess = GetServersResponse['data'];
export type GetServersResponseError = GetServersResponse['error'];

export async function getServer(id: number) {
  return await supabase.from('servers').select('*').eq('id', id);
}

type GetServerResponse = Awaited<ReturnType<typeof getServer>>;
export type GetServerResponseSuccess = GetServerResponse['data'];
export type GetServerResponseError = GetServerResponse['error'];

export async function updateServer(id: number, name: string, description: string | null) {
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

export async function deleteServer(owner_id: string, id: number) {
  // NOTE: only the owner should be able to delete a server
  const { data: serverUser, error } = await supabase
    .from('server_users')
    .select('*')
    .eq('profile_id', owner_id)
    .eq('server_id', id)
    .single();

  if (error) {
    return { data: null, error };
  }

  if (!serverUser.is_owner) {
    return { data: null, error: { message: 'Only the owner can delete a server' } };
  }

  // NOTE: Supabase has been set up to cascade delete all items related to a server (roles/invites/channels/messages)
  // So we can delete the server itself
  return await supabase.from('servers').delete().eq('id', id);
}

type DeleteServerResponse = Awaited<ReturnType<typeof deleteServer>>;
export type DeleteServerResponseSuccess = DeleteServerResponse['data'];
export type DeleteServerResponseError = DeleteServerResponse['error'];
