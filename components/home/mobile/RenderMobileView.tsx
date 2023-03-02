import { useSideBarOptionValue } from '@/context/SideBarOptionCtx';
import Chat from '@/components/home/Chat';
import FriendsList from '@/components/home/FriendsList';
import ServerList from '@/components/home/ServerList';
import DMessageList from '@/components/home/DMessageList';
import { useChannelIdValue } from '@/context/ChatCtx';

export default function RenderMobileView() {
  const sideBarOption = useSideBarOptionValue();
  const channelId = useChannelIdValue();

  if (channelId > 0) return <Chat />;

  switch (sideBarOption) {
    case 'friends':
      return <FriendsList />;
    case 'servers':
      return <ServerList />;
    case 'messages':
      return <DMessageList />;
    default:
      return <FriendsList />;
  }
}
