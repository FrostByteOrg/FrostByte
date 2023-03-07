import VerticalSettingsIcon from '@/components/icons/VerticalSettingsIcon';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useChannelIdSetter, useChatNameSetter, useOnlinePresenceRef } from '@/context/ChatCtx';
import { getChannelsInServer } from '@/services/channels.service';
import ServersIcon from '../icons/ServersIcon';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import styles from '@/styles/Servers.module.css';
import Marquee from 'react-fast-marquee';
import { getServerMemberCount, getUsersInServer } from '@/services/server.service';

export default function Server({
  server,
  expanded,
}: {
  server: any;
  expanded: number;
}) {
  const expand = expanded == server.server_id;
  const supabase = useSupabaseClient();
  const setChannelId = useChannelIdSetter();
  const setChatName = useChatNameSetter();
  const [ memberCount, setMemberCount ] = useState(0);
  const [ onlineCount, setOnlineCount ] = useState(0);
  const onlinePresenceChannel = useOnlinePresenceRef();

  const [isChannelHovered, setIsChannelHovered] = useState(false);
  const [isServerHovered, setIsServerHovered] = useState(false);

  //TODO: getChannelsInServer
  const [channels, setChannels] = useState<any>([]);

  useEffect(() => {
    const handleAsync = async () => {
      if (server) {
        const { data } = await getChannelsInServer(supabase, server.server_id);
        setChannels(data);
      }

      // Total Members
      setMemberCount(await getServerMemberCount(supabase, server.server_id));

      // Now we need to get the online count
      const { data: onlineData, error } = await getUsersInServer(supabase, server.server_id);

      let onlineUsers = 0;
      if (!error) {
        for (const profile of onlineData) {
          // @ts-expect-error PostgrestResponseSuccess<Profile> incorrectly assumes that the data is an array of arrays
          if (onlinePresenceChannel.presenceState()[profile.id] !== undefined) {
            onlineUsers++;
          }
        }
        setOnlineCount(onlineUsers);
      }

    };
    handleAsync();
  }, [server, supabase, onlinePresenceChannel]);

  function joinChannel(e: SyntheticEvent, channelId: number, name: string) {
    e.stopPropagation();
    setChatName(name);
    setChannelId(channelId);
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
              <div className="text-lg tracking-wide font-bold max-w-[12ch] overflow-hidden hover:overflow-visible">
                {server.servers.name.length > 10 ? (
                  <span
                    onMouseEnter={() => setIsServerHovered(true)}
                    onMouseLeave={() => setIsServerHovered(false)}
                  >
                    {isServerHovered ? (
                      <Marquee
                        play={isServerHovered}
                        direction={'left'}
                        gradient={false}
                      >
                        {`${server.servers.name}\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`}
                      </Marquee>
                    ) : (
                      `${server.servers.name.slice(0, 11)}...`
                    )}
                  </span>
                ) : (
                  server.servers.name
                )}
              </div>
              <div
                className={`text-xs tracking-wide text-grey-300  ${styles.flexDirection}`}
              >
                <div className="flex items-center">
                  <span className="p-1 bg-green-300 rounded-full mr-1"></span>
                  <span>{onlineCount} Online</span>
                </div>
                <div
                  className={`flex items-center ml-2 ${styles.membersSpacing}`}
                >
                  <span className="p-1 bg-grey-300 rounded-full mr-1"></span>
                  <span>
                    {memberCount} Member{memberCount !== 1 ? 's' : ''}
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
              <div className="w-4">
                <ChannelMessageIcon size="" />
              </div>

              <div className="ml-2 text-sm font-semibold tracking-wide text-grey-200 max-w-[10ch] overflow-hidden hover:overflow-visible">
                {channel.name.length > 10 ? (
                  <span
                    onMouseEnter={() => setIsChannelHovered(true)}
                    onMouseLeave={() => setIsChannelHovered(false)}
                  >
                    {isChannelHovered ? (
                      <Marquee
                        play={isChannelHovered}
                        direction={'left'}
                        gradient={false}
                      >
                        {`${channel.name}\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`}
                      </Marquee>
                    ) : (
                      `${channel.name.slice(0, 9)}...`
                    )}
                  </span>
                ) : (
                  channel.name
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
      <div className="border-b-2 border-grey-700 py-2 px-3 flex justify-between hover:bg-grey-700 hover:rounded-xl items-center">
        <div className="flex items-center">
          <div className={`${styles.serverIcon}  p-2 rounded-xl`}>
            <ServersIcon hovered={false} server={server.servers} />
          </div>
          <div className="ml-3">
            <div className="text-lg tracking-wide font-bold max-w-[12ch] overflow-hidden hover:overflow-visible">
              {server.servers.name.length > 10 ? (
                <span
                  onMouseEnter={() => setIsServerHovered(true)}
                  onMouseLeave={() => setIsServerHovered(false)}
                >
                  {isServerHovered ? (
                    <Marquee
                      play={isServerHovered}
                      direction={'left'}
                      gradient={false}
                    >
                      {`${server.servers.name}\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`}
                    </Marquee>
                  ) : (
                    `${server.servers.name.slice(0, 11)}...`
                  )}
                </span>
              ) : (
                server.servers.name
              )}
            </div>
            <div
              className={`text-xs tracking-wide text-grey-300  ${styles.flexDirection}`}
            >
              <div className="flex items-center">
                <span className="p-1 bg-green-300 rounded-full mr-1 "></span>
                <span>{onlineCount} Online</span>
              </div>
              <div
                className={`flex items-center ml-2 ${styles.membersSpacing}`}
              >
                <span className="p-1 bg-grey-300 rounded-full mr-1"></span>
                <span>{memberCount} Member{memberCount !== 1 ? 's' : ''}</span>
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
