import {
  useCurrentRoomRef,
  useSetRoomServerName,
  useServers,
  useSetConnectionState,
  useConnectionRef,
  useSetUserSettings,
  useUserSettings,
} from '@/lib/store';
import {
  DisconnectButton,
  TrackToggle,
  useConnectionState,
  useLocalParticipant,
} from '@livekit/components-react';
import { ConnectionQuality, ConnectionState, Track } from 'livekit-client';
import { ConnectionQuality as _ConnQual } from 'livekit-server-sdk/dist/proto/livekit_models';
import { useEffect } from 'react';
import mediaStyle from '@/styles/Components.module.css';
import ConnectionIcon from '../../icons/ConnectionIcon';
import CameraOffIcon from '../../icons/CameraOffIcon';
import CameraIcon from '../../icons/CameraIcon';
import HangUpIcon from '../../icons/HangUpIcon';
import MicrophoneIcon from '@/components/icons/MicrophoneIcon';
import MicrophoneOff from '@/components/icons/MicroPhoneOff';

export default function MobileCallControls() {
  const currentParticipant = useLocalParticipant();
  const setConnectionState = useSetConnectionState();
  const servers = useServers();
  const setServerName = useSetRoomServerName();
  const currentRoom = useCurrentRoomRef();
  const connectionState = useConnectionState();
  const settingsRef = useSetUserSettings();
  const userSettings = useUserSettings();



  const connectionQualityColor = () => {
    if (connectionState === ConnectionState.Connecting || connectionState === ConnectionState.Reconnecting) {
      return 'text-yellow-400';
    }

    else if (connectionState === ConnectionState.Disconnected) {
      return 'text-red-400';
    }

    switch (currentParticipant.localParticipant.connectionQuality) {
      case ConnectionQuality.Excellent:
        return 'text-green-500';
      case ConnectionQuality.Good:
        return 'text-green-300';
      case ConnectionQuality.Poor:
        return 'text-red-400';
      case ConnectionQuality.Unknown:
        return 'text-grey-400';
    }
  };

  useEffect(() => {
    if (setServerName) {
      setServerName(currentRoom.server_id, servers);
    }
  }, [currentRoom.server_id, setServerName, servers]);

  return (
    <div className={`h-auto rounded-b-lg bottom-8 bg-grey-950 w-full mx-auto py-1 ${mediaStyle.appear}`}>
      <div className="flex flex-row items-center justify-between py-1">
        <div className="flex flex-col">
          <div className=" flex flex-row ml-2 items-center">
            <ConnectionIcon
              width={5}
              height={5}
              className={`${connectionQualityColor()} `}
            />
            <span className={`${connectionQualityColor()} text-md font-semibold mx-1`}>
              { connectionState.charAt(0).toUpperCase() + connectionState.slice(1) }
            </span>
            <span className="text-xs text-grey-300 italic ml-1">
              {currentRoom.server_name}/{currentRoom.name}
            </span>
          </div>
        </div>
        <div className='flex flex-row justify-between items-center h-auto w-10 mr-4'>
          {connectionState !== ConnectionState.Connected ? (
            <>
              {' '}
              {userSettings ? (
                <button
                  onClick={() => settingsRef(false)}
                  className='w-auto h-6 p-1 rounded-full bg-frost-600'
                >
                  <MicrophoneIcon width={5} height={5}/>
                </button>
              ) : (
                <button
                  onClick={() => settingsRef(true)}
                  className='w-auto h-6 p-1 rounded-full bg-frost-600'
                >
                  <MicrophoneOff width={5} height={5} />
                </button>
              )}
            </>
          ) : (
            <TrackToggle
              showIcon={false}
              source={Track.Source.Microphone}
              onClick={() => settingsRef(false)} 
              className='w-auto h-6 p-1 rounded-full bg-frost-600'
            >
              {currentParticipant.isMicrophoneEnabled ? (
                <MicrophoneIcon width={5} height={5}/>
              ) : (
                <MicrophoneOff width={5} height={5} />
              )}
            </TrackToggle>
          )}
          <TrackToggle
            showIcon={false}
            className={
              'w-auto h-6 p-1 rounded-full bg-frost-600 flex items-center justify-center'
            }
            source={Track.Source.Camera}
          >
            {currentParticipant.isCameraEnabled ? (
              <div className="flex flex-row">
                <CameraOffIcon width={5} height={5} className="" />
              </div>
            ) : (
              <div className="flex flex-row">
                <CameraIcon width={5} height={5} className="" />
              </div>
            )}
          </TrackToggle>
          <DisconnectButton className='rounded-full p-1 bg-red-500' onClick={() => {setConnectionState(false); }}>
            <HangUpIcon width={5} height={5} className=''/>
          </DisconnectButton>
        </div>
      </div>
    </div>
  );
}
