import {
  useToken,
  LiveKitRoom,
  VideoConference,
} from '@livekit/components-react';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';

import {
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  Participant,
  VideoPresets,
} from 'livekit-client';

export default function Channel() {
  const router = useRouter();
  const params =
    typeof window !== 'undefined' ? new URLSearchParams(location.search) : null;

  const userIdentity = useUser();
  console.log(userIdentity?.email);
  console.log(userIdentity?.id);

  const { id: roomRoute } = router.query;

  const roomName: string = roomRoute as string;

  const token = useToken(process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, roomName, {
    userInfo: {
      identity: userIdentity?.id,
      name: userIdentity?.email,
    },
  });

  return (
    <div data-lk-theme='default'>
      <LiveKitRoom
        video={true}
        audio={true}
        token={token}
        serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL}>
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
