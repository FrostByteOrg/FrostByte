import { deleteServer, getServer, updateServer } from '@/services/server.service';
import jwt, { JwtPayload } from 'jsonwebtoken';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  let serverId: number;

  // Speaking of, TODO: AUTHORIZATIONS
  try {
    serverId = parseInt(req.query.serverId as string);
  }

  catch (err: any) {
    console.error(err);
    return res.status(400).send({ error: 'Invalid server ID' });
  }

  if (method === 'GET') {
    const { data: server, error } = await getServer(serverId);

    if (error) {
      return res.status(400).send({ error });
    }

    return res.status(200).send(server);
  }

  else if (method === 'PUT') {
    const { data: server, error } = await updateServer(
      serverId,
      req.body.name,
      req.body.description || null
    );

    if (error) {
      return res.status(400).send({ error });
    }

    return res.status(200).send(server);
  }

  else if (method === 'DELETE') {
    // NOTE: auth header cannot be null here as it passes through the auth middleware
    const decodedJwt = jwt.decode(req.headers.authorization!.replace('Bearer ', '')) as JwtPayload;

    const { data: server, error } = await deleteServer(
      decodedJwt.sub!,
      serverId
    );

    if (error) {
      return res.status(400).send({ error });
    }

    return res.status(200).send(server);
  }

  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}
