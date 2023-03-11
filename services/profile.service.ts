import { Database } from '@/types/database.supabase';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function getProfiles(supabase: SupabaseClient<Database>) {
  return await supabase.from('profiles').select('id, username');
}

type ProfilesResponse = Awaited<ReturnType<typeof getProfiles>>;
export type ProfilesResponseSuccess = ProfilesResponse['data'];
export type ProfilesResponseError = ProfilesResponse['error'];

export async function getProfile(supabase: SupabaseClient<Database>, id: string) {
  return await supabase
    .from('profiles')
    .select()
    .eq('id', id)
    .single();
}

type ProfileResponse = Awaited<ReturnType<typeof getProfile>>;
export type ProfileResponseSeccess = ProfileResponse['data']
export type ProfileResponseError = ProfileResponse['error']

export async function updateUserProfile(
  supabase: SupabaseClient<Database>,
  id: string,
  full_name: string,
  avatar_url: string,
  website: string,
) {
  return await supabase
    .from('profiles')
    .update({
      full_name,
      avatar_url,
      website
    })
    .eq('id', id)
    .select('*')
    .single();
}

type UpdateUserProfileResponse = Awaited<ReturnType<typeof updateUserProfile>>;
export type UpdateUserProfileResponseSuccess = UpdateUserProfileResponse['data'];
export type UpdateUserProfileResponseError = UpdateUserProfileResponse['error'];

export async function addUserToServer(
  supabase: SupabaseClient<Database>,
  serverId: number,
) {
  return await supabase
    .from('server_users')
    .insert({
      profile_id: (await supabase.auth.getUser()).data.user!.id,
      server_id: serverId,
    })
    .select('*')
    .single();
}

type AddUserToServerResponse = Awaited<ReturnType<typeof addUserToServer>>;
export type AddUserToServerResponseSuccess = AddUserToServerResponse['data'];
export type AddUserToServerResponseError = AddUserToServerResponse['error'];
