import { Role, ServerUser, ServerUserProfile, User } from '@/types/dbtypes';
import { Tooltip } from 'react-tooltip';
import { MiniProfile } from '../forms/MiniProfile';
import UserIcon from '../icons/UserIcon';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { acceptFriendRequest, removeFriendOrRequest, sendFriendRequest } from '@/services/friends.service';
import { useChannel, useDMChannels, useRelations, useServerUserProfile, useServerUserProfileRoles, useSetChannel } from '@/lib/store';
import { getOrCreateDMChannel } from '@/lib/DMChannelHelper';
import { useSideBarOptionSetter } from '@/context/SideBarOptionCtx';
import { useEffect, useState } from 'react';

export function MessageHeader({
  server_user_profile,
  display_time,
  edited,
}: {
  server_user_profile: ServerUserProfile;
  message_id: number;
  display_time: string;
  edited: boolean;
}) {
  const currentUser = useUser();
  const supabase = useSupabaseClient();
  const relation = useRelations().find((relation) => relation.target_profile.id === server_user_profile.id);
  const setChannel = useSetChannel();
  const _currentChannel = useChannel();
  const directMessages = useDMChannels();
  const setSideBarOption = useSideBarOptionSetter();
  const [ headerColor, setHeaderColor ] = useState<string>('white');

  useEffect(() => {
    const color = server_user_profile.roles
      .sort((a, b) => a.position - b.position)
      .filter((role) => role.color !== null);

    if (color.length > 0) {
      setHeaderColor(`#${color[0].color!}`);
    }
  }, [server_user_profile.roles]);

  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>
        <div className="flex-grow flex flex-row">
          <Tooltip
            id={server_user_profile.id}
            className="z-20 !w-12 !opacity-100 "
            style={{ backgroundColor: '#21282b', borderRadius: '0.5rem' }}
            clickable
            noArrow
            openOnClick
          >
            <MiniProfile server_user_profile={server_user_profile} />
          </Tooltip>
          <UserIcon user={server_user_profile} />
          <div className="flex-grow flex items-center">
            <div
              className="text-xl font-semibold tracking-wider mr-2"
              data-tooltip-id={server_user_profile.id}
              style={{
                // Check for the first role that has a non-null color and use that
                color: headerColor,
              }}
            >
              {server_user_profile.server_user.nickname || server_user_profile.username}
            </div>
            <div className="text-xs tracking-wider text-grey-300 mt-1">
              {display_time}{' '}
              {edited && <span className="text-gray-400">(edited)</span>}
            </div>
          </div>
        </div>
      </ContextMenu.Trigger>
      { currentUser?.id !== server_user_profile.id && (
        <ContextMenu.Content className='ContextMenuContent'>
          <ContextMenu.Item
            className='ContextMenuItem'
            onClick={() => {
              sendFriendRequest(supabase, server_user_profile.id);
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
              const dmChannel = await getOrCreateDMChannel(
                supabase,
                server_user_profile,
                directMessages
              );

              setSideBarOption('friends');
              setChannel(dmChannel);
            }}
            hidden={directMessages.get(server_user_profile.id) && directMessages.get(server_user_profile.id)!.channel_id === _currentChannel?.channel_id}
          >
            Message {server_user_profile.username}
          </ContextMenu.Item>
        </ContextMenu.Content>
      )}
    </ContextMenu.Root>
  );
}
