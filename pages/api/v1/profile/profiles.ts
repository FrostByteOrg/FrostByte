import type { NextApiRequest, NextApiResponse } from 'next';
import {
  getProfiles,
  ProfilesResponseError,
  ProfilesResponseSuccess,
} from '@/services/profile.service';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;

  if (method === 'GET') {
    try {
      const {
        data: profiles,
        error,
      }: { data: ProfilesResponseSuccess; error: ProfilesResponseError } =
        await getProfiles();

      if (error) res.status(409).json({ error });

      return res.status(200).json(profiles);
    }
    catch (error: any) {
      console.log(error);
      res.status(409).json({ error });
    }
  }
  else {
    res.setHeader('Allow', 'GET');
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
