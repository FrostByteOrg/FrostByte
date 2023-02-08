import Image, { StaticImageData } from 'next/image';
import VerticalSettingsIcon from '@/components/icons/VerticalSettingsIcon';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { SyntheticEvent } from 'react';
import { useChannelIdSetter } from '@/context/ChatCtx';
import { useMobileViewSetter } from '@/context/MobileViewCtx';

//NOTE: this is a temp type just for testing...to be removed or possibly extracted to the types dir under client
type Server = {
  id: string;
  name: string;
  icon: StaticImageData;
  members: string;
  onlineMembers: string;
  channels: Channel[];
};
//NOTE: this is a temp type just for testing...to be removed or possibly extracted to the types dir under client
type Channel = {
  id: string;
  name: string;
  description: string;
  server_id: string;
};

export default function Server({
  server,
  expanded,
}: {
  server: Server;
  expanded: string;
}) {
  const expand = expanded == server.id;

  const setChannelId = useChannelIdSetter();
  const setMobileView = useMobileViewSetter();

  function joinChannel(e: SyntheticEvent, channelId: string) {
    e.stopPropagation();
    setChannelId(channelId);
    setMobileView('chat');
  }

  if (expand) {
    return (
      <div className="relative ">
        <div className="border-b-2   hover:cursor-pointer border-grey-700 py-2 px-3 flex bg-grey-600 justify-between rounded-xl items-center relative z-10">
          <div className="flex items-center">
            <div className="bg-grey-900 p-2 rounded-xl">
              <Image
                className="w-5"
                src={server.icon}
                alt="Supabase"
                priority
              />
            </div>
            <div className="ml-3">
              <div className="text-lg tracking-wide font-bold">
                {server.name}
              </div>
              <div className="text-xs tracking-wide text-grey-300 flex">
                <div className="flex items-center">
                  <span className="p-1 bg-green-300 rounded-full mr-1"></span>
                  <span>{server.onlineMembers} Online</span>
                </div>
                <div className="flex items-center ml-2">
                  <span className="p-1 bg-grey-300 rounded-full mr-1"></span>
                  <span>{server.members} Members</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <VerticalSettingsIcon />
          </div>
        </div>
        <div className="channels bg-grey-700 rounded-lg relative -top-3 py-4  px-7 ">
          {server.channels.map((channel) => (
            <div
              className="channel flex whitespace-nowrap items-center pt-2 pb-1 px-4 hover:bg-grey-600 hover:cursor-pointer rounded-lg max-w-[192px]  "
              onClick={(e) => joinChannel(e, channel.id)}
              key={channel.id}
            >
              <div>
                <ChannelMessageIcon />
              </div>
              <div className="ml-2 text-sm font-semibold tracking-wide text-grey-200 max-w-[90px] overflow-hidden hover:overflow-visible">
                {channel.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-3 hover:cursor-pointer">
      <div className="border-b-2 border-grey-700 py-2 px-3 flex justify-between hover:bg-grey-700 hover:rounded-xl items-center">
        <div className="flex items-center">
          <div className="bg-grey-900 p-2 rounded-xl">
            <Image className="w-5" src={server.icon} alt="Supabase" priority />
          </div>
          <div className="ml-3">
            <div className="text-lg tracking-wide font-bold">{server.name}</div>
            <div className="text-xs tracking-wide text-grey-300 flex">
              <div className="flex items-center">
                <span className="p-1 bg-green-300 rounded-full mr-1"></span>
                <span>{server.onlineMembers} Online</span>
              </div>
              <div className="flex items-center ml-2">
                <span className="p-1 bg-grey-300 rounded-full mr-1"></span>
                <span>{server.members} Members</span>
              </div>
            </div>
          </div>
        </div>
        <div>
          <VerticalSettingsIcon />
        </div>
      </div>
    </div>
  );
}
