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
import { useUser } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styles from '@/styles/Servers.module.css';
import { Channel, Server as ServerType } from '@/types/dbtypes';
import { ServerMemberStats } from './ServerMemberStats';
import { OverflowMarquee } from './OverflowMarquee';
import {
  useChannel,
  useServerUserProfilePermissions,
  useSetChannel,
} from '@/lib/store';
import { ChannelMediaIcon } from '../icons/ChannelMediaIcon';
import ChannelName from './ChannelName';
import { ChannelListItem } from '@/components/home/ChannelListItem';
import ServerSettingsModal from '@/components/home/modals/ServerSettingsModal';
import AddChannelModal from '@/components/home/modals/AddChannelModal';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ServerPermissions } from '@/types/permissions';
import PlusIcon from '@/components/icons/PlusIcon';
import GearIcon from '@/components/icons/GearIcon';
import { deleteServer, leaveServer } from '@/services/server.service';
import TrashIcon from '@/components/icons/TrashIcon';
import { LeaveIcon } from '@/components/icons/LeaveIcon';
import { memo } from 'react';

export default function Server({
  server,
  expanded,
  isLast = false,
  setExpanded,
}: {
  server: ServerType;
  expanded: number;
  isLast?: boolean;
  setExpanded: () => void;
}) {
  const expand = expanded == server.id;
  const supabase = createClientComponentClient();
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const currentChannel = useChannel();

  const [showServerSettingsModal, setShowServerSettingsModal] = useState(false);
  const [showAddChannelModal, setShowAddChannelModal] = useState(false);

  const user = useUser();
  const serverPermissions = useServerUserProfilePermissions(
    server.id,
    user?.id!
  );
  useEffect(() => {
    const handleAsync = async () => {
      if (server && expanded > 0) {
        const { data } = await getChannelsInServer(supabase, server.id);
        if (data) {
          if (Array.isArray(data)) {
            setChannels(data!);
          }
          else {
            setChannels([data!]);
          }
        }
      }
    };
    handleAsync();
  }, [expanded, server, supabase]);

  const showServerSettingsOption =
    (serverPermissions & ServerPermissions.MANAGE_INVITES) > 0 ||
    (serverPermissions & ServerPermissions.MANAGE_ROLES) > 0 ||
    (serverPermissions & ServerPermissions.MANAGE_USERS) > 0 ||
    (serverPermissions & ServerPermissions.MANAGE_SERVER) > 0;

  const showAddChannelOption =
    (serverPermissions & ServerPermissions.MANAGE_CHANNELS) > 0;

  if (expand) {
    return (
      <div className="relative overflow-x-visible">
        <ServerSettingsModal
          showModal={showServerSettingsModal}
          setShowModal={setShowServerSettingsModal}
          server={server}
        />
        <AddChannelModal
          showModal={showAddChannelModal}
          setShowModal={setShowAddChannelModal}
          serverId={expanded}
        />
        <div className="border-b-2 border-grey-700 py-2 px-3 flex bg-grey-600 justify-between rounded-xl items-center relative z-10">
          <div className="flex items-center">
            <div
              className="bg-grey-900 p-[6px] rounded-xl hover:cursor-pointer"
              onClick={setExpanded}
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
          <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
              <div
                onMouseEnter={() => setIsSettingsHovered(true)}
                onMouseLeave={() => setIsSettingsHovered(false)}
                className="hover:cursor-pointer"
              >
                <VerticalSettingsIcon hovered={isSettingsHovered} />
              </div>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="ContextMenuContent" side="right">
                {showAddChannelOption && (
                  <DropdownMenu.Item
                    asChild
                    className="flex justify-center items-center hover:text-grey-300 cursor-pointer"
                    onClick={() => {
                      setShowAddChannelModal(true);
                    }}
                  >
                    <div className="flex flex-row w-full">
                      <PlusIcon width={5} height={5} />
                      <span className="ml-2 w-full">New channel</span>
                    </div>
                  </DropdownMenu.Item>
                )}
                {showServerSettingsOption && (
                  <DropdownMenu.Item
                    asChild
                    className="flex justify-center items-center hover:text-grey-300 cursor-pointer"
                    onClick={() => {
                      setShowServerSettingsModal(true);
                    }}
                  >
                    <div className="flex flex-row w-full">
                      <GearIcon width={5} height={5} />
                      <span className="ml-2 w-full">Server Settings</span>
                    </div>
                  </DropdownMenu.Item>
                )}

                {(showAddChannelOption || showServerSettingsOption) && (
                  <DropdownMenu.Separator className="ContextMenuSeparator" />
                )}
                {(serverPermissions & 1) === 0 && (
                  <DropdownMenu.Item
                    asChild
                    className="flex justify-center items-center text-red-500 hover:text-grey-300 cursor-pointer"
                    onClick={async () => {
                      // TODO: Add confirmation modal
                      await leaveServer(supabase, user!.id, server.id);
                    }}
                  >
                    <div className="flex flex-row w-full">
                      <LeaveIcon className="!w-5 !h-5" />
                      <span className="ml-2 w-full">Leave Server</span>
                    </div>
                  </DropdownMenu.Item>
                )}
                {(serverPermissions & 1) === 1 && (
                  <DropdownMenu.Item
                    asChild
                    className="flex justify-center items-center text-red-500 hover:text-grey-300 cursor-pointer"
                    onClick={async () => {
                      // TODO: Add confirmation modal
                      await deleteServer(supabase, server.id);
                    }}
                  >
                    <div className="flex flex-row w-full">
                      <TrashIcon />
                      <span className="ml-2 w-full">Delete Server</span>
                    </div>
                  </DropdownMenu.Item>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
        <div className="channels bg-grey-700 rounded-lg relative -top-3 py-4  px-7 ">
          {channels.map((channel: Channel, idx: number) => (
            <ChannelListItem
              channel={channel}
              idx={idx}
              key={channel.channel_id}
            />
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
