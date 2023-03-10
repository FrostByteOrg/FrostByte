import { useSideBarOptionSetter } from '@/context/SideBarOptionCtx';
import FriendsIcon from '@/components/icons/FriendsIcon';
import ServersIcon from '@/components/icons/ServersIcon';
import MessagesIcon from '@/components/icons/MessagesIcon';
import { useState } from 'react';
import { useChannelIdSetter } from '@/context/ChatCtx';

export default function NavBar({ type }: { type: 'vertical' | 'bottom' }) {
  const setSideBarOption = useSideBarOptionSetter();
  const setChannelId = useChannelIdSetter();

  const [friendsHover, setFriendsHover] = useState(false);
  const [serversHover, setServersHover] = useState(false);
  const [messagesHover, setMessagesHover] = useState(false);

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
          setChannelId(0);
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
          setChannelId(0);
        }}
        onMouseEnter={() => setServersHover(true)}
        onMouseLeave={() => setServersHover(false)}
      >
        <ServersIcon
          hovered={serversHover}
          server={null}
          width={6}
          height={6}
        />
      </div>
      <div
        className={`${
          type == 'bottom'
            ? `${bottomStyles} col-start-8 col-end-10`
            : verticalStyles
        }`}
        onClick={() => {
          setSideBarOption('messages');
          setChannelId(0);
        }}
        onMouseEnter={() => setMessagesHover(true)}
        onMouseLeave={() => setMessagesHover(false)}
      >
        <MessagesIcon hovered={messagesHover} width={6} height={6} />
      </div>
    </>
  );
}
