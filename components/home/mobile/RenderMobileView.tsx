import { useMobileViewValue } from '@/context/MobileViewCtx';
import Chat from '@/components/home/Chat';
import FriendsList from '@/components/home/FriendsList';
import ServerList from '@/components/home/ServerList';
import MessageList from '@/components/home/MessageList';

export default function RenderMobileView() {

  const mobileView = useMobileViewValue();

  switch (mobileView) {
    case 'friends':
      return <FriendsList/>;
    case 'servers':
      return <ServerList/>;
    case 'messages':
      return <MessageList/>;
    case 'chat':
      return <Chat/>;
    default:
      return <FriendsList/>;
  }
}
