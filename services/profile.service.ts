import { Database } from '@/types/database.supabase';
import { MessageWithServerProfile, ServerUserProfile } from '@/types/dbtypes';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function getProfiles(supabase: SupabaseClient<Database>) {
  return await supabase.from('profiles').select('id, username');
}

type ProfilesResponse = Awaited<ReturnType<typeof getProfiles>>;
export type ProfilesResponseSuccess = ProfilesResponse['data'];
export type ProfilesResponseError = ProfilesResponse['error'];

export async function getProfile(supabase: SupabaseClient<Database>, id: string | undefined) {
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
  website: string | null,
) {
  return await supabase
    .from('profiles')
    .update({
      full_name,
      website,
    })
    .eq('id', id)
    .select('*')
    .single();
}

type UpdateUserProfileResponse = Awaited<ReturnType<typeof updateUserProfile>>;
export type UpdateUserProfileResponseSuccess = UpdateUserProfileResponse['data'];
export type UpdateUserProfileResponseError = UpdateUserProfileResponse['error'];

export async function updateUserAvatar(
  supabase: SupabaseClient<Database>,
  filePath: string,
  image: any,
  id: string
){
  const {data, error} = await supabase.storage
    .from('avatars')
    .upload(filePath, image, {cacheControl: '0',upsert: true});

  const publicURL = supabase.storage.from('avatars').getPublicUrl(filePath);

  return await supabase
    .from('profiles')
    .update({avatar_url: publicURL.data.publicUrl})
    .eq('id', id)
    .single();
}

type UpdateUserAvatarResponse = Awaited<ReturnType<typeof updateUserAvatar>>;
export type UpdateUserAvatarResponseSuccess = UpdateUserAvatarResponse['data'];
export type UpdateUserAvatarResponseError = UpdateUserAvatarResponse['error'];

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

export async function getUserProfileAndServerUserProps(supabase: SupabaseClient<Database>, userId: string, serverId: number) {
  return await supabase
    .from('profiles')
    .select('*, server_users(*)')
    .eq('id', userId)
    .eq('server_users.server_id', serverId)
    .returns<ServerUserProfile>()
    .single();
}

type GetUserProfileAndServerUserPropsResponse = Awaited<ReturnType<typeof getUserProfileAndServerUserProps>>;
export type GetUserProfileAndServerUserPropsResponseSuccess = GetUserProfileAndServerUserPropsResponse['data'];
export type GetUserProfileAndServerUserPropsResponseError = GetUserProfileAndServerUserPropsResponse['error'];

export async function getServerProfileForUser(supabase: SupabaseClient<Database>, userId: string, serverId: number) {
  return await supabase
    .rpc('get_server_profile_for_user', {
      p_id: userId,
      s_id: serverId,
    })
    .returns<ServerUserProfile>()
    .single();
}

type GetServerProfileForUserResponse = Awaited<ReturnType<typeof getServerProfileForUser>>;
export type GetServerProfileForUserResponseSuccess = GetServerProfileForUserResponse['data'];
export type GetServerProfileForUserResponseError = GetServerProfileForUserResponse['error'];

export async function getMessageWithServerProfile(supabase: SupabaseClient<Database>, messageId: number) {
  const data = await supabase
    .rpc('get_message_with_server_profile', {
      m_id: messageId,
    })
    .returns<MessageWithServerProfile>()
    .single();

  return data;
}

type GetMessageWithServerProfileResponse = Awaited<ReturnType<typeof getMessageWithServerProfile>>;
export type GetMessageWithServerProfileResponseSuccess = GetMessageWithServerProfileResponse['data'];
export type GetMessageWithServerProfileResponseError = GetMessageWithServerProfileResponse['error'];

export async function getServerProfileForUserByServerUser(supabase: SupabaseClient<Database>, serverUserId: number) {
  return await supabase
    .rpc('get_server_profile_for_user_by_server_user', {
      su_id: serverUserId,
    })
    .returns<ServerUserProfile>()
    .single();
}

type GetServerProfileForUserByServerUserResponse = Awaited<ReturnType<typeof getServerProfileForUserByServerUser>>;
export type GetServerProfileForUserByServerUserResponseSuccess = GetServerProfileForUserByServerUserResponse['data'];
export type GetServerProfileForUserByServerUserResponseError = GetServerProfileForUserByServerUserResponse['error'];
