import { supabase } from '@/lib/supabaseClient';
import { getInviteByCode } from '@/services/invites.service';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    const supabaseServerClient = createServerSupabaseClient({ req, res });

    // TODO: Remove this try catch block and use the error handling supplied by supabase
    try {
      const { data: invite, error } = await getInviteByCode(req.query.inviteCode as string);

      // No invite, do nothing
      if (error) {
        return res.status(400).send(error);
      }

      const { data: { user }, error: userError } = await supabaseServerClient.auth.getUser();

      // No user, do nothing
      if (userError) {
        return res.status(400).send(userError);
      }

      // Validate times. If invite is expired, we should remove the invite from the database
      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        await supabase
          .from('server_invites')
          .delete()
          .eq('id', invite.id);

        return res.status(410).send({ error: 'Invite link expired.' });
      }

      // NOTE: We make an assumption that the uses remaining can never be 0 as an invite is deleted from the table
      // As soon as it is our of uses. Therefore the following condition serves as a nullcheck ONLY
      if (invite.uses_remaining) {
        if (invite.uses_remaining - 1 === 0) {
          await supabase
            .from('server_invites')
            .delete()
            .eq('id', invite.id);

          return res.status(410).send({ error: 'Invite link expired.'});
        }

        // Update the uses remaining
        else {
          await supabase
            .from('server_invites')
            .update({ uses_remaining: invite.uses_remaining - 1 })
            .eq('id', invite.id);
        }
      }

      // Add the user to the server
      await supabase
        .from('server_users')
        .insert({
          server_id: invite.server_id,
          profile_id: user!.id,
        });

      return res.status(200).send({ message: 'Joined successfully' });
    }

    catch (err: any) {
      console.error(err);
      return res.status(err.status).send({message: err.message});
    }
  }
  else {
    res.setHeader('Allow', 'GET');
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
