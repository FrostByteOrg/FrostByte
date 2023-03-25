import VerticalSettingsIcon from '@/components/icons/VerticalSettingsIcon';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { SyntheticEvent, useEffect, useState } from 'react';
import { useOnlinePresenceRef } from '@/context/ChatCtx';
import { getChannelsInServer } from '@/services/channels.service';
import ServersIcon from '../icons/ServersIcon';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import styles from '@/styles/Servers.module.css';
import Marquee from 'react-fast-marquee';
import {
  getServerMemberCount,
  getUsersInServer,
} from '@/services/server.service';
import { Channel, Server as ServerType, User } from '@/types/dbtypes';
import { useSetChannel, useCurrentRoomRef } from '@/lib/store';
import { ChannelMediaIcon } from '../icons/ChannelMediaIcon';
import ChannelName from './ChannelName';
import {  useParticipants, useConnectionState } from '@livekit/components-react';
import { Participant, ConnectionState} from 'livekit-client';


export default function Server({
  server,
  expanded,
  isLast = false,
}: {
  server: ServerType;
  expanded: number;
  isLast?: boolean;
}) {
  const participants = useParticipants();
  const expand = expanded == server.id;
  const supabase = useSupabaseClient();
  const [memberCount, setMemberCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const onlinePresenceChannel = useOnlinePresenceRef();
  const [isServerHovered, setIsServerHovered] = useState(false);

  const setChannel = useSetChannel();
  const currentRoom = useCurrentRoomRef();
  const connection = useConnectionState();

  //TODO: getChannelsInServer
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    const handleAsync = async () => {
      if (server) {
        const { data } = await getChannelsInServer(supabase, server.id);
        setChannels(data!);
      }

      // Total Members
      setMemberCount(await getServerMemberCount(supabase, server.id));


      // Now we need to get the online count
      const { data: onlineData, error } = await getUsersInServer(
        supabase,
        server.id
      );

      let onlineUsers = 0;
      if (!error) {
        for (const profile of onlineData) {
          if (onlinePresenceChannel.presenceState()[profile.id] !== undefined) {
            onlineUsers++;
          }
        }
        setOnlineCount(onlineUsers);
      }
    };
    handleAsync();
  }, [server, supabase, onlinePresenceChannel]);

  function joinTextChannel(e: SyntheticEvent, channel: Channel) {
    e.stopPropagation();
    setChannel(channel);
  }

  function joinVideoChannel(e: SyntheticEvent, channel: Channel){
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
                {server.name.length > 10 ? (
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
                        {`${server.name}\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`}
                      </Marquee>
                    ) : (
                      `${server.name.slice(0, 11)}...`
                    )}
                  </span>
                ) : (
                  server.name
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
                  <div className='flex flex-col'>
                    <div className='flex flex-row items-center'>
                      <ChannelMediaIcon />
                      <ChannelName {...channel} />
                    </div>
                    {currentParticipants.map((user: Participant, id: number, participants) => (
                      <div key={user.sid}>
                        {currentRoom !== channel.channel_id ? (<div> empty </div>) : (<div> {user.name} </div>) }
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className='flex flex-row items-center'>
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
              {server.name.length > 10 ? (
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
                      {`${server.name}\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`}
                    </Marquee>
                  ) : (
                    `${server.name.slice(0, 11)}...`
                  )}
                </span>
              ) : (
                server.name
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
    </div>
  );

}
