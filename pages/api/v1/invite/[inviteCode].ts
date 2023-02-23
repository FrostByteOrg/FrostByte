import { decrementInviteUses, deleteInvite, getInviteByCode } from '@/services/invites.service';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { isUserInServer } from '@/services/server.service';
import { addUserToServer } from '@/services/profile.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    const supabaseServerClient = createServerSupabaseClient({ req, res });

    // TODO: Remove this try catch block and use the error handling supplied by supabase
    try {
      const { data: invite, error } = await getInviteByCode(
        supabaseServerClient,
        req.query.inviteCode as string
      );

      // No invite, do nothing
      if (error) {
        return res.status(400).send(error);
      }

      const { data: { user }, error: userError } = await supabaseServerClient.auth.getUser();

      // No user, do nothing
      if (userError) {
        return res.status(400).send(userError);
      }

      // Make sure the user is not already in the server
      const { data: serverUsers } = await isUserInServer(
        supabaseServerClient,
        user!.id,
        invite!.server_id
      );

      if (serverUsers) {
        return res.status(400).send({ error: 'User is already in the server' });
      }

      // Validate times. If invite is expired, we should remove the invite from the database
      if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        await deleteInvite(supabaseServerClient, invite.id);
        return res.status(410).send({ error: 'Invite link expired.' });
      }

      // NOTE: We make an assumption that the uses remaining can never be 0 as an invite is deleted from the table
      // As soon as it is our of uses. Therefore the following condition serves as a nullcheck ONLY
      if (invite.uses_remaining) {
        // Update the uses remaining
        // If this server invite will run out of uses here, we'll silently expire it
        if (invite.uses_remaining - 1 === 0) {
          deleteInvite(supabaseServerClient, invite.id);
        }

        else {
          decrementInviteUses(supabaseServerClient, invite);
        }
      }

      // Add the user to the server
      await addUserToServer(
        supabaseServerClient,
        user!.id,
        invite!.server_id
      );

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
