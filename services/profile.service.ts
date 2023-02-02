import { supabase } from '@/lib/supabaseClient';

export async function getProfiles() {
  return await supabase.from('profiles').select('id, username');
}

type ProfilesResponse = Awaited<ReturnType<typeof getProfiles>>;
export type ProfilesResponseSuccess = ProfilesResponse['data'];
export type ProfilesResponseError = ProfilesResponse['error'];

export async function getProfile(id: string) {
  return await supabase.from('profiles').select().eq('id',id).single();
}

type ProfileResponse = Awaited<ReturnType<typeof getProfile>>;
export type ProfileResponseSeccess = ProfileResponse['data']
export type ProfileResponseError = ProfileResponse['error']
