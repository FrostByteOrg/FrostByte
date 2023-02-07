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

      <div 
        className='hover:cursor-pointer col-start-4 col-end-6 flex justify-center items-center' 
        onClick={() => setMobileView('friends')} 
        onMouseEnter={() =>setFriendsHover(true)} 
        onMouseLeave={() => setFriendsHover(false)}>
        <FriendsIcon hovered={friendsHover}/>
      </div>
      <div 
        className='hover:cursor-pointer col-start-6 col-end-8 flex justify-center items-center'
        onClick={() => setMobileView('servers')} 
        onMouseEnter={() =>setServersHover(true)}
        onMouseLeave={() => setServersHover(false)}>
        <ServersIcon hovered={serversHover}/>
      </div>
      <div 
        className='hover:cursor-pointer col-start-8 col-end-10 flex justify-center items-center' 
        onClick={() => setMobileView('messages')} 
        onMouseEnter={() =>setMessagesHover(true)}
        onMouseLeave={() => setMessagesHover(false)}>
        <MessagesIcon hovered={messagesHover}/>
      </div>

    </>
  );
}
