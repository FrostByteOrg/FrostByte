import { useSideBarOptionSetter } from '@/context/SideBarOptionCtx';
import { getOrCreateDMChannel } from '@/lib/DMChannelHelper';
import { useChannel, useDMChannels, useServerRoles, useSetChannel, useUserHighestRolePosition, useUserServerPerms } from '@/lib/store';
import { createMessage } from '@/services/message.service';
import { Role, ServerUser, User } from '@/types/dbtypes';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { memo, useEffect, useState, } from 'react';
import UserIcon from '../icons/UserIcon';
import { SearchBar } from './Styles';
import { ServerPermissions } from '@/types/permissions';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { getHighestRolePositionForUser, grantRoleToUser, revokeRoleFromUser } from '@/services/roles.service';
import { toast } from 'react-toastify';
import { XIcon } from '@/components/icons/XIcon';

// TODO: Once DMs are implemented, this component will need to be updated to handle DMs as well.
function WrappedComponent({
  profile,
  server_user,
  roles,
}: {
  profile: User;
  server_user: ServerUser;
  roles: Role[];
}) {
  const user = useUser();
  const supabase = useSupabaseClient();
  const dmChannels = useDMChannels();
  const setChannel = useSetChannel();
  const setSideBarOption = useSideBarOptionSetter();
  const userServerPerms = useUserServerPerms();
  const channel = useChannel();
  const serverRoles = useServerRoles(channel!.server_id!);

  // HACK: Workaround for the weird state bug where the user's max role is not correct
  const [ maxRole, setMaxRole ] = useState<number>(30676);
  const userHighestRole = maxRole; // useUserHighestRolePosition();
  useEffect(() => {
    async function handleAsync() {
      if (!channel?.server_id || !user?.id) return;

      const { data, error } = await getHighestRolePositionForUser(supabase, channel!.server_id, user?.id!);
      if (error) {
        console.log(error);
        return;
      }

      else {
        setMaxRole(data);
      }
    }

    handleAsync();
  }, [supabase, user?.id, maxRole, channel]);

  const filteredRoles = serverRoles
    .filter(
      role => (
        role.position > userHighestRole
        && role.position !== serverRoles.length - 1
        && !roles.some(r => r.id === role.id)
      )
    )
    .sort((a, b) => a.position - b.position);


  console.log({
    userHighestRole,
  });

  return (
    <div className="flex flex-col space-y-2 items-center p-3">
      <UserIcon user={profile} className="!w-9 !h-9" />
      {server_user.nickname && (
        <h2 className="text-lg">{server_user.nickname}</h2>
      )}
      <h2 className={server_user.nickname ? 'text-base' : 'text-lg'}>
        {profile.username}
      </h2>
      <hr />
      <h2 className="text-sm text-gray-400 text-left w-full">Roles</h2>

      <div className="flex flex-col w-full items-center space-y-1">
        {roles.map((role) => (
          <span
            key={role.id}
            className="text-sm text-gray-400 py-1 px-2 border-2 border-solid w-full rounded-sm flex flex-row items-center"
            style={{
              border: `1px solid #${!!role.color ? role.color : 'cacacacc'}`,
              color: `#${!!role.color ? role.color : 'cacacacc'}`,
            }}
          >
            <p className="flex-grow">{role.name}</p>
            {(userServerPerms & ServerPermissions.MANAGE_ROLES && role.position > userHighestRole && role.position !== serverRoles.length - 1) && (
              <button
                type="button"
                className="align-middle self-end"
                style={{
                  fill: `#${!!role.color ? role.color : 'cacacacc'}`,
                }}
                onClick={async () => {
                  const { error } = await revokeRoleFromUser(
                    supabase,
                    role.id,
                    server_user.id,
                  );

                  if (error) {
                    console.error(error);
                    toast.error('Failed to revoke role from user');
                    return;
                  }

                  toast.success('Role revoked from user');
                }}
              >
                <XIcon className="w-4 h-4" />
              </button>
            )}
          </span>
        ))}

        {((userServerPerms & ServerPermissions.MANAGE_ROLES) && filteredRoles.length > 0) && (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              asChild
            >
              <button
                type="button"
                className="text-sm text-gray-400 py-1 px-2 border-2 border-solid w-full rounded-sm text-center"
                style={{
                  border: '1px solid #cacacacc'
                }}
              >
                +
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              side="right"
              className="ContextMenuContent"
            >
              {filteredRoles.map((role) => (
                <DropdownMenu.Item
                  key={role.id}
                  className="ContextMenuItem"
                  style={{
                    color: `#${!!role.color ? role.color : 'cacacacc'}`,
                  }}
                  onSelect={async () => {
                    const { error } = await grantRoleToUser(
                      supabase,
                      role.id,
                      server_user.id,
                    );

                    if (error) {
                      console.error(error);
                      toast.error('Failed to grant role to user');
                      return;
                    }

                    toast.success('Role granted to user');
                  }}
                >
                  {role.name}
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        )}
      </div>
      <hr />
      {profile.id !== user?.id && (<form>
        <input
          type="text"
          className={`${SearchBar('bg-grey-900')}`}
          placeholder={`Message ${profile.username}`}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const dmChannel = await getOrCreateDMChannel(
                supabase,
                profile,
                dmChannels
              );

              if (dmChannel) {
                await createMessage(
                  supabase,
                  {
                    content: (e.target as HTMLInputElement).value,
                    channel_id: dmChannel.channel_id,
                    profile_id: user!.id,
                  }
                );

                setSideBarOption('friends');
                setChannel(dmChannel);
              }
            }
          }}
        />
      </form>)}
    </div>
  );
}

export const MiniProfile = memo(WrappedComponent);
