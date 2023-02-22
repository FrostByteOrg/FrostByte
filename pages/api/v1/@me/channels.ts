import { getAllChannelsForUser } from '@/services/channels.service';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse)  {
  // Create authenticated Supabase Client.
  const supabaseServerClient = createServerSupabaseClient({ req, res });

  // Now fetch the user
  const { data: { user }, error: userError } = await supabaseServerClient.auth.getUser();

  // No user, return unauthorized error
  if (!user) {
    console.error(userError);
    return res.status(401).send(userError);
  }

  const { data, error } = await getAllChannelsForUser(
    supabaseServerClient,
    user.id
  );

  if (error) {
    res.status(500).json({ error: error.message });
  }

  else {
    res.status(200).json(data);
  }
}
