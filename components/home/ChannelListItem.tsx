import ChannelName from '@/components/home/ChannelName';
import { ChannelMediaIcon } from '@/components/icons/ChannelMediaIcon';
import ChannelMessageIcon from '@/components/icons/ChannelMessageIcon';
import { useChannel, useServerUserProfilePermissions, useSetChannel } from '@/lib/store';
import { Channel } from '@/types/dbtypes';
import { SyntheticEvent, useState } from 'react';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { useUser } from '@supabase/auth-helpers-react';
import { ServerPermissions } from '@/types/permissions';
import CreateInviteModal from '@/components/home/modals/CreateInviteModal';

export function ChannelListItem({ channel, idx }: { channel: Channel, idx: number }) {
  const currentUser = useUser();
  const currentChannel = useChannel();
  const setChannel = useSetChannel();
  const currentUserPermissions = useServerUserProfilePermissions(channel.server_id, currentUser?.id!);
  const [showCreateInviteModal, setShowCreateInviteModal] = useState(false);

  function joinTextChannel(e: SyntheticEvent, channel: Channel) {
    e.stopPropagation();
    setChannel(channel);
  }

  function joinVideoChannel(e: SyntheticEvent, channel: Channel) {
    e.stopPropagation();
    setChannel(channel);
  }

  return (
    <div
      className={`${
        currentChannel?.channel_id == channel.channel_id
          ? 'bg-grey-600'
          : 'hover:bg-grey-600'
      } flex whitespace-nowrap items-center pt-2 pb-1 px-4 mt-1 hover:cursor-pointer rounded-lg max-w-[192px] ${
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
      <CreateInviteModal
        showModal={showCreateInviteModal}
        setShowModal={setShowCreateInviteModal}
        channel={channel}
      />
      <div className="w-auto">
        {channel && channel.is_media ? (
          <div className="flex flex-col">
            <div className="flex flex-row items-center">
              <ChannelMediaIcon />
              <ChannelName {...channel} />
            </div>
          </div>
        ) : (
          <ContextMenu.Root>
            <ContextMenu.Trigger
              disabled={
                (currentUserPermissions & ServerPermissions.CREATE_INVITES) === 0
              }
              asChild
            >
              <div className="flex flex-row items-center">
                <ChannelMessageIcon />
                <ChannelName {...channel} />
              </div>
            </ContextMenu.Trigger>
            <ContextMenu.Content className='ContextMenuContent'>
              <ContextMenu.Item
                className="ContextMenuItem"
                onSelect={() => {
                  console.log('Open invite modal using channel id', channel.channel_id);
                  setShowCreateInviteModal(true);
                }}
              >
                Create invite
              </ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Root>
        )}
      </div>
    </div>
  );
}
