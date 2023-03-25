import { useChannel, useSetConnectionState, useSetCurrentRoom, useSetToken} from '@/lib/store';
import styles from '@/styles/Chat.module.css';
import { ChannelMediaIcon } from '../icons/ChannelMediaIcon';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useUser } from '@supabase/auth-helpers-react';
import { AudioTrack, DisconnectButton, ParticipantLoop, ParticipantTile, RoomName, TrackToggle, VideoTrack, useConnectionState, useLocalParticipant,useToken } from '@livekit/components-react';
import { Track, ConnectionState} from 'livekit-client';
import { User } from '@/types/dbtypes';
import { BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { TbScreenShare, TbScreenShareOff } from 'react-icons/tb';

export default function MediaChat() {

  const channel = useChannel();
  const userID : User | any = useUser();
  const setToken = useSetToken();
  const setRoom = useSetCurrentRoom();
  const videoTrack = useLocalParticipant();
  const screenTrack = useLocalParticipant();

  const setConnectionState = useSetConnectionState();
  const connectionState = useConnectionState();

  const token = useToken(process.env.NEXT_PUBLIC_LK_TOKEN_ENDPOINT, channel!.channel_id.toString(), {
    userInfo: {
      identity: userID?.id,
      name: userID?.email
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
            <div className='flex flex-row justify-center'>
              <RoomName />
              <ParticipantLoop>
                <ParticipantTile className={'w-12 mb-5 mr-2 mt-5'}>
                  <div className={'flex flex-col items-center'}>
                    <VideoTrack source={Track.Source.Camera} className={'rounded-xl mx-2'}/>
                    {screenTrack.isScreenShareEnabled ? (<VideoTrack source={Track.Source.ScreenShare} className={'rounded-xl'}/>) : (
                      <div className='hidden'/>
                    )}
                  </div>
                  <AudioTrack source={Track.Source.Microphone}/>
                </ParticipantTile>
              </ParticipantLoop>
            </div>
            <div className='flex flex-row justify-evenly mb-5 w-1/3 bg-grey-950 py-3 items-center rounded-xl absolute bottom-1 inset-x-1 mx-auto '>
              <TrackToggle showIcon={false} className={'w-7 h-7 bg-grey-900 hover:bg-grey-800 rounded-lg text-lg flex items-center justify-center'} source={Track.Source.Camera}>
                {videoTrack.isCameraEnabled ? (<BsCameraVideo size={22}/>) : (<BsCameraVideoOff size={22}/>)} 
              </TrackToggle>
              <TrackToggle showIcon={false} className={'w-7 h-7 bg-grey-900 hover:bg-grey-800 rounded-lg text-lg flex items-center justify-center'} source={Track.Source.ScreenShare}> 
                {screenTrack.isScreenShareEnabled ? (<TbScreenShare size={22}/>) : (<TbScreenShareOff size={22}/>) }
              </TrackToggle>
              {connectionState !== ConnectionState.Connected ? (<button className='w-7 h-7 bg-green-500 hover:bg-green-700 rounded-lg font-bold text-md' onClick={() => {setConnectionState(true), setRoom(channel?.channel_id), setToken(token);}}> Join </button> ) : (
                <DisconnectButton className={'w-7 h-7 bg-red-500 hover:bg-red-700 rounded-lg font-bold text-xl'} onClick={() => {setConnectionState(false); }}> End </DisconnectButton>
              )}
            </div>
          </div>
        </div>      
      </div>
    </>
  );
}
