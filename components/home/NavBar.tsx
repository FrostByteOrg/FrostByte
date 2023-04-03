import { useSideBarOptionSetter } from '@/context/SideBarOptionCtx';
import FriendsIcon from '@/components/icons/FriendsIcon';
import ServersIcon from '@/components/icons/ServersIcon';
import { useState } from 'react';
import { useSetChannel, useUserRef } from '@/lib/store';
import GearIcon from '../icons/GearIcon';
import EditUserModal from './EditUserModal';

export default function NavBar({ type }: { type: 'vertical' | 'bottom' }) {
  const setSideBarOption = useSideBarOptionSetter();

  const setChannel = useSetChannel();
  const editUser = useUserRef();


  const [showEditUser, setShowEditUser] = useState(false);
  const [friendsHover, setFriendsHover] = useState(false);
  const [serversHover, setServersHover] = useState(false);
  const bottomStyles = 'hover:cursor-pointer flex justify-center items-center';
  const verticalStyles = 'hover:cursor-pointer flex justify-center py-5';

  return (
    <>
      <div
        className={`${
          type == 'bottom'
            ? `${bottomStyles} col-start-4 col-end-6`
            : verticalStyles
        }`}
        onClick={() => {
          setSideBarOption('friends');
          setChannel(null);
        }}
        onMouseEnter={() => setFriendsHover(true)}
        onMouseLeave={() => setFriendsHover(false)}
      >
        <FriendsIcon hovered={friendsHover} width={6} height={6} />
      </div>
      <div
        className={`${
          type == 'bottom'
            ? `${bottomStyles} col-start-6 col-end-8`
            : verticalStyles
        }`}
        onClick={() => {
          setSideBarOption('servers');
          setChannel(null);
        }}
        onMouseEnter={() => setServersHover(true)}
        onMouseLeave={() => setServersHover(false)}
      >
        <ServersIcon
          hovered={serversHover}
          width={6}
          height={6}
        />
      </div>
      {/* <div
        className={`${
          type == 'bottom'
            ? `${bottomStyles} col-start-8 col-end-10`
            : verticalStyles
        }`}
        onClick={() => {
          setSideBarOption('messages');
          setChannel(null);
        }}
        onMouseEnter={() => setMessagesHover(true)}
        onMouseLeave={() => setMessagesHover(false)}
      >
        <MessagesIcon hovered={messagesHover} width={6} height={6} />
      </div> */}
      <div className={`${
        type == 'bottom' && `${bottomStyles} col-start-8 col-end-10`}`}>
        {type == 'bottom' &&
      <>
        <EditUserModal 
          showModal={showEditUser} 
          setShowModal={setShowEditUser} 
          user={editUser}/>
        <button 
          className="w-7 h-7 hover:text-grey-400"
          onClick={() => {setShowEditUser(true);}}>
          <GearIcon width={6} height={6}/>
        </button>
      </>
        }
      </div>
    </>
  );
}
