import { deleteChannel, getChannelById, updateChannel } from '@/services/channels.service';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  let serverId: number, channelId: number;

  // NOTE: While server id is not used in the query, it is used to validate that the user is a member of the server
  // As well as organizing the channels into servers in the URL
  // Speaking of, TODO: AUTHENTICATION
  try {
    serverId = parseInt(req.query.serverId as string);
    channelId = parseInt(req.query.channelId as string);
  }

  catch (err: any) {
    console.error(err);
    return res.status(400).send({ error: 'Invalid server ID' });
  }

  if (method === 'GET') {
    const { data: channel, error } = await getChannelById(channelId);

    if (error) {
      return res.status(400).send({ error });
    }

    return res.status(200).send(channel);
  }

  // Update Channel
  else if (method === 'PUT') {
    const { data: channel, error } = await updateChannel(
      channelId,
      req.body.name,
      req.body.description || null
    );

    if (error) {
      return res.status(400).send({ error });
    }

    return res.status(200).send(channel);
  }

  else if (method === 'DELETE') {
    const { data: channel, error } = await deleteChannel(channelId);

    if (error) {
      return res.status(400).send({ error });
    }

    return res.status(200).send(channel);
  }

  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).json({ message: 'Method not allowed' });
  }
}
