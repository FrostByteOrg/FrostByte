import { useUserHighestRolePosition, useUserServerPerms } from '@/lib/store';
import { createRole, decrementRolePosition, deleteRole, incrementRolePosition, updateRole } from '@/services/roles.service';
import { Role, Server } from '@/types/dbtypes';
import { ServerPermissions } from '@/types/permissions';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useForm } from 'react-hook-form';

const permissionEnumToInfoMap = new Map([
  [ServerPermissions.OWNER, ['Owner', '']],
  [ServerPermissions.ADMINISTRATOR, ['Administrator', 'Grants all permissions in the server (assign this with caution!)']],
  [ServerPermissions.MANAGE_CHANNELS, ['Manage Channels', 'Allows the user to create, edit, and delete channels']],
  [ServerPermissions.MANAGE_ROLES, ['Manage Roles', 'Allows the user to create, edit, and delete roles']],
  [ServerPermissions.MANAGE_SERVER, ['Manage Server', 'Allows the user to edit server settings like name, descripion, and icon']],
  [ServerPermissions.MANAGE_USERS, ['Manage Users', 'Allows the user to kick and ban users']],
  [ServerPermissions.MANAGE_MESSAGES, ['Manage Messages', 'Allows the user to delete and pin messages']],
  [ServerPermissions.MANAGE_INVITES, ['Manage Invites', 'Allows the user to edit, and delete invites']],
  [ServerPermissions.CREATE_INVITES, ['Create Invites', 'Allows the user to create invites']],
]);

type RoleEditFormResult = {
  name: string;
  position: number;
  permissions: string | string[];
  color: string;
}

export function RoleEditForm({role, server, roles_length }: {role: Role, server: Server, roles_length: number }) {
  const { register, handleSubmit, formState: { errors } } = useForm<RoleEditFormResult>();
  const userHighestRolePosition = useUserHighestRolePosition();
  const supabase = useSupabaseClient();
  const isFormDisabled = role.is_system || role.position <= userHighestRolePosition;
  const userPerms = useUserServerPerms();

  console.log(userHighestRolePosition);
  const serverPermissions = Object.entries(ServerPermissions).filter(
    ([key, value]) => typeof value === 'number' && key !== 'NONE' && key !== 'OWNER'
  );

  const onSubmit = async (formData: RoleEditFormResult) => {
    console.log(formData);
    if (typeof formData.permissions === 'string') {
      formData.permissions = [ formData.permissions ];
    }

    else if (typeof formData.permissions === 'boolean') {
      formData.permissions = [ '0' ];
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
          disabled={isFormDisabled || role.position === 1 || role.position - 1 <= userHighestRolePosition}
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
        <div key={permission} className="flex flex-row w-full">
          <input
            type="checkbox"
            className="w-5 h-5 mr-2 checked:accent-green-600 disabled:accent-green-600/50"
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
          <div>
            {/* @ts-expect-error permission is always a keyof ServerPermissions. This error will never be thrown */}
            <label> {permissionEnumToInfoMap.get(ServerPermissions[permission])[0]}</label>
            {/* @ts-expect-error permission is always a keyof ServerPermissions. This error will never be thrown */}
            <p className="text-sm text-gray-400 text-left w-full">{permissionEnumToInfoMap.get(ServerPermissions[permission])[1]}</p>
          </div>

        </div>
      ))}
      <div className="flex flex-row space-x-2 w-full">
        <button
          className="bg-red-500 hover:bg-red-700 disabled:bg-grey-600 rounded-md h-6 mt-2 w-full"
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
          className="bg-green-500 hover:bg-green-700 disabled:bg-grey-600 rounded-md h-6 mt-2 w-full"
          disabled={isFormDisabled}
          type="submit"
        >
          Save
        </button>
      </div>
    </form>
  );
}
