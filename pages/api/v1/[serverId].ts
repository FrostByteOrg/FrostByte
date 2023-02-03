import { deleteServer, getServer, updateServer } from '@/services/server.service';
import { Database } from '@/types/database.supabase';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
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
  const supabaseServerClient = createServerSupabaseClient<Database>({
    req,
    res,
  });
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
    const {
      data: { user }, error: userError
    } = await supabaseServerClient.auth.getUser();

    if (user) {
      const { data: server, error } = await deleteServer(
        user.id,
        serverId
      );

      if (error) {
        return res.status(400).send({ error });
      }
  
      return res.status(200).send(server);
    }

    if (userError) {
      return res.status(400).send({ userError });
    }

    return res.status(400).json({ message: 'Invalid request' });
  }

  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}
