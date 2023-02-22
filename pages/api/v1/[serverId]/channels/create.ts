import { createChannel } from '@/services/channels.service';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // TODO: Require user to have permission to manage channels
  let serverId: number;

  try {
    serverId = parseInt(req.query.serverId as string);
  }

  catch (err: any) {
    return res.status(400).send({ error: 'Invalid server ID' });
  }

  const supabaseServerClient = createServerSupabaseClient({ req, res });

  // NOTE: All operations after this point require appropriate authorization
  if (method === 'POST') {
    const { data: channel, error } = await createChannel(
      supabaseServerClient,
      serverId,
      req.body.name,
      req.body.description || null
    );

    if (error) {
      return res.status(400).send({ error });
    }

    return res.status(200).send({ channel });
  }

  else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}
