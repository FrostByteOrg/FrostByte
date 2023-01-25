import { supabase } from '@/lib/supabaseClient';
import { InviteExpiry } from '@/types/inviteExpiry';
import { v4 as uuidv4 } from 'uuid';

export async function getInviteByCode(inviteCode: string) {
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
  serverId: number,
  expiresAt: InviteExpiry = 'week',
  numUses: number | null = null,
  urlId: string | null = null
) {
  // Firsly, we need to check if the server exists
  const { data: server, error: serverError } = await supabase
    .from('servers')
    .select('*')
    .eq('id', serverId)
    .single();

  if (serverError) {
    throw serverError;
  }

  // If the urlId is null, we need to generate a random uuid for one
  if (!urlId) {
    urlId = uuidv4();
  }

  return await supabase
    .from('server_invites')
    .insert({
      server_id: serverId,
      expires_at: expiresAt,
      num_uses: numUses,
      url_id: urlId,
    })
    .select()
    .single();
}

type CreateInviteResponse = Awaited<ReturnType<typeof createInvite>>;
export type CreateInviteResponseSuccess = CreateInviteResponse['data'];
export type CreateInviteResponseError = CreateInviteResponse['error'];
