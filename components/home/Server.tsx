import Image, { StaticImageData } from 'next/image';
import VerticalSettingsIcon from '@/components/icons/VerticalSettingsIcon';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useChannelIdSetter, useChatNameSetter } from '@/context/ChatCtx';
import { getChannelsInServer } from '@/services/channels.service';
import { ServersForUser } from '@/types/dbtypes';
import ServersIcon from '../icons/ServersIcon';

export default function Server({
  server,
  expanded,
}: {
  server: any;
  expanded: number;
}) {
  const expand = expanded == server.server_id;

  const setChannelId = useChannelIdSetter();
  const setChatName = useChatNameSetter();

  //TODO: getChannelsInServer
  const [channels, setChannels] = useState<any>([]);

  useEffect(() => {
    const handleAsync = async () => {
      if (server) {
        const { data } = await getChannelsInServer(server.server_id);
        setChannels(data);
      }
    };
    handleAsync();
  }, [server]);

  function joinChannel(e: SyntheticEvent, channelId: number, name: string) {
    e.stopPropagation();
    setChatName(name);
    setChannelId(channelId);
  }
  //NOTE: REMOVE THESE
  function renderHardcodedOnline(serverId: any) {
    if (serverId == 30) {
      return '3';
    } else if (serverId == 31) {
      return '3';
    }
    return '1';
  }
  function renderHardcodedMembers(serverId: any) {
    if (serverId == 30) {
      return '3';
    } else if (serverId == 31) {
      return '3';
    }
    return '1';
  }

  if (expand) {
    return (
      <div className="relative ">
        <div className="border-b-2   hover:cursor-pointer border-grey-700 py-2 px-3 flex bg-grey-600 justify-between rounded-xl items-center relative z-10">
          <div className="flex items-center">
            <div className="bg-grey-900 p-2 rounded-xl">
              <ServersIcon server={server.servers} hovered={false} />
            </div>
            <div className="ml-3">
              <div className="text-lg tracking-wide font-bold">
                {server.servers.name}
              </div>
              <div className="text-xs tracking-wide text-grey-300 flex">
                <div className="flex items-center">
                  <span className="p-1 bg-green-300 rounded-full mr-1"></span>
                  <span>{renderHardcodedOnline(server.servers.id)} Online</span>
                </div>
                <div className="flex items-center ml-2">
                  <span className="p-1 bg-grey-300 rounded-full mr-1"></span>
                  <span>
                    {renderHardcodedMembers(server.servers.id)} Members
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <VerticalSettingsIcon />
          </div>
        </div>
        <div className="channels bg-grey-700 rounded-lg relative -top-3 py-4  px-7 ">
          {channels.map((channel: any, idx: number) => (
            <div
              className={`channel flex whitespace-nowrap items-center pt-2 pb-1 px-4 hover:bg-grey-600 hover:cursor-pointer rounded-lg max-w-[192px] ${
                idx === 0 ? 'mt-2' : ''
              }`}
              onClick={(e) => joinChannel(e, channel.channel_id, channel.name)}
              key={channel.channel_id}
            >
              {/* TODO: change the key back to channel.id */}
              <div className="w-4">
                <ChannelMessageIcon size="" />
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
            <ServersIcon hovered={false} server={server.servers} />
          </div>
          <div className="ml-3">
            <div className="text-lg tracking-wide font-bold">
              {server.servers.name}
            </div>
            <div className="text-xs tracking-wide text-grey-300 flex">
              <div className="flex items-center">
                <span className="p-1 bg-green-300 rounded-full mr-1"></span>
                <span>{renderHardcodedOnline(server.servers.id)} Online</span>
              </div>
              <div className="flex items-center ml-2">
                <span className="p-1 bg-grey-300 rounded-full mr-1"></span>
                <span>{renderHardcodedMembers(server.servers.id)} Members</span>
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
