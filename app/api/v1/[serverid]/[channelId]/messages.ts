import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { isUserInServer } from '@/services/server.service';
import { getMessagesInChannelWithUser } from '@/services/message.service';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    let serverId: number;
    let channelId: number;

    try {
      serverId = parseInt(req.query.serverId as string);
      channelId = parseInt(req.query.channelId as string);
    }

    catch (err: any) {
      console.error(err);
      return res.status(400).send({ error: 'Invalid server/channel ID' });
    }

    // Get user obj and make sure they actually have access to this server
    const supabaseServerClient = createServerSupabaseClient({ req, res });

    const { data: { user }, error: userError } = await supabaseServerClient.auth.getUser();

    if (!user) {
      return res.status(500).json({ error: userError });
    }

    const { data: userInServer } = await isUserInServer(
      supabaseServerClient,
      user.id,
      serverId
    );

    if (!userInServer) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const { page, size } = req.query;

    // Get messages from this channel
    const { data: messages, error } = await getMessagesInChannelWithUser(
      supabaseServerClient,
      channelId,
      parseInt(page as string) || 0,
      parseInt(size as string) || 50
    );

    // If no messages, return empty array
    if (!messages) {
      return res.status(200).json({ messages: [], error });
    }

    return res.status(200).json({ messages });
  }

  else {
    res.setHeader('Allow', 'GET');
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
