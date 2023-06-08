import { NextApiRequest, NextApiResponse } from 'next';
import { AccessToken } from 'livekit-server-sdk';
import type { AccessTokenOptions, VideoGrant } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

const apiKey = process.env.LK_API_KEY;
const apiSecret = process.env.LK_API_SECRET;

const createToken = (userInfo: AccessTokenOptions, grant: VideoGrant) => {
  const at = new AccessToken(apiKey, apiSecret, userInfo);
  at.addGrant(grant);
  return at.toJwt();
};

export async function GET(req: Request, res: NextApiResponse) {
  const { searchParams } = new URL(req.url);
  const identity = searchParams.get('identity');
  const roomName = searchParams.get('roomName');
  const name = searchParams.get('name');

  if (typeof identity !== 'string') {
    throw Error('Provide one identity');
  }
  if (typeof roomName !== 'string') {
    throw Error('Provide on Roomname');
  }
  if (typeof name !== 'string') {
    throw Error('Provide on Roomname');
  }

  if (Array.isArray(name)) {
    throw Error('Provide a name');
  }

  const grant: VideoGrant = {
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
  };

  try {
    const token = createToken({ identity, name }, grant);
    console.log(token);
    return NextResponse.json({ identity, accessToken: token });
  }
  catch (e) {
    res.statusMessage = (e as Error).message;
    console.log(e);
    return NextResponse.error();
  }
}
