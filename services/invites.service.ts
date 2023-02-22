import { addDate } from '@/lib/dateManagement';
import { InviteExpiry } from '@/types/inviteExpiry';
import { SupabaseClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

export async function getInviteByCode(supabase: SupabaseClient, inviteCode: string) {
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
  supabase: SupabaseClient,
  serverId: number,
  expiresAt: InviteExpiry = '1 week',
  numUses: number | null = null,
  urlId: string | null = null
) {
  // Firsly, we need to check if the server exists
  const { data: server, error } = await supabase
    .from('servers')
    .select('*')
    .eq('id', serverId)
    .single();

  if (error) {
    throw error;
  }

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

  // If the urlId is null, we need to generate a random uuid for one
  if (!urlId) {
    urlId = uuidv4();
  }

  // If it isn't, however, we also need to make sure it is unique
  else {
    const { data: existingInvite } = await supabase
      .from('server_invites')
      .select('*')
      .eq('url_id', urlId)
      .single();

    if (existingInvite) {
      throw new Error('Invite code already exists!');
    }
  }

  return await supabase
    .from('server_invites')
    .insert({
      server_id: serverId,
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
