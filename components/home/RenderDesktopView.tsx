import styles from '@/styles/DesktopView.module.css';
import NavBar from '@/components/home/NavBar';
import { useSideBarOptionValue } from '@/context/SideBarOptionCtx';
import FriendsList from '@/components/home/FriendsList';
import Chat from '@/components/home/Chat';
import DMessageList from '@/components/home/DMessageList';
import ServerList from '@/components/home/ServerList';
import DefaultTest from '@/components/home/DefaultTest';
import {
  useChannel,
  useSetUser,
  useSetUserSettings,
  useUserSettings,
} from '@/lib/store';
import { Channel, User } from '@/types/dbtypes';
import MediaChat from '@/components/home/MediaChat';
import {
  RoomAudioRenderer,
  TrackToggle,
  useConnectionState,
  useLocalParticipant,
} from '@livekit/components-react';
import { Track, ConnectionState } from 'livekit-client';
import UserIcon from '../icons/UserIcon';
import { BsMic, BsMicMute, BsGear } from 'react-icons/bs';
import { TbHeadphones, TbHeadphonesOff } from 'react-icons/tb';
import FloatingCallControl from './FloatingCallControl';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { getProfile } from '@/services/profile.service';
import EditUserModal from './EditUserModal';
import { Tooltip } from 'react-tooltip';

export default function RenderDesktopView() {
  const supabase = useSupabaseClient();

  const channel = useChannel();
  const sideBarOption = useSideBarOptionValue();
  const audioTrack = useLocalParticipant();
  const connectionState = useConnectionState();
  const currentUser = useUser();

  const [sideBarView, mainView] = renderContent(sideBarOption, channel);
  const [deafenRoom, setDeafenRoom] = useState(false);
  const [user, setUser] = useState<User>();
  const [showEditUser, setShowEditUser] = useState(false);

  const userRef = useSetUser();

  const settingsRef = useSetUserSettings();
  const userSettings = useUserSettings();

  useEffect(() => {
    const handleAsync = async () => {
      if (currentUser) {
        const { data, error } = await getProfile(supabase, currentUser?.id);
        if (error) {
          console.log(error);
        }
        setUser(data!);
        userRef(data!);
      }
    };
    handleAsync();
  }, [currentUser, supabase, userRef]);

  return (
    <div className={`${styles.container} `}>
      {deafenRoom ? <></> : <RoomAudioRenderer />}
      <div className="col-start-1 col-end-2 row-start-1 row-end-4  bg-grey-950 flex-col justify-center ">
        <NavBar type="vertical" />
      </div>
      <div className="col-start-2 col-end-4 row-start-1 row-end-4  flex-col bg-grey-900 relative ">
        {sideBarView}
        {connectionState === ConnectionState.Connected && (
          <FloatingCallControl />
        )}
      </div>

      <div className="col-start-4 col-end-13 row-start-1 row-end-4  flex flex-col h-screen">
        {mainView}
      </div>

      <div
        id="sideBarControls"
        className="col-start-1 col-end-4 z-10 row-start-2 row-end-4 w-full bg-grey-925  p-1 h-auto"
      >
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center ml-2 hover:bg-grey-800 py-1 px-2 rounded-lg">
            {user && (
              <UserIcon
                user={user}
                indicator={true}
                className="!mr-1 !h-6 !w-6"
              />
            )}
            <span className="text-sm">{user?.username}</span>
          </div>

          <div className="flex flex-row w-9">
            {deafenRoom ? (
              <button
                className="w-7 h-7 hover:text-grey-400"
                onClick={() => setDeafenRoom(false)}
              >
                <TbHeadphonesOff size={22} />
              </button>
            ) : (
              <button
                className="w-7 h-7 hover:text-grey-400"
                onClick={() => setDeafenRoom(true)}
              >
                <TbHeadphones size={22} />
              </button>
            )}
            {connectionState !== ConnectionState.Connected ? (
              <>
                {' '}
                {userSettings ? (
                  <button
                    className="w-7 h-7 hover:text-grey-400"
                    onClick={() => settingsRef(false)}
                  >
                    <BsMic size={22} />
                  </button>
                ) : (
                  <button
                    className="w-7 h-7 hover:text-grey-400"
                    onClick={() => settingsRef(true)}
                  >
                    <BsMicMute size={22} />
                  </button>
                )}
              </>
            ) : (
              <TrackToggle
                showIcon={false}
                className={'w-7 h-7 hover:text-grey-400'}
                source={Track.Source.Microphone}
              >
                {audioTrack.isMicrophoneEnabled ? (
                  <BsMic size={22} onClick={() => settingsRef(false)} />
                ) : (
                  <BsMicMute size={22} onClick={() => settingsRef(true)} />
                )}
              </TrackToggle>
            )}
            <EditUserModal 
              showModal={showEditUser} 
              setShowModal={setShowEditUser}
              user={user!}/>
            <button 
              className="w-7 h-7 hover:text-grey-400"
              onClick={() => {setShowEditUser(true);}}>
              <BsGear size={22} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function renderContent(
  sideBarOption: 'friends' | 'servers' | 'messages',
  channel: Channel | null
) {
  switch (sideBarOption) {
    case 'friends':
      if (channel) return [<DMessageList key={1} />, <Chat key={2} />];
      return [<DMessageList key={1} />, <FriendsList key={2} />];
    case 'servers':
      if (channel)
        if (channel.is_media)
          return [<ServerList key={1} />, <MediaChat key={2} />];
        else return [<ServerList key={1} />, <Chat key={2} />];
      return [<ServerList key={1} />, <DefaultTest key={2} />];
    // case 'messages':
    //   if (channel) return [<DMessageList key={1} />, <Chat key={2} />];
    //   return [<DMessageList key={1} />, <DefaultTest key={2} />];
    default:
      return [<FriendsList key={1} />, <DefaultTest key={2} />];
  }
}
