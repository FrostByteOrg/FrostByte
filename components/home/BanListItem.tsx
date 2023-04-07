import { OverflowMarquee } from '@/components/home/OverflowMarquee';
import UserIcon from '@/components/icons/UserIcon';
import { unbanUser } from '@/services/server.service';
import { ServerBanWithProfile, User } from '@/types/dbtypes';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'react-toastify';

export function BanListItem({ ban, serverId, setServerBans }: { ban: ServerBanWithProfile, serverId: number, setServerBans: Dispatch<SetStateAction<ServerBanWithProfile[]>> }) {
  const supabase = useSupabaseClient();

  return (
    <div className="flex flex-row items-center justify-between w-full h-7 px-4 my-2 rounded-md hover:bg-gray-600">
      <div className="flex flex-row flex-grow w-full align-middle">
        <UserIcon user={ban.profiles} indicator={false} className="!w-6 !h-6"/>
        <span className="text-sm font-bold text-gray-300">{ban.profiles.username}</span>
      </div>
      <div className='flex-grow'>
        <OverflowMarquee content={ban.reason} maxLength={50} />
      </div>
      <button
        className="text-red-400 p-2 hover:text-red-500 transition-colors"
        onClick={async () => {
          const { error } = await unbanUser(
            supabase,
            ban.profiles.id,
            serverId,
          );

          if (error) {
            console.error(error);
            toast.error('Failed to unban user');
            return;
          }

          toast.success('User unbanned');
          setServerBans((bans) => bans.filter((b) => b.id !== ban.id));
        }}
      >
        Unban
      </button>
    </div>
  );
}
