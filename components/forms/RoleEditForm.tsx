import { useUserServerPerms } from '@/lib/store';
import { Role } from '@/types/dbtypes';
import { ServerPermissions } from '@/types/permissions';
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
}

export function RoleEditForm({role}: {role?: Role}) {
  const { register, handleSubmit, formState: { errors } } = useForm<RoleEditFormResult>();

  const isFormDisabled = (role && role.is_system) || false;
  const serverPermissions = Object.entries(ServerPermissions).filter(
    ([key, value]) => typeof value === 'number' && key !== 'NONE'
  );

  const onSubmit = (data: RoleEditFormResult) => {
    if (typeof data.permissions === 'string') {
      data.permissions = [data.permissions];
    }

    const perms = data.permissions.reduce((acc, cur) => acc | parseInt(cur), 0);

    console.log({
      name: data.name,
      permissions: perms
    });
  };

  const userPerms = useUserServerPerms();


  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="text"
        className="text-xl p-2 rounded-md mb-2"
        disabled={isFormDisabled}
        defaultValue={role?.name}
        placeholder='Role Name'
        {...register('name', { required: true })}
      />
      {serverPermissions.map(([permission, value]) => (
        <div key={permission}>
          <input
            type="checkbox"
            value={value}
            defaultChecked={(!role || (role && (role.permissions & value as number)) > 0)}
            disabled={
              isFormDisabled
              || (
                (userPerms & ServerPermissions.OWNER) === 0
                && ((userPerms & value as number) === 0)
              )
            }
            {...register('permissions')}

          />
          <label> {permissionEnumToNameMap.get(ServerPermissions[permission])}</label>
        </div>
      ))}
      <div className="flex flex-row space-x-2">
        <button className="bg-red-600 disabled:bg-red-900 rounded-md h-6 w-8 mt-2" disabled={isFormDisabled}>Delete</button>
        <button className="bg-green-600 disabled:bg-green-900 rounded-md h-6 w-8 mt-2" disabled={isFormDisabled} type="submit">Save</button>
      </div>
    </form>
  );
}
