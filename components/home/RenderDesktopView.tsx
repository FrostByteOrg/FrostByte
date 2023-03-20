import styles from '@/styles/DesktopView.module.css';
import NavBar from '@/components/home/NavBar';
import { useSideBarOptionValue } from '@/context/SideBarOptionCtx';
import FriendsList from '@/components/home/FriendsList';
import Chat from '@/components/home/Chat';
import DMessageList from '@/components/home/DMessageList';
import ServerList from '@/components/home/ServerList';
import DefaultTest from '@/components/home/DefaultTest';
import { useChannel } from '@/lib/store';
import { Channel, User } from '@/types/dbtypes';
import MediaChat from '@/components/home/MediaChat';
import { RoomAudioRenderer, TrackToggle } from '@livekit/components-react';
import { Track } from 'livekit-client';
import UserIcon from '../icons/UserIcon';
import { BsMicFill, BsGearFill } from 'react-icons/bs';
import { FaHeadphones } from 'react-icons/fa';

export default function RenderDesktopView({profile} : {profile: User}) {
  const channel = useChannel();
  const sideBarOption = useSideBarOptionValue();

  const [sideBarView, mainView] = renderContent(sideBarOption, channel);

  return (
    <div className={`${styles.container} `}>
      <RoomAudioRenderer/>
      <div className="col-start-1 col-end-2 bg-grey-950 flex-col justify-center ">
        <NavBar type="vertical" />
      </div>
      <div className="col-start-2 col-end-4 flex-col bg-grey-900 relative">
        {sideBarView}
        <div className={'bg-grey-950 h-auto w-full p-3 absolute bottom-[0px]'}>
          <div className='flex flex-row justify-between'>
            <UserIcon user={profile} indicator={false}/>
            <div className='flex flex-row w-9'>
              <button className='w-7 h-7'>
                <FaHeadphones  size={22}/>
              </button>
              <TrackToggle showIcon={false} className={'w-7 h-7'} source={Track.Source.Microphone}>
                <BsMicFill size={22}/>
              </TrackToggle> 
              <button className='w-7 h-7'>
                <BsGearFill  size={22}/>
              </button>
            </div>
          </div>
        </div>
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
      if (channel) return [<FriendsList key={1} />, <Chat key={2} />];
      return [<FriendsList key={1} />, <DefaultTest key={2} />];
    case 'servers':
      if (channel)
        if (channel.is_media) return [<ServerList key={1} />, <MediaChat key={2} />];
        else return [<ServerList key={1} />, <Chat key={2} />];
      return [<ServerList key={1} />, <DefaultTest key={2} />];
    case 'messages':
      if (channel) return [<DMessageList key={1} />, <Chat key={2} />];
      return [<DMessageList key={1} />, <DefaultTest key={2} />];
    default:
      return [<FriendsList key={1} />, <DefaultTest key={2} />];
  }
}
