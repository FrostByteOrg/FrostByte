import { useMobileViewSetter } from '@/context/MobileViewCtx';
import FriendsIcon from '@/components/icons/FriendsIcon';
import ServersIcon from '@/components/icons/ServersIcon';
import MessagesIcon from '@/components/icons/MessagesIcon';

export default function BottomNav() {

  const setMobileView = useMobileViewSetter();

  return (
    <>
      <div className='flex'>
        <div className='hover:cursor-pointer' onClick={() => setMobileView('friends')}><FriendsIcon/></div>
        <div className='hover:cursor-pointer' onClick={() => setMobileView('servers')}><ServersIcon/></div>
        <div className='hover:cursor-pointer' onClick={() => setMobileView('messages')}><MessagesIcon/></div>
      </div>
    </>
  );
}
