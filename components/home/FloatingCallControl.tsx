import { DisconnectButton, TrackToggle, useConnectionState, useLocalParticipant } from '@livekit/components-react';
import ScreenShareOff from '../icons/ScreenShareOff';
import ScreenShareIcon from '../icons/ScreenShareIcon';
import mediaStyle from '@/styles/Components.module.css';
import { ConnectionState, Track } from 'livekit-client';
import { useSetConnectionState, useSetCurrentRoomId, useSetCurrentRoomName, useSetCurrentRoomServerId, useSetToken, useConnectionRef, useSetUserSettings, useUserSettings } from '@/lib/store';
import { Channel } from '@/types/dbtypes';
import CameraOffIcon from '../icons/CameraOffIcon';
import CameraIcon from '../icons/CameraIcon';
import JoinCallIcon from '../icons/JoinCallIcon';
import HangUpIcon from '../icons/HangUpIcon';
import MicrophoneIcon from '../icons/MicrophoneIcon';
import MicrophoneOff from '../icons/MicroPhoneOff';

export function FloatingCallControl({ visibleChannel, token }: { visibleChannel?: Channel, token?: string }) {
  const connectionState = useConnectionState();
  const currentParticipant = useLocalParticipant();
  const setConnectionState = useSetConnectionState();
  const setToken = useSetToken();
  const setRoomServerId = useSetCurrentRoomServerId();
  const setRoomIdRef = useSetCurrentRoomId();
  const setRoomName = useSetCurrentRoomName();
  const settingsRef = useSetUserSettings();
  const userSettings = useUserSettings();

  const handleConnect = () => {
    setConnectionState(true),
    setToken(token),
    setRoomIdRef(visibleChannel?.channel_id);
    setRoomName(visibleChannel?.name);
    setRoomServerId(visibleChannel?.server_id);
  };

  return (
    <div
      className={`
        flex
        flex-row
        justify-evenly
        ${mediaStyle.mediaControls}
        min-w-0
        bg-grey-950
        items-center
        rounded-xl
        inset-x-1
        mx-auto
        py-3
        z-10
      `}
      draggable
    >
      {connectionState !== ConnectionState.Connected ? (
        <button disabled className='w-7 h-7 bg-grey-900 rounded-lg text-lg flex items-center justify-center'>
          <CameraIcon className='text-grey-600'/>
        </button>) : (
        <TrackToggle
          showIcon={false}
          className={
            'w-7 h-7 bg-grey-900 hover:bg-grey-800 rounded-lg text-lg flex items-center justify-center'
          }
          source={Track.Source.Camera}
        >
          {currentParticipant.isCameraEnabled ? (
            <CameraOffIcon
            />
          ) : (
            <CameraIcon
            />
          )}
        </TrackToggle>
      )}
      {connectionState !== ConnectionState.Connected ? (
        <button disabled
          className={`w-7 h-7 bg-grey-900 rounded-lg text-lg flex items-center justify-center ${mediaStyle.disappear}`}>
          <ScreenShareIcon className='text-grey-600'/>
        </button>) : (
        <TrackToggle
          showIcon={false}
          className={
            `w-7 h-7 bg-grey-900 hover:bg-grey-800 rounded-lg text-lg flex items-center justify-center ${mediaStyle.disappear}`
          }
          source={Track.Source.ScreenShare}
          disabled={true}
        >
          {currentParticipant.isScreenShareEnabled ? (
            <ScreenShareOff />
          ) : (
            <ScreenShareIcon />
          )}
        </TrackToggle>
      )}
      {connectionState !== ConnectionState.Connected ? (
        <div className={`${mediaStyle.appear}`}>
          {' '}
          {userSettings ? (
            <button
              onClick={() => settingsRef(false)}
              className={`w-7 h-7 rounded-lg p-1  bg-grey-900 flex items-center justify-center ${mediaStyle.appear}`}
            >
              <MicrophoneIcon width={6} height={6}/>
            </button>
          ) : (
            <button
              onClick={() => settingsRef(true)}
              className={`w-7 h-7 rounded-lg p-1  bg-grey-900 flex items-center justify-center ${mediaStyle.appear}`}
            >
              <MicrophoneOff width={6} height={6} />
            </button>
          )}
        </div>
      ) : (
        <TrackToggle
          showIcon={false}
          source={Track.Source.Microphone}
          onClick={() => settingsRef(false)} 
          className={`w-7 h-7 rounded-lg p-1  bg-grey-900 flex items-center justify-center ${mediaStyle.appear}`}
        >
          {currentParticipant.isMicrophoneEnabled ? (
            <MicrophoneIcon width={6} height={6}/>
          ) : (
            <MicrophoneOff width={6} height={6} />
          )}
        </TrackToggle>
      )}
      {connectionState !== ConnectionState.Connected ? (
        <button
          className="w-7 h-7 bg-green-500 hover:bg-green-700 rounded-lg font-bold text-md flex items-center justify-center"
          onClick={() => {
            handleConnect();
          }}
        >
          <JoinCallIcon width={6} height={6} />
        </button>
      ) : (
        <DisconnectButton
          className={
            'w-7 h-7 bg-red-500 hover:bg-red-700 rounded-lg flex items-center justify-center'
          }
          onClick={() => {
            setConnectionState(false);
          }}
        >
          <HangUpIcon width={6} height={6} />
        </DisconnectButton>
      )}
    </div>
  );
}
