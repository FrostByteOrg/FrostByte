import { createServer } from '@/services/server.service';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'POST') {
    const supabaseServerClient = createServerSupabaseClient<Database>({
      req,
      res,
    });
    
    const {
      data: { user }, error: userError
    } = await supabaseServerClient.auth.getUser();

    if (user) {
      const { data: server, error } = await createServer(
        user.id,
        req.body.name,
        req.body.description || null
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
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}
