import { getChannelById } from '@/services/channels.service';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  if (method === 'GET') {
    let serverId: number, channelId: number;

    try {
      serverId = parseInt(req.query.serverId as string);
      channelId = parseInt(req.query.channelId as string);
    }

    catch (err: any) {
      console.error(err);
      return res.status(400).send({ error: 'Invalid server ID' });
    }

    // NOTE: While server id is not used in the query, it is used to validate that the user is a member of the server
    // As well as organizing the channels into servers in the URL
    // Speaking of, TODO: AUTHENTICATION
    const { data: channel, error } = await getChannelById(channelId);

    if (error) {
      return res.status(400).send({ error });
    }

    return res.status(200).send(channel);
  }

  else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}
