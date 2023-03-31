import {
  useCurrentRoomRef,
  useSetRoomServerName,
  useServers,
  useSetConnectionState,
  useConnectionRef,
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
import ConnectionIcon from '../icons/ConnectionIcon';
import ScreenShareIcon from '../icons/ScreenShareIcon';
import ScreenShareOff from '../icons/ScreenShareOff';
import CameraOffIcon from '../icons/CameraOffIcon';
import CameraIcon from '../icons/CameraIcon';
import HangUpIcon from '../icons/HangUpIcon';

export default function SidebarCallControl() {
  const currentParticipant = useLocalParticipant();
  const setConnectionState = useSetConnectionState();
  const servers = useServers();
  const setServerName = useSetRoomServerName();
  const currentRoom = useCurrentRoomRef();
  const connectionState = useConnectionState();
  const liveKitStatus = useConnectionRef();

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
    <div className="h-auto border rounded-md bottom-8 bg-grey-950 w-full">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col pb-2">
          <div className="pt-2 px-2 flex flex-row ml-2">
            <ConnectionIcon
              width={5}
              height={5}
              className={`${connectionQualityColor()} mr-3`}
            />
            <span className={`${connectionQualityColor()} text-lg font-semibold`}>
              { connectionState.charAt(0).toUpperCase() + connectionState.slice(1) }
            </span>
          </div>
          <span className="text-sm text-grey-300 italic ml-4">
            {currentRoom.server_name}/{currentRoom.name}
          </span>
        </div>
        <DisconnectButton onClick={() => {setConnectionState(false); }}>
          <HangUpIcon width={5} height={5} className='mr-4 text-red-500 hover:text-red-700'/>
        </DisconnectButton>
      </div>
      <div className="flex flex-row justify-evenly">
        <TrackToggle
          showIcon={false}
          className={
            'w-2/4 h-6 mb-2 mx-2 px-1 py-1 border hover:bg-grey-800 rounded-md text-md flex items-center justify-center'
          }
          source={Track.Source.ScreenShare}
        >
          {currentParticipant.isScreenShareEnabled ? (
            <div className="flex flex-row">
              <ScreenShareOff width={5} height={5} className="mr-2" />
              <span className="text-sm">Screen</span>
            </div>
          ) : (
            <div className="flex flex-row">
              <ScreenShareIcon width={5} height={5} className="mr-2" />
              <span className="text-sm">Screen</span>
            </div>
          )}
        </TrackToggle>
        <TrackToggle
          showIcon={false}
          className={
            'w-2/4 h-6 mb-2 mx-2 p-1 border hover:bg-grey-800 rounded-lg text-lg flex items-center justify-center'
          }
          source={Track.Source.Camera}
        >
          {currentParticipant.isCameraEnabled ? (
            <div className="flex flex-row items-center">
              <CameraOffIcon width={5} height={5} className="mr-2" />
              <span className="text-sm">Video</span>
            </div>
          ) : (
            <div className="flex flex-row items-center">
              <CameraIcon width={5} height={5} className="mr-2" />
              <span className="text-sm">Video</span>
            </div>
          )}
        </TrackToggle>
      </div>
    </div>
  );
}
