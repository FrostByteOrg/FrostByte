import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { getProfile, updateUserProfile } from '@/services/profile.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  // Create authenticated Supabase Client.
  const supabaseServerClient = createServerSupabaseClient({ req, res });

  // Now fetch the user
  const { data: { user }, error: userError } = await supabaseServerClient.auth.getUser();

  // No user, return unauthorized error
  if (!user) {
    console.error(userError);
    return res.status(401).send(userError);
  }

  if (method === 'GET') {
    // Fetch user profile
    const { data: profile, error } = await getProfile(
      supabaseServerClient,
      user.id
    );

    // No profile, return not found error
    if (!profile) {
      res.status(404).send(error);
    }

    // Return the profile
    return res.status(200).send(profile);
  }

  // PUT request
  else if (method === 'PUT') {
    const { data: profile, error } = await updateUserProfile(
      supabaseServerClient,
      user.id,
      req.body.full_name,
      req.body.avatar_url || null,
      req.body.website || null,
    );

    if (error) {
      console.error(error);
      return res.status(400).send({ error });
    }

    return res.status(200).send(profile);
  }

  else {
    res.setHeader('Allow', ['GET', 'PUT']);
    return res.status(405).end(`Method ${method} Not Allowed`);
  }
}
