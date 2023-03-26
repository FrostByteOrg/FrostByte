import { Role, ServerUser, User } from '@/types/dbtypes';
import { Tooltip } from 'react-tooltip';
import { MiniProfile } from '../forms/MiniProfile';
import UserIcon from '../icons/UserIcon';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { acceptFriendRequest, removeFriendOrRequest, sendFriendRequest } from '@/services/friends.service';
import { useChannel, useDMChannels, useRelations, useSetChannel } from '@/lib/store';
import { createDM } from '@/services/directmessage.service';
import { getOrCreateDMChannel } from '@/lib/DMChannelHelper';
import { useSideBarOptionSetter } from '@/context/SideBarOptionCtx';

export function MessageHeader({
  profile,
  server_user,
  message_color,
  display_time,
  edited,
  roles,
}: {
  profile: User;
  server_user: ServerUser;
  message_id: number;
  message_color: string;
  display_time: string;
  edited: boolean;
  roles: Role[];
}) {
  const currentUser = useUser();
  const supabase = useSupabaseClient();
  const relation = useRelations().find((relation) => relation.target_profile.id === profile.id);
  const setChannel = useSetChannel();
  const _currentChannel = useChannel();
  const directMessages = useDMChannels();
  const setSideBarOption = useSideBarOptionSetter();

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div className="flex-grow flex flex-row">
          <Tooltip
            id={profile.id}
            className="z-20 !w-12 !opacity-100 "
            style={{ backgroundColor: '#21282b', borderRadius: '0.5rem' }}
            clickable
            noArrow
          >
            <MiniProfile
              profile={profile}
              server_user={server_user}
              roles={roles}
            />
          </Tooltip>
          <UserIcon user={profile} />
          <div className="flex-grow flex items-center">
            <div
              className="text-xl font-semibold tracking-wider mr-2"
              data-tooltip-id={profile.id}
              style={{
                // Check for the first role that has a non-null color and use that
                color: message_color,
              }}
            >
              {server_user.nickname || profile.username}
            </div>
            <div className="text-xs tracking-wider text-grey-300 mt-1">
              {display_time}{' '}
              {edited && <span className="text-gray-400">(edited)</span>}
            </div>
          </div>
        </div>
      </ContextMenu.Trigger>
      { currentUser?.id !== profile.id && (
        <ContextMenu.Content className='ContextMenuContent'>
          <ContextMenu.Item
            className='ContextMenuItem'
            onClick={() => {
              sendFriendRequest(supabase, profile.id);
            }}
            hidden={!!relation}
          >
            Send friend request
          </ContextMenu.Item>
          <ContextMenu.Item
            className='ContextMenuItem'
            onClick={() => {
              // NOTE: Since this is only shown if a relation exists, therefore we can assume relation is not undefined
              acceptFriendRequest(supabase, relation!.id);
            }}
            hidden={!relation || relation.relationship !== 'friend_requested' || relation.initiator_profile_id === currentUser?.id}
          >
            Accept friend request
          </ContextMenu.Item>
          <ContextMenu.Item
            className='ContextMenuItem'
            onClick={() => {
              // NOTE: Since this is only shown if a relation exists, therefore we can assume relation is not undefined
              removeFriendOrRequest(supabase, relation!.id);
            }}
            hidden={!relation}
          >
            {
              relation && relation.relationship === 'friend_requested' ?
                (relation.initiator_profile_id === currentUser?.id ? 'Cancel friend request' : 'Reject friend request')
                : 'Remove friend'
            }
          </ContextMenu.Item>
          <ContextMenu.Item
            className='ContextMenuItem'
            onClick={async () => {
              await getOrCreateDMChannel(
                supabase,
                profile,
                directMessages,
                setChannel
              );

              setSideBarOption('friends');
            }}
            hidden={directMessages.get(profile.id) && directMessages.get(profile.id)!.channel_id === _currentChannel?.channel_id}
          >
            Message {profile.username}
          </ContextMenu.Item>
        </ContextMenu.Content>
      )}
    </ContextMenu.Root>
  );
}
