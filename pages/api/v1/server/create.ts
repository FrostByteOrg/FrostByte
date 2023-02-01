import { createServer } from '@/services/server.service';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    if (!req.cookies.token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    // JWT first segment is the user id encoded in base64
    const userId = Buffer.from(
      req.cookies.token.split('.')[0],
      'base64'
    ).toString('ascii');

    const { data: server, error } = await createServer(
      userId,
      req.body.name,
      req.body.description || null
    );

    if (error) {
      return res.status(400).send({ error });
    }

    return res.status(200).send(server);
  }

  else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}
