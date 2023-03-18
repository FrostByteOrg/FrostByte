import { useChannelIdValue } from '@/context/ChatCtx';
import styles from '@/styles/DesktopView.module.css';
import NavBar from '@/components/home/NavBar';
import { useSideBarOptionValue } from '@/context/SideBarOptionCtx';
import FriendsList from '@/components/home/FriendsList';
import Chat from '@/components/home/Chat';
import DMessageList from '@/components/home/DMessageList';
import ServerList from '@/components/home/ServerList';
import DefaultTest from '@/components/home/DefaultTest';
import { useChannelId } from '@/lib/store';

export default function RenderDesktopView() {
  const channelId = useChannelId();
  const sideBarOption = useSideBarOptionValue();

  const [sideBarView, mainView] = renderContent(sideBarOption, channelId);

  return (
    <div className={`${styles.container} `}>
      <div className="col-start-1 col-end-2 bg-grey-950 flex-col justify-center ">
        <NavBar type="vertical" />
      </div>
      <div className="col-start-2 col-end-4 flex-col bg-grey-900 ">
        {sideBarView}
      </div>
      <div className="col-start-4 col-end-13 flex flex-col h-screen">
        {mainView}
      </div>
    </div>
  );
}

export function renderContent(
  sideBarOption: 'friends' | 'servers' | 'messages',
  channelId: number
) {
  switch (sideBarOption) {
    case 'friends':
      if (channelId > 0) return [<FriendsList key={1} />, <Chat key={2} />];
      return [<FriendsList key={1} />, <DefaultTest key={2} />];
    case 'servers':
      if (channelId > 0) return [<ServerList key={1} />, <Chat key={2} />];
      return [<ServerList key={1} />, <DefaultTest key={2} />];
    case 'messages':
      if (channelId > 0) return [<DMessageList key={1} />, <Chat key={2} />];
      return [<DMessageList key={1} />, <DefaultTest key={2} />];
    default:
      return [<FriendsList key={1} />, <DefaultTest key={2} />];
  }
}
