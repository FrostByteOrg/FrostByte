import VerticalSettingsIcon from '@/components/icons/VerticalSettingsIcon';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useOnlinePresenceRef } from '@/context/ChatCtx';
import { getChannelsInServer } from '@/services/channels.service';
import ServersIcon from '../icons/ServersIcon';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import styles from '@/styles/Servers.module.css';
import { Channel, Server as ServerType } from '@/types/dbtypes';
import { ServerMemberStats } from './ServerMemberStats';
import { OverflowMarquee } from './OverflowMarquee';
import { useSetChannel } from '@/lib/store';
import { ChannelMediaIcon } from '../icons/ChannelMediaIcon';

export default function Server({
  server,
  expanded,
  isLast = false,
}: {
  server: ServerType;
  expanded: number;
  isLast?: boolean;
}) {
  const expand = expanded == server.id;
  const supabase = useSupabaseClient();
  const [memberCount, setMemberCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const onlinePresenceChannel = useOnlinePresenceRef();

  const [isChannelHovered, setIsChannelHovered] = useState(false);
  const [isServerHovered, setIsServerHovered] = useState(false);

  const setChannel = useSetChannel();

  //TODO: getChannelsInServer
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    const handleAsync = async () => {
      if (server) {
        const { data } = await getChannelsInServer(supabase, server.id);
        setChannels(data!);
      }
    };
    handleAsync();
  }, [server, supabase]);

  function joinTextChannel(e: SyntheticEvent, channel: Channel) {
    e.stopPropagation();
    setChannel(channel);
  }

  if (expand) {
    return (
      <div className="relative ">
        <div className="border-b-2 hover:cursor-pointer border-grey-700 py-2 px-3 flex bg-grey-600 justify-between rounded-xl items-center relative z-10">
          <div className="flex items-center">
            <div className="bg-grey-900 p-[6px] rounded-xl">
              <ServersIcon server={server} hovered={false} />
            </div>
            <div className="ml-3">
              <div className="text-lg tracking-wide font-bold max-w-[12ch] overflow-hidden hover:overflow-visible">
                <OverflowMarquee content={server.name} maxLength={10}/>
              </div>
              <ServerMemberStats server={server} />
            </div>
          </div>
          <div>
            <VerticalSettingsIcon />
          </div>
        </div>
        <div className="channels bg-grey-700 rounded-lg relative -top-3 py-4  px-7 ">
          {channels.map((channel: Channel, idx: number) => (
            <div
              className={`channel flex whitespace-nowrap items-center pt-2 pb-1 px-4 hover:bg-grey-600 hover:cursor-pointer rounded-lg max-w-[192px] ${
                idx === 0 ? 'mt-2' : ''
              }`}
              onClick={(e) => {
                if (channel.is_media) {
                  // Entrypoint for media channel
                  return;
                }
                else {
                  joinTextChannel(e, channel);
                }
              }}
              key={channel.channel_id}
            >
              <div className="w-4">
                {channel.is_media ? (
                  <ChannelMediaIcon />
                ) : (
                  <ChannelMessageIcon />
                )}
              </div>

              <div className="ml-2 text-sm font-semibold tracking-wide text-grey-200 max-w-[10ch] overflow-hidden hover:overflow-visible">
                <OverflowMarquee content={channel.name} maxLength={8}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-3 hover:cursor-pointer">
      <div
        className={`${
          !isLast ? 'border-b-2 border-grey-700' : ''
        }   py-2 px-3 flex justify-between hover:bg-grey-700 hover:rounded-xl items-center`}
      >
        <div className="flex items-center">
          <div className={`${styles.serverIcon}  p-[6px] rounded-xl`}>
            <ServersIcon hovered={false} server={server} />
          </div>
          <div className="ml-3">
            <div className="text-lg tracking-wide font-bold max-w-[12ch] overflow-hidden hover:overflow-visible">
              <OverflowMarquee content={server.name} maxLength={10}/>
            </div>
            <ServerMemberStats server={server} />
          </div>
        </div>
        <div>
          <VerticalSettingsIcon />
        </div>
      </div>
    </div>
  );
}
