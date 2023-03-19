import {
  useToken,
  LiveKitRoom,
  RoomAudioRenderer,
  ParticipantLoop,
  ParticipantTile,
  TrackToggle,
  DisconnectButton,
  VideoTrack,
  AudioTrack,
} from '@livekit/components-react';
import { useUser } from '@supabase/auth-helpers-react';

import { Track, Participant } from 'livekit-client';
import { useChatNameValue } from '@/context/ChatCtx';
import { useEffect, useMemo, useState } from 'react';

export default function Stream() {

  const userName = useUser();
  const userID = useUser();
  console.log(userID?.id);
  const channelId = useChatNameValue();

  const [tryConnect, setTryConnect] = useState(true);
  const [connected, setConnected] = useState(true);

  return (
    <div className={'bg-gray-800'}>
      <div className='flex flex-row'>
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
          className='flex flex-col w-full' 
        >
          <RoomAudioRenderer/>
          <div className='flex flex-row justify-center'>
            <ParticipantLoop>
              <ParticipantTile className={'w-12 mb-5 mr-4 mt-5'}>
                <div className={''}>
                  <VideoTrack source={Track.Source.Camera} className={'rounded-xl mx-2'}/>
                  <VideoTrack source={Track.Source.ScreenShare} className={'rounded-xl'}/>
                </div>
                <AudioTrack source={Track.Source.Microphone}/>
              </ParticipantTile>
            </ParticipantLoop>
          </div>
          <div className='flex flex-row justify-evenly mx-auto mb-5 w-1/3 bg-grey-950 py-3 items-center rounded-xl'>
            <TrackToggle showIcon={false} className={'w-7 h-7 bg-grey-900 rounded-lg text-lg'} source={Track.Source.Microphone}>
              Mic
            </TrackToggle> 
            <TrackToggle className={'w-7 h-7'} source={Track.Source.Camera}/>
            <TrackToggle className={'w-7 h-7'} source={Track.Source.ScreenShare} captureOptions={{audio: true}} initialState={false}/>
            <DisconnectButton className={'w-7 h-7 bg-red-600 rounded-lg font-bold text-xl'}> End </DisconnectButton> 
          </div>
        </LiveKitRoom>
      </div>
    </div>
  );
};
