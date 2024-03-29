import Modal from '@/components/home/modals/Modal';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Server, ServersForUser } from '@/types/dbtypes';
import { ServerPermissions } from '@/types/permissions';
import * as Tabs from '@radix-ui/react-tabs';
import 'styles/TabNav.module.css';
import { RoleEditForm } from '@/components/forms/RoleEditForm';
import {
  useGetServers,
  useServerRoles,
  useServerUserProfileHighestRolePosition,
  useServerUserProfilePermissions,
} from '@/lib/store';
import PlusIcon from '@/components/icons/PlusIcon';
import { createRole } from '@/services/roles.service';
import { toast } from 'react-toastify';
import { ServerBansList } from '@/components/home/ServerBansList';
import { ServerInviteList } from '@/components/home/ServerInviteList';
import AddServerModal from './AddServerModal';
import { useForm } from 'react-hook-form';
import { CreateServerInput, createServerSchema } from '@/types/client/server';
import { zodResolver } from '@hookform/resolvers/zod';
import MutateServer from '@/components/forms/MutateServer';
import { updateServer, updateServerIcon } from '@/services/server.service';
import { PostgrestError } from '@supabase/supabase-js';
import { XIcon } from '@/components/icons/XIcon';

const tabRootClass = 'flex flex-row';
const tabListClass = 'flex flex-col flex-shrink border-r border-gray-600';
const tabTriggerClass =
  'px-3 py-2 aria-[selected=true]:border-r aria-[selected=true]:border-r-white focus:z-10 aria-[selected=true]:outline-none focus-visible:ring text-left aria-[selected=true]:bg-gray-500';
const tabContentClass = 'flex flex-col';

//TODO: add a 'delete server' button at the bottom of the overview section. Make this functionallity similar
//to github delete repo i.e. prompt a modal and have the user spell out the servername and confirm the deletion

export default function ServerSettingsModal({
  showModal,
  setShowModal,
  server,
}: {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  server: Server | null;
}) {
  const [serverImage, setServerImage] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string>('');
  const [showDesc, setSetShowDesc] = useState<boolean>(false);

  const modalRef = useRef<HTMLDialogElement>(null);
  const supabase = createClientComponentClient();
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

  const getServers = useGetServers();

  const {
    register,
    handleSubmit,
    formState,
    formState: { errors },
  } = useForm<CreateServerInput>({
    resolver: zodResolver(createServerSchema),
    mode: 'onChange',
    defaultValues: {
      name: server?.name,
      description: server?.description as string | undefined,
    },
  });

  const onSubmit = async (formData: CreateServerInput) => {
    const { data, error } = await updateServer(
      supabase,
      server!.id,
      formData.name,
      formData.description as string | null
    );

    if (error) {
      if ((error as PostgrestError).message) {
        setServerError((error as PostgrestError).message);
      }
      else {
        setServerError(error as unknown as string);
      }

      setTimeout(() => {
        setServerError('');
      }, 7000);
      return;
    }

    const fileExt = serverImage?.name.split('.').pop();
    const fileName = `${data?.id}.${fileExt}`;
    const filePath = `${fileName}?updated=${Date.now()}`;

    if (serverImage) {
      const { data: updatedServer, error: serverImgError } =
        await updateServerIcon(supabase, filePath, serverImage, data!.id);

      if (serverImgError) {
        setServerError(serverImgError.message);
        setTimeout(() => {
          setServerError('');
        }, 7000);
        return;
      }
      if (updatedServer) {
        getServers(supabase, user?.id!);
      }
    }
    toast.success('Server updated successfully', {
      position: 'top-right',
      autoClose: 3000,
      className: 'bg-blue-500',
    });
  };

  return (
    <Modal
      modalRef={modalRef}
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
      closeBtn={
        <div
          className="font-light hover:cursor-pointer"
          onClick={() => {
            modalRef.current?.close();
            setShowModal(false);
          }}
        >
          <XIcon className="fill-white" />
        </div>
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
          <Tabs.Content
            value="Overview"
            className={`${tabContentClass} justify-center items-center`}
          >
            <div className="flex flex-col ">
              <MutateServer
                serverImage={serverImage}
                setServerImage={setServerImage}
                register={register}
                errors={errors}
                serverError={serverError}
                showDesc={showDesc}
                setShowDesc={setSetShowDesc}
                server={server}
                handleSubmit={handleSubmit}
                setServerError={setServerError}
                type={'edit'}
              />

              <div className="flex ml-6">
                <div
                  className={`${
                    formState.isSubmitting
                      ? 'bg-gray-500'
                      : 'bg-frost-500 hover:cursor-pointer hover:bg-frost-700'
                  } py-2 px-5 rounded-lg `}
                  onClick={() => {
                    if (!formState.isSubmitting) {
                      handleSubmit(onSubmit)();
                    }
                  }}
                >
                  Update
                </div>
              </div>
            </div>
          </Tabs.Content>
          <Tabs.Content value="Roles" className={`${tabContentClass} `}>
            <span className="w-full flex flex-row">
              <h1 className="text-2xl p-2 flex-grow">Roles</h1>
              <div
                className="flex justify-center items-center hover:text-gray-400 hover:cursor-pointer"
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
                <p className="mr-1 font-light">New Role</p>

                <PlusIcon width={5} height={5} />
              </div>
            </span>

            <Tabs.Root className={`${tabRootClass} `} orientation="vertical">
              <Tabs.List
                className={`${tabListClass} h-14 overflow-y-auto overflow-x-clip`}
              >
                {roles
                  .sort((first, second) => first.position - second.position)
                  .map((role) => (
                    <Tabs.Trigger
                      key={role.id}
                      value={role.id.toString()}
                      className={`${tabListClass} p-2 `}
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
