import { createInvite } from '@/services/invites.service';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    createInvite(
      req.body.serverId,
      req.body.expiresAt,
      req.body.numUses,
      req.body.urlId
    )
      .then((response) => {
        if (response.error) {
          return res.status(400).json({ error: response.error.message });
        }
        else {
          return res.status(200).json({ invite: response.data });
        }
      });
  }
  else {
    res.setHeader('Allow', 'POST');
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
