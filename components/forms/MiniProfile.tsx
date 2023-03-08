import { getUserProfileAndServerUserProps, GetUserProfileAndServerUserPropsResponseSuccess } from '@/services/profile.service';
import { getServerIdFromMessageId } from '@/services/server.service';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { memo, useEffect, useState } from 'react';
import UserIcon from '../icons/UserIcon';
import { SearchBar } from './Styles';

// TODO: Once DMs are implemented, this component will need to be updated to handle DMs as well.
function WrappedComponent({ userId, messageId }: { userId: string, messageId: number }) {
  const supabase = useSupabaseClient();
  const [user, setUser] = useState<GetUserProfileAndServerUserPropsResponseSuccess>(null);

  useEffect(() => {
    async function handleAsync() {
      const { data: serverId } = await getServerIdFromMessageId(supabase, messageId);
      const { data, error } = await getUserProfileAndServerUserProps(supabase, userId, serverId!);

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
          { user.server_users[0].nickname && <h2 className='text-lg'>
            {user.server_users[0].nickname}
          </h2> }
          <h2 className={user.server_users[0].nickname ? 'text-base' : 'text-lg'}>{user.username}</h2>

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
