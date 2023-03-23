import { Role, ServerUser, User } from '@/types/dbtypes';
import { Tooltip } from 'react-tooltip';
import { MiniProfile } from '../forms/MiniProfile';
import UserIcon from '../icons/UserIcon';
import * as ContextMenu from '@radix-ui/react-context-menu';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { sendFriendRequest } from '@/services/friends.service';

export function MessageHeader({
  profile,
  server_user,
  message_id,
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
              // TODO: Use store to fetch relations and conditionally activate this
              sendFriendRequest(supabase, profile.id);
            }}
          >
            Send friend request
          </ContextMenu.Item>
          {/* <ContextMenu.Item className='ContextMenuItem'>
            Block {server_user.nickname || profile.username}
          </ContextMenu.Item> */}
        </ContextMenu.Content>
      )}
    </ContextMenu.Root>
  );
}
