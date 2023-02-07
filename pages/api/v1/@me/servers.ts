import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { getServersForUser } from '@/services/server.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    // Create authenticated Supabase Client.
    const supabaseServerClient = createServerSupabaseClient({ req, res });

    // Now fetch the user
    const { data: { user }, error: userError } = await supabaseServerClient.auth.getUser();

    // No user, return unauthorized error
    if (!user) {
      console.error(userError);
      return res.status(401).send(userError);
    }

    // Now we can fetch the user's servers
    const { data: servers, error: serversError } = await getServersForUser(user.id);

    // No servers, return empty array
    if (!servers) {
      console.error(serversError);
      return res.status(200).send([]);
    }

    // Return the servers
    return res.status(200).send(servers);
  }

  else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
