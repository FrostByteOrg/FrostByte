import {
  useCurrentRoomRef,
  useSetRoomServerName,
  useServers,
  useSetConnectionState,
  useSetCurrentRoomId,
} from '@/lib/store';
import {
  DisconnectButton,
  TrackToggle,
  useLocalParticipant,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { useEffect } from 'react';
import { BiPhoneOff } from 'react-icons/bi';
import { BsBarChart, BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { TbScreenShare, TbScreenShareOff } from 'react-icons/tb';

export default function FloatingCallControl() {
  const videoTrack = useLocalParticipant();
  const screenTrack = useLocalParticipant();
  const setConnectionState = useSetConnectionState();
  const setCurrentRoomId = useSetCurrentRoomId();
  const servers = useServers();
  const setServerName = useSetRoomServerName();
  const currentRoom = useCurrentRoomRef();

  useEffect(() => {
    if (setServerName) {
      setServerName(currentRoom.server_id, servers);
    }
  }, [currentRoom.server_id, setServerName, servers]);

  return (
    <div className="h-auto border rounded-md absolute bottom-8 bg-grey-950 w-full">
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col pb-2">
          <div className="pt-2 px-2 flex flex-row ml-2">
            <BsBarChart size={22} className="text-green-500 mr-3" />
            <span className="text-green-500 text-lg font-semibold">
              Connected
            </span>
          </div>
          <span className="text-sm text-grey-300 italic ml-4">
            {currentRoom.server_name}/{currentRoom.name}
          </span>
        </div>
        <DisconnectButton
          onClick={() => {
            setConnectionState(false), setCurrentRoomId(0);
          }}
        >
          <BiPhoneOff
            size={22}
            className="mr-4 text-red-500 hover:text-red-700"
          />
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
          {screenTrack.isScreenShareEnabled ? (
            <div className="flex flex-row">
              <TbScreenShare size={22} className="mr-2" />
              <span className="text-sm">Screen</span>
            </div>
          ) : (
            <div className="flex flex-row">
              <TbScreenShareOff size={22} className="mr-2" />
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
          {videoTrack.isCameraEnabled ? (
            <div className="flex flex-row items-center">
              <BsCameraVideo size={18} className="mr-2" />
              <span className="text-sm">Video</span>
            </div>
          ) : (
            <div className="flex flex-row items-center">
              <BsCameraVideoOff size={18} className="mr-2" />
              <span className="text-sm">Video</span>
            </div>
          )}
        </TrackToggle>
      </div>
    </div>
  );
}
