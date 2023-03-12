import { getServerProfileForUser } from '@/services/profile.service';
import { getServerIdFromMessageId } from '@/services/server.service';
import { ServerUserProfile } from '@/types/dbtypes';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { memo, useEffect, useState } from 'react';
import UserIcon from '../icons/UserIcon';
import { SearchBar } from './Styles';

// TODO: Once DMs are implemented, this component will need to be updated to handle DMs as well.
function WrappedComponent({ userId, messageId }: { userId: string, messageId: number }) {
  const supabase = useSupabaseClient();
  const [user, setUser] = useState<ServerUserProfile | null>(null);

  useEffect(() => {
    async function handleAsync() {
      const { data: serverId } = await getServerIdFromMessageId(supabase, messageId);
      const { data, error } = await getServerProfileForUser(supabase, userId, serverId!);

      if (error) {
        console.error(error);
      }

      setUser(data);
      console.log(data);
    }

    handleAsync();
  }, [messageId, userId, supabase]);

  return (
    <div className="flex flex-col space-y-2 items-center p-3">
      { user ? (
        <>
          <UserIcon user={user} className='!w-9 !h-9'/>
          { user.server_user.nickname && <h2 className='text-lg'>
            {user.server_user.nickname}
          </h2> }
          <h2 className={user.server_user.nickname ? 'text-base' : 'text-lg'}>{user.username}</h2>
          <hr/>
          <h2 className='text-sm text-gray-400 text-left w-full'>Roles</h2>
          <div className='flex flex-col w-full items-center space-y-1'>
            { user.roles.map(role => (
              <span
                key={role.id}
                className='text-sm text-gray-400 py-1 px-2 border-2 border-solid w-full rounded-sm'
                style={{
                  border: `1px solid #${!!role.color ? role.color : 'cacacacc'}`,
                  color: `#${!!role.color ? role.color : 'cacacacc'}`,
                }}
              >
                {role.name}
              </span>
            )) }
          </div>
          <hr/>
          <form>
            <input
              type="text"
              className={`${SearchBar}`}
              placeholder={`Message @${user.username}`}
            />
          </form>
        </>
      ): <h2>Loading...</h2>}

    </div>
  );
}

export const MiniProfile = memo(WrappedComponent);
