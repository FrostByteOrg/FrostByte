import { supabase } from '@/lib/supabaseClient';
import { deleteChannel, getChannelsInServer } from './channels.service';

export async function createServer(name: string) {
  const dbResp = await supabase.from('servers').insert({ name }).select().single();

  if (dbResp.error) {
    return dbResp;
  }

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

export async function updateServer(id: number, name: string) {
  return await supabase.from('servers').update({ name }).eq('id', id);
}

type UpdateServerResponse = Awaited<ReturnType<typeof updateServer>>;
export type UpdateServerResponseSuccess = UpdateServerResponse['data'];
export type UpdateServerResponseError = UpdateServerResponse['error'];

export async function deleteServer(id: number) {
  // First things first, we need to delete all channels associated with this server
  const { data: channels, error} = await getChannelsInServer(id);

  if (error) {
    return { data: null, error };
  }

  channels.forEach(async (channel) => {
    await deleteChannel(channel.channel_id);
  });

  // Then we can delete the server itself
  return await supabase.from('servers').delete().eq('id', id);
}

type DeleteServerResponse = Awaited<ReturnType<typeof deleteServer>>;
export type DeleteServerResponseSuccess = DeleteServerResponse['data'];
export type DeleteServerResponseError = DeleteServerResponse['error'];
