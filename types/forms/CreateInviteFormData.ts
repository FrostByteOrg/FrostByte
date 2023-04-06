import { InviteExpiry } from '@/types/inviteExpiry';

export interface CreateInviteFormInput {
  numUses: string | null;
  expiresAt: InviteExpiry;
}
