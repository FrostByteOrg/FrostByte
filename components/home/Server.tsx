import VerticalSettingsIcon from '@/components/icons/VerticalSettingsIcon';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  useEffect,
  useState,
} from 'react';
import { getChannelsInServer } from '@/services/channels.service';
import ServersIcon from '../icons/ServersIcon';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import styles from '@/styles/Servers.module.css';
import { Channel, Server as ServerType } from '@/types/dbtypes';
import { ServerMemberStats } from './ServerMemberStats';
import { OverflowMarquee } from './OverflowMarquee';
import { useSetChannel } from '@/lib/store';
import { ChannelMediaIcon } from '../icons/ChannelMediaIcon';
import { Tooltip } from 'react-tooltip';
import ChannelName from './ChannelName';

export default function Server({
  server,
  expanded,
  isLast = false,
  setExpanded,
}: {
  server: ServerType;
  expanded: number;
  isLast?: boolean;
  setExpanded: Dispatch<SetStateAction<number>>;
}) {
  const expand = expanded == server.id;
  const supabase = useSupabaseClient();
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const setChannel = useSetChannel();
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

  function joinVideoChannel(e: SyntheticEvent, channel: Channel) {
    e.stopPropagation();
    setChannel(channel);
  }

  if (expand) {
    return (
      <div className="relative overflow-x-visible">
        <div className="border-b-2 border-grey-700 py-2 px-3 flex bg-grey-600 justify-between rounded-xl items-center relative z-10">
          <div className="flex items-center">
            <div
              className="bg-grey-900 p-[6px] rounded-xl hover:cursor-pointer"
              onClick={() => setExpanded(0)}
            >
              <ServersIcon server={server} hovered={false} />
            </div>
            <div className="ml-3">
              <div className="text-lg tracking-wide font-bold max-w-[12ch] overflow-hidden hover:overflow-visible">
                <OverflowMarquee content={server.name} maxLength={10} />
              </div>
              <ServerMemberStats server={server} />
            </div>
          </div>
          <div
            onMouseEnter={() => setIsSettingsHovered(true)}
            onMouseLeave={() => setIsSettingsHovered(false)}
            className="hover:cursor-pointer"
            data-tooltip-id="serverSettings"
            data-tooltip-place="right"
          >
            <VerticalSettingsIcon hovered={isSettingsHovered} />
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
                  joinVideoChannel(e, channel);
                }

                else {
                  joinTextChannel(e, channel);
                }
              }}
              key={channel.channel_id}
            >
              <div className="w-auto">
                {channel && channel.is_media ? (
                  <div className="flex flex-col">
                    <div className="flex flex-row items-center">
                      <ChannelMediaIcon />
                      <ChannelName {...channel} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row items-center">
                    <ChannelMessageIcon />
                    <ChannelName {...channel} />
                  </div>
                )}
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
              <OverflowMarquee content={server.name} maxLength={10} />
            </div>
            <ServerMemberStats server={server} />
          </div>
        </div>
        <div></div>
      </div>
    </div>
  );
}
