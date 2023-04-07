import { useSideBarOptionSetter } from '@/context/SideBarOptionCtx';
import { getOrCreateDMChannel } from '@/lib/DMChannelHelper';
import {
  useChannel,
  useDMChannels,
  useGetAllServerUserProfiles,
  useServerRoles,
  useServerUserProfileHighestRolePosition,
  useServerUserProfilePermissions,
  useSetChannel
} from '@/lib/store';
import { createMessage } from '@/services/message.service';
import { ServerUserProfile } from '@/types/dbtypes';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import UserIcon from '../icons/UserIcon';
import { SearchBar } from './Styles';
import { ServerPermissions } from '@/types/permissions';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { grantRoleToUser, revokeRoleFromUser } from '@/services/roles.service';
import { toast } from 'react-toastify';
import { XIcon } from '@/components/icons/XIcon';


export function MiniProfile({ server_user_profile }: { server_user_profile: ServerUserProfile }) {
  const user = useUser();
  const supabase = useSupabaseClient();
  const dmChannels = useDMChannels();
  const setChannel = useSetChannel();
  const setSideBarOption = useSideBarOptionSetter();
  const channel = useChannel();

  const serverRoles = useServerRoles(channel!.server_id!);
  const userHighestRole = useServerUserProfileHighestRolePosition(
    channel!.server_id,
    user!.id
  );
  const currentUserPerms = useServerUserProfilePermissions(
    channel!.server_id,
    user!.id
  );

  const getAllServerProfiles = useGetAllServerUserProfiles();

  const filteredRoles = serverRoles
    .filter(
      role => (
        server_user_profile.roles
        && role.position > userHighestRole
        && role.position !== serverRoles.length - 1
        && !server_user_profile.roles.some(r => r.id === role.id)
      )
    );

  return (
    <div className="flex flex-col space-y-2 items-center p-3">
      <UserIcon user={server_user_profile} className="!w-9 !h-9" />
      {server_user_profile.server_user?.nickname && (
        <h2 className="text-lg">{server_user_profile.server_user.nickname}</h2>
      )}
      <h2 className={server_user_profile.server_user?.nickname ? 'text-base' : 'text-lg'}>
        {server_user_profile.username}
      </h2>
      <hr />
      {server_user_profile.roles && (
        <>
          <h2 className="text-sm text-gray-400 text-left w-full">Roles</h2>
          <div className="flex flex-col w-full items-center space-y-1">
            {(server_user_profile.roles).map((role) => (
              <span
                key={role.id}
                className="text-sm text-gray-400 py-1 px-2 border-2 border-solid w-full rounded-sm flex flex-row items-center"
                style={{
                  border: `1px solid #${!!role.color ? role.color : 'cacacacc'}`,
                  color: `#${!!role.color ? role.color : 'cacacacc'}`,
                }}
              >
                <p className="flex-grow">{role.name}</p>
                {(
                  server_user_profile.server_user !== null
                  && (currentUserPerms & ServerPermissions.MANAGE_ROLES) === ServerPermissions.MANAGE_ROLES
                  && role.position > userHighestRole
                  && role.position !== serverRoles.length - 1
                ) && (
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
                        server_user_profile.server_user!.id,
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

            {(
              (currentUserPerms & ServerPermissions.MANAGE_ROLES) === ServerPermissions.MANAGE_ROLES
              && filteredRoles.length > 0
            ) && (
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
                          server_user_profile.server_user!.id,
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
        </>
      )}
      <hr />
      {server_user_profile.id !== user?.id && (<form>
        <input
          type="text"
          className={`${SearchBar('bg-grey-900')}`}
          placeholder={`Message ${server_user_profile.username}`}
          onKeyDown={async (e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              const dmChannel = await getOrCreateDMChannel(
                supabase,
                server_user_profile,
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

                getAllServerProfiles(supabase, dmChannel.server_id);
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
