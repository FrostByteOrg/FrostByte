import { useOnlineUsers } from '@/lib/store';
import { getServerMemberCount, getUsersInServer } from '@/services/server.service';
import styles from '@/styles/Servers.module.css';
import { Server } from '@/types/dbtypes';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';

export function ServerMemberStats({ server, flexStyle }: { server: Server, flexStyle?: string }) {
  const [ memberCount, setMemberCount ] = useState(0);
  const [ onlineCount, setOnlineCount ] = useState(0);
  const supabase = useSupabaseClient();
  const onlineUsers = useOnlineUsers();

  useEffect(() => {
    async function handleAsync() {
      // Total Members
      setMemberCount(await getServerMemberCount(supabase, server.id));

      // Now we need to get the online count
      const { data: onlineData, error } = await getUsersInServer(supabase, server.id);

      let amtOnlineUsers = 0;
      if (!error) {
        for (const profile of onlineData) {
          if (onlineUsers[profile.id] !== undefined) {
            amtOnlineUsers++;
          }
        }
        setOnlineCount(amtOnlineUsers);
      }
    }

    handleAsync();
  }, [supabase, onlineUsers, server.id]);

  return (
    <div className={`text-xs tracking-wide text-grey-300 ${flexStyle}`}>
      <div className="flex items-center">
        <span className="p-1 bg-green-300 rounded-full mr-1"></span>
        <span>{onlineCount} Online</span>
      </div>
      <div className={`flex items-center ml-2 ${styles.membersSpacing}`}>
        <span className="p-1 bg-grey-300 rounded-full mr-1"></span>
        <span>
          {memberCount} Member{memberCount !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
}
