import UserIcon from '@/components/icons/UserIcon';
import { unbanUser } from '@/services/server.service';
import { User } from '@/types/dbtypes';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { toast } from 'react-toastify';

export function BanListItem({ profile, serverId }: { profile: User, serverId: number }) {
  const supabase = useSupabaseClient();

  return (
    <div className="flex flex-row items-center justify-between w-full h-7 px-4 my-2 rounded-md hover:bg-gray-600">
      <div className="flex flex-row flex-grow w-full align-middle">
        <UserIcon user={profile} indicator={false} className="!w-6 !h-6"/>
        <span className="text-sm font-bold text-gray-300">{profile.username}</span>
      </div>
      <button
        className="text-red-400 p-2 hover:text-red-500 transition-colors"
        onClick={async () => {
          const { error } = await unbanUser(
            supabase,
            profile.id,
            serverId,
          );

          if (error) {
            console.error(error);
            toast.error('Failed to unban user');
            return;
          }

          toast.success('User unbanned');
        }}
      >
        Unban
      </button>
    </div>
  );
}
