import { useMobileViewSetter } from '@/context/MobileViewCtx';
import FriendsIcon from '@/components/icons/FriendsIcon';
import ServersIcon from '@/components/icons/ServersIcon';
import MessagesIcon from '@/components/icons/MessagesIcon';
import { useState } from 'react';

export default function BottomNav() {

  const setMobileView = useMobileViewSetter();

  const [friendsHover, setFriendsHover] = useState(false);
  const [serversHover, setServersHover] = useState(false);
  const [messagesHover, setMessagesHover] = useState(false);

  return (
    <>
      <div className='flex'>
        <div 
          className='hover:cursor-pointer' 
          onClick={() => setMobileView('friends')} 
          onMouseEnter={() =>setFriendsHover(true)} 
          onMouseLeave={() => setFriendsHover(false)}>
          <FriendsIcon hovered={friendsHover}/>
        </div>
        <div 
          className='hover:cursor-pointer'
          onClick={() => setMobileView('servers')} 
          onMouseEnter={() =>setServersHover(true)}
          onMouseLeave={() => setServersHover(false)}>
          <ServersIcon hovered={serversHover}/>
        </div>
        <div 
          className='hover:cursor-pointer' 
          onClick={() => setMobileView('messages')} 
          onMouseEnter={() =>setMessagesHover(true)}
          onMouseLeave={() => setMessagesHover(false)}>
          <MessagesIcon hovered={messagesHover}/>
        </div>
      </div>
    </>
  );
}
