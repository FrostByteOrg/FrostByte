import AddServer from '@/components/forms/AddServer';
import Modal from '@/components/home/modals/Modal';
import { CreateServerInput, createServerSchema } from '@/types/client/server';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  createServer,
  addServerIcon,
  getServer,
} from '@/services/server.service';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { PostgrestError } from '@supabase/supabase-js';
import { Role, ServersForUser } from '@/types/dbtypes';
import { ServerPermissions } from '@/types/permissions';
import * as Tabs from '@radix-ui/react-tabs';
import 'styles/TabNav.module.css';
import { RoleEditForm } from '@/components/forms/RoleEditForm';
import { useUserServerPerms } from '@/lib/store';


const tabRootClass = 'w-15 flex flex-row';
const tabListClass = 'flex flex-col flex-shrink border-r border-gray-600';
const tabTriggerClass = 'px-3 py-2 focus:border-r focus:border-r-white focus:z-10 focus:outline-none focus-visible:ring text-left focus:bg-gray-500';
const tabContentClass = 'flex flex-col';

interface EnumIterator<T> {
  [key: string]: T
}

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

  const roleList: Role[] = [
    {
      id: 1,
      name: 'OWNER',
      color: 'bada55',
      permissions: 1,
      server_id: 1,
      is_system: true,
      created_at: new Date().toDateString(),
      position: 32767
    },
    {
      id: 3,
      name: 'Test Role',
      color: '0000ff',
      permissions: 1,
      server_id: 1,
      is_system: false,
      created_at: new Date().toDateString(),
      position: 32767
    },
    {
      id: 2,
      name: 'EVERYONE',
      color: 'cc3344',
      permissions: 256,
      server_id: 1,
      is_system: true,
      created_at: new Date().toDateString(),
      position: 0
    },
  ];

  return (
    <Modal
      modalRef={modalRef}
      showModal={showModal}
      title={`${server?.servers.name} Server Settings`}
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
          >
            Roles
          </Tabs.Trigger>
        </Tabs.List>
        <div className="TabContent flex-grow flex-1">
          <Tabs.Content value='Overview' className={tabContentClass}>
            General server mgmt stuff
          </Tabs.Content>
          <Tabs.Content value="Roles" className={tabContentClass}>
            <h1 className="text-2xl p-2">Roles</h1>
            <Tabs.Root className={tabRootClass} orientation='vertical'>
              <Tabs.List className={tabListClass}>
                {roleList.sort((first, second) => second.position - first.position).map((role) => (
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
              {roleList.sort((first, second) => second.position - first.position).map((role) => (
                <Tabs.Content
                  key={role.id}
                  value={role.id.toString()}
                  className={`${tabContentClass} p-2`}
                >
                  <RoleEditForm role={role} />
                </Tabs.Content>
              ))}
            </Tabs.Root>
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </Modal>
  );
}
