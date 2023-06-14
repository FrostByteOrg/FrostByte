import { useSideBarOptionValue } from '@/context/SideBarOptionCtx';
import Chat from '@/components/home/Chat';
import FriendsList from '@/components/home/FriendsList';
import ServerList from '@/components/home/ServerList';
import DMessageList from '@/components/home/DMessageList';
import NavBar from '../NavBar';
import styles from '@/styles/Home.module.css';
import { useChannel, useProfile, useServers } from '@/lib/store';
import MediaChat from '../MediaChat';
import { RoomAudioRenderer } from '@livekit/components-react';
import GearIcon from '@/components/icons/GearIcon';
import EditUserModal from '../modals/EditUserModal';
import { useState } from 'react';
import DefaultSplash from '../DefaultSplash';
import { useQueryClient } from 'react-query';
import useGetServerQuery from '@/lib/fetchHelpers';
import { useUser } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function RenderMobileView() {
  const sideBarOption = useSideBarOptionValue();

  const channel = useChannel();
  const editUser = useProfile();

  const user = useUser();
  const supabase = createClientComponentClient();
  const queryClient = useQueryClient();
  const {
    data: servers,
    error,
    refetch,
  } = useGetServerQuery(supabase, user?.id);

  const [showEditUser, setShowEditUser] = useState(false);

  if (channel) {
    if (channel.is_media) {
      return (
        <div className=" flex flex-col h-screen">
          <RoomAudioRenderer />
          <div className=" grow overflow-y-clip flex flex-col h-full ">
            <MediaChat channel={channel} />
          </div>
          <div className={`${styles.bottomNav} bg-grey-950 shrink-0`}>
            <NavBar type="bottom" />
          </div>
        </div>
      );
    }
    return (
      <div className=" flex flex-col h-screen">
        <div className=" grow overflow-y-clip flex flex-col h-full ">
          <Chat />
        </div>
        <div className={`${styles.bottomNav} bg-grey-950 shrink-0`}>
          <NavBar type="bottom" />
        </div>
      </div>
    );
  }

  let mainView = <ServerList />;
  let mainViewText = '';
  switch (sideBarOption) {
    case 'friends':
      mainView = <FriendsList />;
      break;
    case 'servers':
      mainView = <ServerList />;
      mainViewText = 'SERVERS';
      break;
    case 'messages':
      mainView = <DMessageList />;
      break;
    default:
      mainView = <FriendsList />;
      break;
  }

  return (
    <div className=" flex flex-col h-screen">
      <div className=" grow overflow-y-scroll flex flex-col h-full ">
        {mainView}
        {servers && servers.length < 1 && mainViewText == 'SERVERS' ? (
          <DefaultSplash showFAQ={true} />
        ) : (
          ''
        )}
      </div>
      <div className={`${styles.bottomNav} bg-grey-950 shrink-0`}>
        <NavBar type="bottom" />
      </div>
    </div>
  );
}
