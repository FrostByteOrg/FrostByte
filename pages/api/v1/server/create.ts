import { createServer } from '@/services/server.service';
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt, { JwtPayload } from 'jsonwebtoken';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    // NOTE: auth header cannot be null here as it passes through the auth middleware
    const decodedJwt = jwt.decode(req.headers.authorization!.replace('Bearer', '')) as JwtPayload;

    const { data: server, error } = await createServer(
      decodedJwt.sub!,
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
