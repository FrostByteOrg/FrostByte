import Modal from '@/components/home/modals/Modal';
import { Dispatch, SetStateAction, useRef } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { Server, ServersForUser } from '@/types/dbtypes';
import { ServerPermissions } from '@/types/permissions';
import * as Tabs from '@radix-ui/react-tabs';
import 'styles/TabNav.module.css';
import { RoleEditForm } from '@/components/forms/RoleEditForm';
import {
  useServerRoles,
  useServerUserProfileHighestRolePosition,
  useServerUserProfilePermissions,
} from '@/lib/store';
import PlusIcon from '@/components/icons/PlusIcon';
import { createRole } from '@/services/roles.service';
import { toast } from 'react-toastify';
import { ServerBansList } from '@/components/home/ServerBansList';
import { ServerInviteList } from '@/components/home/ServerInviteList';

const tabRootClass = 'flex flex-row';
const tabListClass = 'flex flex-col flex-shrink border-r border-gray-600';
const tabTriggerClass =
  'px-3 py-2 aria-[selected=true]:border-r aria-[selected=true]:border-r-white focus:z-10 aria-[selected=true]:outline-none focus-visible:ring text-left aria-[selected=true]:bg-gray-500';
const tabContentClass = 'flex flex-col';

export default function ServerSettingsModal({
  showModal,
  setShowModal,
  server,
}: {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  server: Server | null;
}) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const supabase = useSupabaseClient();
  const roles = useServerRoles(server?.id!);
  const user = useUser();
  const userServerPerms = useServerUserProfilePermissions(
    server?.id!,
    user?.id!
  );
  const maxRole = useServerUserProfileHighestRolePosition(
    server?.id!,
    user?.id!
  );

  return (
    <Modal
      modalRef={modalRef}
      size={'big'}
      showModal={showModal}
      title={`${server?.name} - Server Settings`}
      buttons={
        <button
          className="btn btn-primary"
          onClick={() => {
            modalRef.current?.close();
            setShowModal(false);
          }}
        >
          Close
        </button>
      }
    >
      <Tabs.Root className={tabRootClass} orientation="vertical">
        <Tabs.List className={tabListClass}>
          <Tabs.Trigger value="Overview" className={tabTriggerClass}>
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value="Roles"
            className={tabTriggerClass}
            disabled={(userServerPerms & ServerPermissions.MANAGE_ROLES) === 0}
          >
            Roles
          </Tabs.Trigger>
          <Tabs.Trigger
            value="Bans"
            className={tabTriggerClass}
            disabled={(userServerPerms & ServerPermissions.MANAGE_USERS) === 0}
          >
            Bans
          </Tabs.Trigger>
          <Tabs.Trigger
            value="Invites"
            className={tabTriggerClass}
            disabled={
              (userServerPerms & ServerPermissions.MANAGE_INVITES) === 0
            }
          >
            Invites
          </Tabs.Trigger>
        </Tabs.List>
        <div className="TabContent flex-grow flex-1 w-15 h-15 ">
          <Tabs.Content value="Overview" className={tabContentClass}>
            General server mgmt stuff
          </Tabs.Content>
          <Tabs.Content value="Roles" className={`${tabContentClass}`}>
            <span className="w-full flex flex-row">
              <h1 className="text-2xl p-2 flex-grow">Roles</h1>
              <button
                className=""
                onClick={async () => {
                  const { error } = await createRole(
                    supabase,
                    server?.id!,
                    'New Role',
                    roles.length - 1,
                    0,
                    'a9aaab'
                  );

                  if (error) {
                    console.error(error);
                    toast.error('Failed to create role');
                    return;
                  }

                  toast.success('Created role');
                }}
              >
                <PlusIcon width={5} height={5} />
              </button>
            </span>

            <Tabs.Root className={tabRootClass} orientation="vertical">
              <Tabs.List className={tabListClass}>
                {roles
                  .sort((first, second) => first.position - second.position)
                  .map((role) => (
                    <Tabs.Trigger
                      key={role.id}
                      value={role.id.toString()}
                      className={tabTriggerClass}
                      style={{
                        color: `#${role.color}`,
                      }}
                    >
                      {role.name}
                    </Tabs.Trigger>
                  ))}
              </Tabs.List>
              {roles
                .sort((first, second) => first.position - second.position)
                .map((role) => (
                  <Tabs.Content
                    key={role.id}
                    value={role.id.toString()}
                    className={`${tabContentClass} p-2`}
                  >
                    <RoleEditForm
                      role={role}
                      roles_length={roles.length}
                      max_role_position={maxRole}
                    />
                  </Tabs.Content>
                ))}
            </Tabs.Root>
          </Tabs.Content>
          <Tabs.Content value="Bans" className={tabContentClass}>
            <span className="w-full flex flex-row">
              <h1 className="text-2xl p-2 flex-grow">Bans</h1>
            </span>
            <div className="p-2">
              <ServerBansList serverId={server?.id!} />
            </div>
          </Tabs.Content>
          <Tabs.Content value="Invites" className={tabContentClass}>
            <span className="w-full flex flex-row">
              <h1 className="text-2xl p-2 flex-grow">Invites</h1>
            </span>
            <ServerInviteList server={server!} />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </Modal>
  );
}
