import { useMobileViewValue } from '@/context/MobileViewCtx';
import Chat from '@/components/home/Chat';
import FriendsList from '@/components/home/FriendsList';
import ServerList from '@/components/home/ServerList';
import DMessageList from '@/components/home/DMessageList';
import { useChannelIdValue } from '@/context/ChatCtx';

export default function RenderMobileView() {
  const mobileView = useMobileViewValue();
  const channelId = useChannelIdValue();

  switch (mobileView) {
    case 'friends':
      return <FriendsList />;
    case 'servers':
      return <ServerList />;
    case 'messages':
      return <DMessageList />;
    case 'chat':
      return <Chat />;
    default:
      return <FriendsList />;
  }
}
