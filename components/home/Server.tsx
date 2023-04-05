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
import { useChannel, useSetChannel } from '@/lib/store';
import { ChannelMediaIcon } from '../icons/ChannelMediaIcon';
import { Tooltip } from 'react-tooltip';
import ChannelName from './ChannelName';
import { ChannelListItem } from '@/components/home/ChannelListItem';

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
  const [channels, setChannels] = useState<Channel[]>([]);
  const currentChannel = useChannel();

  useEffect(() => {
    const handleAsync = async () => {
      if (server) {
        const { data } = await getChannelsInServer(supabase, server.id);
        setChannels(data!);
      }
    };
    handleAsync();
  }, [server, supabase]);

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
            <ChannelListItem channel={channel} idx={idx} key={channel.channel_id}/>
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
        }   py-2 px-3 flex justify-between ${
          currentChannel?.server_id == server.id
            ? 'bg-grey-700 rounded-xl'
            : 'hover:bg-grey-700 hover:rounded-xl'
        }   items-center`}
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
