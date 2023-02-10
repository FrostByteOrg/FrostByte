// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getMessagesInChannelWithUser } from '@/services/message.service';



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const messages = await getMessagesInChannelWithUser(13);
  console.log(messages);
  res.status(200).json({ name: messages });
}
