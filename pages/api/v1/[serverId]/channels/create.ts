import { createChannel } from '@/services/channels.service';
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

  // NOTE: All operations after this point require appropriate authorization
  if (method === 'POST') {
    await createChannel(
      serverId,
      req.body.name,
      req.body.description || null
    );
  }

  else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}
