import AddServer from '@/components/forms/AddServer';
import Modal from '@/components/home/modals/Modal';
import { CreateServerInput, createServerSchema } from '@/types/client/server';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  createServer,
  addServerIcon,
  getServer,
} from '@/services/server.service';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { PostgrestError } from '@supabase/supabase-js';
import { Role, ServersForUser } from '@/types/dbtypes';
import { ServerPermissions } from '@/types/permissions';
import * as Tabs from '@radix-ui/react-tabs';
import 'styles/TabNav.module.css';
import { RoleEditForm } from '@/components/forms/RoleEditForm';
import { useServerRoles, useUserServerPerms } from '@/lib/store';
import PlusIcon from '@/components/icons/PlusIcon';
import { createRole, getHighestRolePositionForUser } from '@/services/roles.service';
import { toast } from 'react-toastify';


const tabRootClass = 'flex flex-row';
const tabListClass = 'flex flex-col flex-shrink border-r border-gray-600';
const tabTriggerClass = 'px-3 py-2 focus:border-r focus:border-r-white focus:z-10 focus:outline-none focus-visible:ring text-left focus:bg-gray-500';
const tabContentClass = 'flex flex-col';

export default function ServerSettingsModal({
  showModal,
  setShowModal,
  server,
}: {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  server: ServersForUser | null;
}) {
  const modalRef = useRef<HTMLDialogElement>(null);
  const userServerPerms = useUserServerPerms();
  const supabase = useSupabaseClient();
  const roles = useServerRoles(server?.server_id!);
  const user = useUser();
  // HACK: Workaround for the weird state bug where the user's max role is not correct
  const [maxRole, setMaxRole] = useState<number>(30676);

  useEffect(() => {
    async function handleAsync() {
      const { data, error } = await getHighestRolePositionForUser(supabase, server!.server_id, user?.id!);
      if (error) {
        console.log(error);
        return;
      }

      else {
        setMaxRole(data);
      }
    }

    handleAsync();
  }, [server?.server_id, supabase, user?.id, maxRole, server]);
  return (
    <Modal
      modalRef={modalRef}
      showModal={showModal}
      title={`${server?.servers.name} - Server Settings`}
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
      <Tabs.Root className={tabRootClass} orientation='vertical'>
        <Tabs.List className={tabListClass}>
          <Tabs.Trigger
            value='Overview'
            className={tabTriggerClass}
          >
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger
            value='Roles'
            className={tabTriggerClass}
            disabled={(userServerPerms & ServerPermissions.MANAGE_ROLES) === 0}
          >
            Roles
          </Tabs.Trigger>
        </Tabs.List>
        <div className="TabContent flex-grow flex-1">
          <Tabs.Content value='Overview' className={tabContentClass}>
            General server mgmt stuff
          </Tabs.Content>
          <Tabs.Content value="Roles" className={tabContentClass}>
            <span className="w-full flex flex-row">
              <h1 className="text-2xl p-2 flex-grow">Roles</h1>
              <button
                className=""
                onClick={async () => {
                  const { error } = await createRole(
                    supabase,
                    server?.server_id!,
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

            <Tabs.Root className={tabRootClass} orientation='vertical'>
              <Tabs.List className={tabListClass} defaultValue={roles[0].id.toString()}>
                {roles.sort((first, second) => first.position - second.position).map((role) => (
                  <Tabs.Trigger
                    key={role.id}
                    value={role.id.toString()}
                    className={tabTriggerClass}
                    style={{
                      color: `#${role.color}`
                    }}
                  >
                    {role.name}
                  </Tabs.Trigger>
                ))}
              </Tabs.List>
              {roles.sort((first, second) => first.position - second.position).map((role) => (
                <Tabs.Content
                  key={role.id}
                  value={role.id.toString()}
                  className={`${tabContentClass} p-2`}
                >
                  <RoleEditForm role={role} roles_length={roles.length} max_role_position={maxRole}/>
                </Tabs.Content>
              ))}
            </Tabs.Root>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </Modal>
  );
}
