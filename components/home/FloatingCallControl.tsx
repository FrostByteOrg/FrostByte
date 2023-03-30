import { DisconnectButton, TrackToggle, useConnectionState, useLocalParticipant } from '@livekit/components-react';
import { BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { TbScreenShare, TbScreenShareOff } from 'react-icons/tb';
import mediaStyle from '@/styles/Components.module.css';
import { ConnectionState, Track } from 'livekit-client';
import { useSetConnectionState, useSetCurrentRoomId, useSetCurrentRoomName, useSetCurrentRoomServerId, useSetToken } from '@/lib/store';
import { Channel } from '@/types/dbtypes';

export function FloatingCallControl({ visibleChannel, token }: { visibleChannel?: Channel, token?: string }) {
  const connectionState = useConnectionState();
  const currentParticipant = useLocalParticipant();
  const setConnectionState = useSetConnectionState();
  const setToken = useSetToken();
  const setRoomServerId = useSetCurrentRoomServerId();
  const setRoomIdRef = useSetCurrentRoomId();
  const setRoomName = useSetCurrentRoomName();

  return (
    <div
      className={`
        flex
        flex-row
        justify-evenly
        ${mediaStyle.mediaControls}
        mb-5
        min-w-0
        bg-grey-950
        py-3
        items-center
        rounded-xl
        bottom-11
        inset-x-1
        mx-auto
        relative
        z-10
        right-1/2
      `}
      draggable
    >
      {connectionState === ConnectionState.Connected && (
        <TrackToggle
          showIcon={false}
          className={
            'w-7 h-7 bg-grey-900 hover:bg-grey-800 rounded-lg text-lg flex items-center justify-center'
          }
          source={Track.Source.Camera}
        >
          {currentParticipant.isCameraEnabled ? (
            <BsCameraVideo
              size={22}
            />
          ) : (
            <BsCameraVideoOff
              size={22}
            />
          )}
        </TrackToggle>
      )}
      {connectionState === ConnectionState.Connected && (
        <TrackToggle
          showIcon={false}
          className={
            'w-7 h-7 bg-grey-900 hover:bg-grey-800 rounded-lg text-lg flex items-center justify-center'
          }
          source={Track.Source.ScreenShare}
        >
          {currentParticipant.isScreenShareEnabled ? (
            <TbScreenShare size={22} />
          ) : (
            <TbScreenShareOff size={22} />
          )}
        </TrackToggle>
      )}
      {connectionState !== ConnectionState.Connected ? (
        <button
          className="w-7 h-7 bg-green-500 hover:bg-green-700 rounded-lg font-bold text-md"
          onClick={() => {
            setConnectionState(true),
            setToken(token),
            setRoomIdRef(visibleChannel?.channel_id);
            setRoomName(visibleChannel?.name);
            setRoomServerId(visibleChannel?.server_id);
          }}
        >
          {' '}
        Join{' '}
        </button>
      ) : (
        <DisconnectButton
          className={
            'w-7 h-7 bg-red-500 hover:bg-red-700 rounded-lg font-bold text-xl'
          }
          onClick={() => {
            setConnectionState(false);
          }}
        >
          {' '}
        End{' '}
        </DisconnectButton>
      )}
    </div>
  );
}
