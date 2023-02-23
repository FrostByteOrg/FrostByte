import { useMobileViewSetter } from '@/context/MobileViewCtx';
import FriendsIcon from '@/components/icons/FriendsIcon';
import ServersIcon from '@/components/icons/ServersIcon';
import MessagesIcon from '@/components/icons/MessagesIcon';
import { useState } from 'react';

export default function VerticalNav() {
  //TODO: change mobileView => mainView
  const setMobileView = useMobileViewSetter();

  const [friendsHover, setFriendsHover] = useState(false);
  const [serversHover, setServersHover] = useState(false);
  const [messagesHover, setMessagesHover] = useState(false);

  return (
    <div className="flex-col justify-center">
      <div
        className="hover:cursor-pointer flex justify-center py-5"
        onClick={() => setMobileView('friends')}
        onMouseEnter={() => setFriendsHover(true)}
        onMouseLeave={() => setFriendsHover(false)}
      >
        <FriendsIcon hovered={friendsHover} width={6} height={6} />
      </div>
      <div
        className="hover:cursor-pointer flex justify-center py-5"
        onClick={() => setMobileView('servers')}
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
        className="hover:cursor-pointer flex justify-center py-5"
        onClick={() => setMobileView('messages')}
        onMouseEnter={() => setMessagesHover(true)}
        onMouseLeave={() => setMessagesHover(false)}
      >
        <MessagesIcon hovered={messagesHover} width={6} height={6} />
      </div>
    </div>
  );
}
