import styles from '@/styles/DesktopView.module.css';
import modal from '@/styles/Modal.module.css';
import NavBar from '@/components/home/NavBar';
import { useSideBarOptionValue } from '@/context/SideBarOptionCtx';
import FriendsList from '@/components/home/FriendsList';
import Chat from '@/components/home/Chat';
import DMessageList from '@/components/home/DMessageList';
import ServerList from '@/components/home/ServerList';
import DefaultSplash from '@/components/home/DefaultSplash';
import {
  useChannel,
  useProfile,
  useSetUserProfile,
  useSetUserSettings,
  useUserSettings,
} from '@/lib/store';
import { Channel, Profile } from '@/types/dbtypes';
import MediaChat from '@/components/home/MediaChat';
import {
  RoomAudioRenderer,
  TrackToggle,
  useConnectionState,
  useLocalParticipant,
} from '@livekit/components-react';
import { Track, ConnectionState } from 'livekit-client';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { getProfile } from '@/services/profile.service';
import UserIcon from '../icons/UserIcon';
import GearIcon from '../icons/GearIcon';
import MicrophoneIcon from '../icons/MicrophoneIcon';
import MicrophoneOff from '../icons/MicroPhoneOff';
import HeadPhonesIcon from '../icons/HeadPhonesIcon';
import HeadPhonesOffIcon from '../icons/HeadPhonesOffIcon';
import EditUserModal from './modals/EditUserModal';

export default function RenderDesktopView() {
  const supabase = useSupabaseClient();

  const channel = useChannel();
  const sideBarOption = useSideBarOptionValue();
  const audioTrack = useLocalParticipant();
  const connectionState = useConnectionState();
  const currentUser = useUser();

  const [sideBarView, mainView] = renderContent(sideBarOption, channel);
  const [deafenRoom, setDeafenRoom] = useState(false);
  const editUser = useProfile();

  const [showEditUser, setShowEditUser] = useState(false);

  const setUserRef = useSetUserProfile();

  const userProfile = useProfile();

  const settingsRef = useSetUserSettings();
  const userSettings = useUserSettings();


  return (
    <div className={`${styles.container} `}>
      {deafenRoom ? <></> : <RoomAudioRenderer />}
      <div className='col-start-1 col-end-2 row-start-1 row-end-4  bg-grey-950 flex-col justify-center '>
        <NavBar type='vertical' />
      </div>
      <div className='col-start-2 col-end-4 row-start-1 row-end-4  flex-col bg-grey-900 relative '>
        {sideBarView}
      </div>

      <div className='col-start-4 col-end-13 row-start-1 row-end-4  flex flex-col h-screen'>
        {mainView}
      </div>

      <div
        id="sideBarControls"
        className="col-start-1 col-end-4 z-10 row-start-2 row-end-4 w-full bg-grey-925  p-1 h-auto"
      >
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row items-center ml-2 hover:bg-grey-800 py-1 px-2 rounded-lg">
            {userProfile && (
              <UserIcon
                user={userProfile}
                indicator={true}
                className='!mr-1 !h-6 !w-6'
              />
            )}
            <span className="text-sm">{userProfile?.username}</span>
          </div>

          <div className='flex flex-row w-9'>
            {deafenRoom ? (
              <button
                className='w-7 h-7 hover:text-grey-400'
                onClick={() => setDeafenRoom(false)}>
                <HeadPhonesOffIcon width={5} height={5} />
              </button>
            ) : (
              <button
                className='w-7 h-7 hover:text-grey-400'
                onClick={() => setDeafenRoom(true)}>
                <HeadPhonesIcon width={5} height={5} />
              </button>
            )}
            {connectionState !== ConnectionState.Connected ? (
              <>
                {' '}
                {userSettings ? (
                  <button
                    className='w-7 h-7 hover:text-grey-400'
                    onClick={() => settingsRef(false)}>
                    <MicrophoneIcon width={5} height={5} />
                  </button>
                ) : (
                  <button
                    className='w-7 h-7 hover:text-grey-400'
                    onClick={() => settingsRef(true)}>
                    <MicrophoneOff width={5} height={5} />
                  </button>
                )}
              </>
            ) : (
              <TrackToggle
                showIcon={false}
                className={'w-7 h-7 hover:text-grey-400'}
                source={Track.Source.Microphone}
                onClick={() => settingsRef(false)}>
                {audioTrack.isMicrophoneEnabled ? (
                  <MicrophoneIcon width={5} height={5} />
                ) : (
                  <MicrophoneOff width={5} height={5} />
                )}
              </TrackToggle>
            )}
            <div></div>
            <EditUserModal
              showModal={showEditUser}
              setShowModal={setShowEditUser}
              user={editUser}
            />
            <button
              className='w-7 h-7 hover:text-grey-400'
              onClick={() => {
                setShowEditUser(true);
              }}>
              <GearIcon width={6} height={6} />
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
          return [
            <ServerList key={1} />,
            <MediaChat channel={channel} key={2} />,
          ];
        else return [<ServerList key={1} />, <Chat key={2} />];
      return [<ServerList key={1} />, <DefaultSplash key={2} />];
    default:
      return [<FriendsList key={1} />, <DefaultSplash key={2} />];
  }
}
