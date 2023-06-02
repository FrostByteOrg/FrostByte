import { BanListItem } from '@/components/home/BanListItem';
import { getServerBans } from '@/services/server.service';
import { ServerBanWithProfile } from '@/types/dbtypes';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';

export function ServerBansList({ serverId }: { serverId: number }) {
  const supabase = createClientComponentClient();
  const [bans, setBans] = useState<ServerBanWithProfile[]>([]);

  useEffect(() => {
    async function handleAsync() {
      const { data, error } = await getServerBans(supabase, serverId);

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        if (Array.isArray(data)) {
          setBans(data!);
        }
        else {
          setBans([data!]);
        }
      }
    }

    handleAsync();
  }, [supabase, serverId]);

  return (
    <div className="flex flex-col w-full h-full">
      {bans.map((ban) => (
        <BanListItem
          ban={ban}
          serverId={serverId}
          key={ban.id}
          setServerBans={setBans}
        />
      ))}
    </div>
  );
}
