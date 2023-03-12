import {
  useToken,
  LiveKitRoom,
  VideoConference,
} from '@livekit/components-react';
import { useUser } from '@supabase/auth-helpers-react';

import {
  Room,
  RoomEvent,
  RemoteParticipant,
  RemoteTrackPublication,
  RemoteTrack,
  Participant,
  VideoPresets,
} from 'livekit-client';
import { useChannelIdValue, useChatNameValue } from '@/context/ChatCtx';
import { supabase } from '@supabase/auth-ui-react/dist/esm/common/theming';

export default function Stream() {

  const userName = '123';
  const userID = useUser();
  console.log(userName);
  console.log(userID?.id);
  const channelId = useChatNameValue();

  const token = useToken(process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, channelId.toString(), {
    userInfo: {
      identity: userID?.id,
      name: userName,
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
