import { useSideBarOptionValue } from '@/context/SideBarOptionCtx';
import Chat from '@/components/home/Chat';
import FriendsList from '@/components/home/FriendsList';
import ServerList from '@/components/home/ServerList';
import DMessageList from '@/components/home/DMessageList';
import NavBar from '../NavBar';
import styles from '@/styles/Home.module.css';
import { useChannel, useUserRef } from '@/lib/store';
import MediaChat from '../MediaChat';
import GearIcon from '@/components/icons/GearIcon';
import EditUserModal from '../modals/EditUserModal';
import { useState } from 'react';

export default function RenderMobileView() {
  const sideBarOption = useSideBarOptionValue();

  const channel = useChannel();
  const editUser = useUserRef();

  const [showEditUser, setShowEditUser] = useState(false);

  if (channel) {
    if (channel.is_media) {
      return (
        <div className=' flex flex-col h-screen'>
          <div className=' grow overflow-y-clip flex flex-col h-full '>
            <MediaChat channel={channel} />
          </div>
          <div className={`${styles.bottomNav} bg-grey-950 shrink-0`}>
            <NavBar type='bottom' />
          </div>
        </div>
      );
    }
    return (
      <div className=' flex flex-col h-screen'>
        <div className=' grow overflow-y-clip flex flex-col h-full '>
          <Chat />
        </div>
        <div className={`${styles.bottomNav} bg-grey-950 shrink-0`}>
          <NavBar type='bottom' />
        </div>
      </div>
    );
  }

  let mainView = <ServerList />;
  switch (sideBarOption) {
    case 'friends':
      mainView = <FriendsList />;
      break;
    case 'servers':
      mainView = <ServerList />;
      break;
    case 'messages':
      mainView = <DMessageList />;
      break;
    default:
      mainView = <FriendsList />;
      break;
  }

  return (
    <div className=' flex flex-col h-screen'>
      <div className=' grow overflow-y-scroll flex flex-col h-full '>
        {mainView}
      </div>
      <div className={`${styles.bottomNav} bg-grey-950 shrink-0`}>
        <NavBar type='bottom' />
      </div>
    </div>
  );
}
