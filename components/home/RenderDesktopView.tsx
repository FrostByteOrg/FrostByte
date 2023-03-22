import styles from '@/styles/DesktopView.module.css';
import NavBar from '@/components/home/NavBar';
import { useSideBarOptionValue } from '@/context/SideBarOptionCtx';
import FriendsList from '@/components/home/FriendsList';
import Chat from '@/components/home/Chat';
import DMessageList from '@/components/home/DMessageList';
import ServerList from '@/components/home/ServerList';
import DefaultTest from '@/components/home/DefaultTest';
import { useChannel } from '@/lib/store';
import { Channel } from '@/types/dbtypes';

export default function RenderDesktopView() {
  const channel = useChannel();
  const sideBarOption = useSideBarOptionValue();

  const [sideBarView, mainView] = renderContent(sideBarOption, channel);

  return (
    <div className={`${styles.container}`}>
      <div className="col-start-1 col-end-2 bg-grey-950 flex-col justify-center ">
        <NavBar type="vertical" />
      </div>
      <div className="col-start-2 col-end-4 flex-col bg-grey-900 h-screen overflow-y-scroll overflow-x-hidden">
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
  channel: Channel | null
) {
  switch (sideBarOption) {
    case 'friends':
      if (channel) return [<DMessageList key={1} />, <Chat key={2} />];
      return [<DMessageList key={1} />, <FriendsList key={2} />];
    case 'servers':
      if (channel) return [<ServerList key={1} />, <Chat key={2} />];
      return [<ServerList key={1} />, <DefaultTest key={2} />];
    case 'messages':
      if (channel) return [<DMessageList key={1} />, <Chat key={2} />];
      return [<DMessageList key={1} />, <DefaultTest key={2} />];
    default:
      return [<FriendsList key={1} />, <DefaultTest key={2} />];
  }
}
