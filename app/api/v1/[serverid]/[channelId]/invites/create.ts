import { createInvite } from '@/services/invites.service';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  let serverId: number;
  let channelId: number;

  try {
    serverId = parseInt(req.query.serverId as string);
    channelId = parseInt(req.query.channelId as string);
  }

  catch (err: any) {
    return res.status(400).send({ error: 'Invalid server ID' });
  }

  const supabaseServerClient = createServerSupabaseClient({ req, res });

  if (method === 'POST') {
    const { data: invite, error } = await createInvite(
      supabaseServerClient,
      serverId,
      channelId,
      req.body.expiresAt,
      req.body.numUses,
      req.body.urlId
    );

    if (error) {
      return res.status(400).json({ error });
    }

    return res.status(200).json({ invite });
  }

  else {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
