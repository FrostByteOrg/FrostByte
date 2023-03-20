import {
  useToken,
  ParticipantLoop,
  ParticipantTile,
  TrackToggle,
  DisconnectButton,
  VideoTrack,
  AudioTrack,
  ParticipantName,
} from '@livekit/components-react';
import { useUser } from '@supabase/auth-helpers-react';

import { Track } from 'livekit-client';
import { useChannel } from '@/lib/store';

import { useSetToken } from '@/lib/store';

export default function Stream() {

  const userName = useUser();
  const userID = useUser();
  const channel = useChannel();
  const setToken = useSetToken();

  const token = useToken(process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, channel!.channel_id.toString(), {
    userInfo: {
      identity: userID?.id,
      name: userName?.email
    },
  });

  setToken(token);

  return (
    <div className={'bg-gray-800 h-full w-full items-center'}>
      <div className='flex flex-col'>
        <div className='flex flex-row justify-center'>
          <ParticipantLoop>
            <ParticipantTile className={'w-12 mb-5 mr-4 mt-5'}>
              <div className={''}>
                <VideoTrack source={Track.Source.Camera} className={'rounded-xl mx-2'} />
                <VideoTrack source={Track.Source.ScreenShare} className={'rounded-xl'}/>
              </div>
              <AudioTrack source={Track.Source.Microphone}/>
              <ParticipantName />
            </ParticipantTile>
          </ParticipantLoop>
        </div>
        <div className='flex flex-row justify-evenly mx-auto mb-5 w-1/3 bg-grey-950 py-3 items-center rounded-xl'>
          <TrackToggle showIcon={false} className={'w-7 h-7 bg-grey-900 rounded-lg text-lg'} source={Track.Source.Microphone} initialState={false}>
              Mic
          </TrackToggle> 
          <TrackToggle className={'w-7 h-7'} source={Track.Source.Camera}/>
          <TrackToggle className={'w-7 h-7'} source={Track.Source.ScreenShare} initialState={false}/>
          <DisconnectButton className={'w-7 h-7 bg-red-600 rounded-lg font-bold text-xl'}> End </DisconnectButton> 
        </div>
      </div>
    </div>
  );
};
