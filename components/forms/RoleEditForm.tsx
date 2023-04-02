import { useUserServerPerms } from '@/lib/store';
import { createRole, deleteRole, updateRole } from '@/services/roles.service';
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
  permissions: string | string[];
  color: string;
}

export function RoleEditForm({role, server }: {role: Role, server: Server }) {
  const { register, handleSubmit, formState: { errors } } = useForm<RoleEditFormResult>();

  const supabase = useSupabaseClient();
  const isFormDisabled = (role && role.is_system) || false;
  const serverPermissions = Object.entries(ServerPermissions).filter(
    ([key, value]) => typeof value === 'number' && key !== 'NONE'
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
    if (!role) {
      const { data, error } = await createRole(
        supabase,
        server.id,
        formData.name,
        1,
        perms,
        formData.color.replace('#', '')
      );

      if (error) {
        console.error(error);
      }
    }

    else {
      const { data, error } = await updateRole(
        supabase,
        role.id,
        formData.name,
        1,
        perms,
        formData.color.replace('#', '')
      );

      if (error) {
        console.error(error);
      }
    }
  };

  const userPerms = useUserServerPerms();


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
