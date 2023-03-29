import { useChannel, useSetConnectionState, useSetCurrentRoom, useSetToken, useUserRef} from '@/lib/store';
import styles from '@/styles/Chat.module.css';
import mediaControls from '@/styles/Components.module.css';
import { ChannelMediaIcon } from '../icons/ChannelMediaIcon';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useUser } from '@supabase/auth-helpers-react';
import { AudioTrack, DisconnectButton, ParticipantLoop, ParticipantName, ParticipantTile, TrackToggle, VideoTrack, useConnectionState, useLocalParticipant,useParticipantContext,useParticipants,useRemoteParticipant,useRemoteParticipants,useToken, useTracks } from '@livekit/components-react';
import { Track, ConnectionState, Participant, ParticipantEvent} from 'livekit-client';
import { User } from '@/types/dbtypes';
import { BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { TbScreenShare, TbScreenShareOff } from 'react-icons/tb';
import UserIcon from '../icons/UserIcon';
import { useEffect, useState } from 'react';

export default function MediaChat() {

  const channel = useChannel();
  const userID : User | any = useUser();
  const user = useUserRef();
  const setToken = useSetToken();
  const videoTrack = useLocalParticipant();
  const videoStatus = Track.Kind.Video;
  const screenTrack = useLocalParticipant();
  const setConnectionState = useSetConnectionState();
  const connectionState = useConnectionState();
  
  const [displayVideo, setDisplayVideo] = useState(false);

  const token = useToken(process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, channel!.channel_id.toString(), {
    userInfo: {
      identity: userID.id,
      name: user?.username
    },
  });

  return (
    <>
      <div className={`${styles.chatHeader} px-5 pt-5 mb-3`}>
        <div className='flex items-center'>
          <div className='mr-2'>
            {channel && channel.is_media ? (
              <ChannelMediaIcon />
            ) : (
              <ChannelMessageIcon size="5" />
            )}
          </div>
          <h1 className='text-3xl font-semibold tracking-wide'>
            {channel ? channel.name : ''}
          </h1>
        </div>
      </div>
      <div className="border-t-2 mx-5 border-grey-700 flex "></div>
      <div className={'h-full relative'}>
        <div className={'bg-gray-800 h-full w-full items-center'}>
          <div className=''>
            <div className='flex flex-row justify-center flex-wrap p-5'>
              <ParticipantLoop>
                <ParticipantTile className='w-12 h-12 flex flex-col justify-center items-center m-4'>
                  {connectionState === ConnectionState.Connected && <ParticipantName className='text-lg font-semibold mt-2'/>}
                  <VideoTrack source={Track.Source.Camera} className={'rounded-xl mx-2 mb-3'} placeholder={user?.avatar_url!}/>
                  <VideoTrack source={Track.Source.ScreenShare} className={'rounded-xl'}/>
                  <AudioTrack source={Track.Source.Microphone} />
                </ParticipantTile>  
              </ParticipantLoop>
            </div>
            <div className={`flex flex-row justify-evenly ${mediaControls.mediaControls} mb-5 min-w-0 bg-grey-950 py-3 items-center rounded-xl absolute bottom-1 inset-x-1 mx-auto`}>
              {connectionState === ConnectionState.Connected && <TrackToggle showIcon={false} className={'w-7 h-7 bg-grey-900 hover:bg-grey-800 rounded-lg text-lg flex items-center justify-center'} source={Track.Source.Camera}>
                {videoTrack.isCameraEnabled ? (<BsCameraVideo size={22} onClick={() => {setDisplayVideo(true);}}/>) : (<BsCameraVideoOff size={22} onClick={() => {setDisplayVideo(false);}}/>)} 
              </TrackToggle>}
              {connectionState === ConnectionState.Connected && <TrackToggle showIcon={false} className={'w-7 h-7 bg-grey-900 hover:bg-grey-800 rounded-lg text-lg flex items-center justify-center'} source={Track.Source.ScreenShare}> 
                {screenTrack.isScreenShareEnabled ? (<TbScreenShare size={22}/>) : (<TbScreenShareOff size={22}/>) }
              </TrackToggle>}
              {connectionState !== ConnectionState.Connected ? (<button className='w-7 h-7 bg-green-500 hover:bg-green-700 rounded-lg font-bold text-md' onClick={() => {setConnectionState(true), setToken(token);}}> Join </button> ) : (
                <DisconnectButton className={'w-7 h-7 bg-red-500 hover:bg-red-700 rounded-lg font-bold text-xl'} onClick={() => {setConnectionState(false); }}> End </DisconnectButton>
              )}
            </div>
          </div>
        </div>      
      </div>
    </>
  );
}
