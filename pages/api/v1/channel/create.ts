import { supabase } from '@/lib/supabaseClient';
import { createChannel } from '@/services/channels.service';
import { getInviteByCode } from '@/services/invites.service';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    await createChannel(
      req.body.serverId,
      req.body.name,
      req.body.description || null
    );
  }
}
