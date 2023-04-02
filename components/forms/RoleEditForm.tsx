import { useUserServerPerms } from '@/lib/store';
import { createRole, decrementRolePosition, deleteRole, incrementRolePosition, updateRole } from '@/services/roles.service';
import { Role, Server } from '@/types/dbtypes';
import { ServerPermissions } from '@/types/permissions';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useForm } from 'react-hook-form';

const permissionEnumToNameMap = new Map([
  [ServerPermissions.OWNER, 'Owner'],
  [ServerPermissions.ADMINISTRATOR, 'Administrator'],
  [ServerPermissions.MANAGE_CHANNELS, 'Manage Channels'],
  [ServerPermissions.MANAGE_ROLES, 'Manage Roles'],
  [ServerPermissions.MANAGE_SERVER, 'Manage Server'],
  [ServerPermissions.MANAGE_CHANNELS, 'Manage Channels'],
  [ServerPermissions.MANAGE_USERS, 'Manage Users'],
  [ServerPermissions.MANAGE_ROLES, 'Manage Roles'],
  [ServerPermissions.MANAGE_MESSAGES, 'Manage Messages'],
  [ServerPermissions.MANAGE_INVITES, 'Manage Invites'],
  [ServerPermissions.CREATE_INVITES, 'Create Invites'],
]);

type RoleEditFormResult = {
  name: string;
  position: number;
  permissions: string | string[];
  color: string;
}

export function RoleEditForm({role, server, roles_length }: {role: Role, server: Server, roles_length: number }) {
  const { register, handleSubmit, formState: { errors } } = useForm<RoleEditFormResult>();

  const supabase = useSupabaseClient();
  const isFormDisabled = (role && role.is_system) || false;
  const serverPermissions = Object.entries(ServerPermissions).filter(
    ([key, value]) => typeof value === 'number' && key !== 'NONE' && key !== 'OWNER'
  );

  const onSubmit = async (formData: RoleEditFormResult) => {
    if (typeof formData.permissions === 'string') {
      formData.permissions = [formData.permissions];
    }

    const perms = formData.permissions.reduce((acc, cur) => acc | parseInt(cur), 0);

    console.log({
      ...formData,
      name: formData.name,
      permissions: perms,
      id: role.id
    });

    // If a role is being edited, update it
    const { data, error } = await updateRole(
      supabase,
      role.id,
      formData.name,
      role.position,
      perms,
      formData.color.replace('#', '')
    );

    if (error) {
      console.error(error);
    }
  };

  const userPerms = useUserServerPerms();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <p className="text-base text-gray-400 text-left w-full">Display</p>
      <div className="w-full space-x-2 mb-2 flex flex-row">
        <input
          type="text"
          className="text-xl rounded-md h-7 p-2"
          disabled={isFormDisabled}
          defaultValue={role.name}
          placeholder='Role Name'
          {...register('name', { required: true })}
        />

        <input
          type="color"
          className="rounded-md h-7"
          disabled={isFormDisabled}
          defaultValue={`#${(role.color || 'a9aaab')}`}
          {...register('color', { required: true })}
        />
      </div>
      <p className="text-base text-gray-400 text-left w-full">Heirarchy position</p>
      <div className="flex flex-row space-x-2">
        <button
          className="border-2 border-gray-400 rounded-md h-6 w-full mt-2 disabled:border-grey-800"
          type="button"
          onClick={async () => {
            console.log('up');
            await incrementRolePosition(supabase, role.id);
          }}
          disabled={isFormDisabled || role.position === 1}
        >
          Up
        </button>
        <button
          className="border-2 border-gray-400 rounded-md h-6 w-full mt-2 disabled:border-grey-800"
          type="button"
          onClick={async () => {
            console.log('down');
            await decrementRolePosition(supabase, role.id);
          }}
          disabled={isFormDisabled || role.position === roles_length - 2}
        >
          Down
        </button>
      </div>
      <p className="text-base text-gray-400 text-left w-full">Permissions</p>
      {serverPermissions.map(([permission, value]) => (
        <div key={permission}>
          <input
            type="checkbox"
            className="w-5 h-5"
            value={value}
            defaultChecked={(
              !role
              // @ts-expect-error permission is always a keyof ServerPermissions. This error will never be thrown
              || (role.permissions & value as number) === ServerPermissions[permission]
            )}
            disabled={
              isFormDisabled
              || ((userPerms & value as number) === 0)
              || (permission === 'OWNER')
              || (permission === 'ADMINISTRATOR' && (userPerms & 2) !== 2)
            }
            {...register('permissions')}
          />
          {/* @ts-expect-error permission is always a keyof ServerPermissions. This error will never be thrown */}
          <label> {permissionEnumToNameMap.get(ServerPermissions[permission])}</label>
        </div>
      ))}
      <div className="flex flex-row space-x-2">
        <button
          className="bg-red-500 hover:bg-red-700 disabled:bg-red-900 rounded-md h-6 w-8 mt-2"
          type="button"
          disabled={isFormDisabled}
          onClick={async () => {
            console.log('delete role');
            deleteRole(supabase, role.id);
          }}
        >
          Delete
        </button>
        <button
          className="bg-green-500 hover:bg-green-700 disabled:bg-green-900 rounded-md h-6 w-8 mt-2"
          disabled={isFormDisabled}
          type="submit"
        >
          Save
        </button>
      </div>
    </form>
  );
}
