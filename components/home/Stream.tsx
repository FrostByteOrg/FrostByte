import {
  useToken,
  LiveKitRoom,
  RoomAudioRenderer,
  MediaTrack,
  GridLayout,
  ParticipantLoop,
  ParticipantTile,
  useParticipantContext,
  useIsSpeaking,
  TrackToggle,
  ParticipantContext
} from '@livekit/components-react';
import { useUser } from '@supabase/auth-helpers-react';

import { Track } from 'livekit-client';
import { useChatNameValue } from '@/context/ChatCtx';
import { useEffect, useMemo, useState } from 'react';

export default function Stream() {

  const userName = useUser();
  const userID = useUser();
  console.log(userID?.id);
  const channelId = useChatNameValue();

  const [tryConnect, setTryConnect] = useState(true);
  const [connected, setConnected] = useState(true);

  const token = useToken(process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, channelId.toString(), {
    userInfo: {
      identity: userID?.id,
      name: userName?.email
    },
  });

  return (
    <div className={'bg-gray-800'}>
      <div className='flex flex-row justify-center'>
        <LiveKitRoom
          video={false}
          audio={true}
          screen={false}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL}
          connect={tryConnect}
          onConnected={() => setConnected(true)}
          onDisconnected={() => { 
            setTryConnect(false);
            setConnected(false);
          }}
          className='flex flex-col w-full justify-center'
        >
          <RoomAudioRenderer/>
          <div className='ml-13 flex flex-row'>
            <ParticipantLoop>
              <ParticipantTile className={'w-11 mb-5 mr-4'}>
                <MediaTrack source={Track.Source.Camera} className={'rounded-xl mb-4'}/>
                <MediaTrack source={Track.Source.ScreenShare} className={'rounded-xl'}/>
                <MediaTrack source={Track.Source.Microphone}/>
              </ParticipantTile>
            </ParticipantLoop>
          </div>
          <div className='flex flex-row justify-evenly'>
            <TrackToggle showIcon={false} className={'w-7 h-7 bg-grey-900 rounded-lg text-lg'} source={Track.Source.Microphone}> 
              Mic
            </TrackToggle> 
            <TrackToggle className={'w-7 h-7'} source={Track.Source.Camera}/>
            <TrackToggle className={'w-7 h-7'} source={Track.Source.ScreenShare}/>
          </div>
        </LiveKitRoom>
      </div>
    </div>
  );
};
