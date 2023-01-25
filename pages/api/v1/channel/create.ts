import { createChannel } from '@/services/channels.service';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    // TODO: Require user to have permission to create channels
    await createChannel(
      req.body.serverId,
      req.body.name,
      req.body.description || null
    );
  }
  else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}
