import { addDate } from '@/lib/dateManagement';
import { Database } from '@/types/database.supabase';
import { Invite, ServerInvite } from '@/types/dbtypes';
import { InviteExpiry } from '@/types/inviteExpiry';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';

export async function getInviteByCode(supabase: SupabaseClient<Database>, inviteCode: string) {
  return await supabase
    .from('server_invites')
    .select('*')
    .eq('url_id', inviteCode)
    .single();
}

type InviteByCodeResponse = Awaited<ReturnType<typeof getInviteByCode>>;
export type InviteByCodeResponseSuccess = InviteByCodeResponse['data'];
export type InviteByCodeResponseError = InviteByCodeResponse['error'];

export async function createInvite(
  supabase: SupabaseClient<Database>,
  serverId: number,
  channelId: number,
  expiresAt: InviteExpiry | null = '1 week',
  numUses: number | null = null,
  urlId: string | undefined = undefined
) {
  // We also need to parse the expiry time
  let parsedExpiresAt = null;

  switch (expiresAt) {
    case '1 week':
      parsedExpiresAt = addDate(new Date(), 1);
      break;
    case '1 day':
      parsedExpiresAt = addDate(new Date(), 0, 1);
      break;
    case '1 hour':
      parsedExpiresAt = addDate(new Date(), 0, 0, 1);
      break;
    case '30 minutes':
      parsedExpiresAt = addDate(new Date(), 0, 0, 0, 30);
      break;
    default:
      // We'll treat invalid values as simply null
      parsedExpiresAt = null;
  }

  return await supabase
    .from('server_invites')
    .insert({
      server_id: serverId,
      channel_id: channelId,
      uses_remaining: numUses,
      expires_at: parsedExpiresAt?.toISOString() || null,
      url_id: urlId,
    })
    .select()
    .single();
}

type CreateInviteResponse = Awaited<ReturnType<typeof createInvite>>;
export type CreateInviteResponseSuccess = CreateInviteResponse['data'];
export type CreateInviteResponseError = CreateInviteResponse['error'];

export async function deleteInvite(supabase: SupabaseClient<Database>, inviteId: number) {
  return await supabase
    .from('server_invites')
    .delete()
    .eq('id', inviteId)
    .select()
    .single();
}

type DeleteInviteResponse = Awaited<ReturnType<typeof deleteInvite>>;
export type DeleteInviteResponseSuccess = DeleteInviteResponse['data'];
export type DeleteInviteResponseError = DeleteInviteResponse['error'];

export async function decrementInviteUses(supabase: SupabaseClient<Database>, invite: Invite) {
  return await supabase
    .from('server_invites')
    .update({ uses_remaining: invite.uses_remaining! - 1 })
    .eq('id', invite.id)
    .select()
    .single();
}

type DecrementInviteUsesResponse = Awaited<ReturnType<typeof decrementInviteUses>>;
export type DecrementInviteUsesResponseSuccess = DecrementInviteUsesResponse['data'];
export type DecrementInviteUsesResponseError = DecrementInviteUsesResponse['error'];

export async function getInviteAndServer(
  supabase: SupabaseClient<Database>,
  inviteCode: string
) {
  return await supabase
    .from('server_invites')
    .select('*, servers(*)')
    .eq('url_id', inviteCode)
    .returns<ServerInvite>()
    .single();
}

type GetInviteAndServerResponse = Awaited<ReturnType<typeof getInviteAndServer>>;
export type GetInviteAndServerResponseSuccess = GetInviteAndServerResponse['data'];
export type GetInviteAndServerResponseError = GetInviteAndServerResponse['error'];

export async function getInvitesForServer(
  supabase: SupabaseClient<Database>,
  serverId: number
) {
  return await supabase
    .from('server_invites')
    .select('*')
    .eq('server_id', serverId);
}

type GetInvitesForServerResponse = Awaited<ReturnType<typeof getInvitesForServer>>;
export type GetInvitesForServerResponseSuccess = GetInvitesForServerResponse['data'];
export type GetInvitesForServerResponseError = GetInvitesForServerResponse['error'];
