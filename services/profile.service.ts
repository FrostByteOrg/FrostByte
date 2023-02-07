import { supabase } from '@/lib/supabaseClient';

export async function getProfiles() {
  return await supabase.from('profiles').select('id, username');
}

type ProfilesResponse = Awaited<ReturnType<typeof getProfiles>>;
export type ProfilesResponseSuccess = ProfilesResponse['data'];
export type ProfilesResponseError = ProfilesResponse['error'];

export async function getUserProfile(id: string) {
  return await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
}

type UserProfileResponse = Awaited<ReturnType<typeof getUserProfile>>;
export type UserProfileResponseSuccess = UserProfileResponse['data'];
export type UserProfileResponseError = UserProfileResponse['error'];

export async function updateUserProfile(
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
