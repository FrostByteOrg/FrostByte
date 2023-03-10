import { getInviteAndServer } from '@/services/invites.service';
import { ServerInvite } from '@/types/dbtypes';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import ServersIcon from '../icons/ServersIcon';
import { OverflowMarquee } from './OverflowMarquee';
import { ServerMemberStats } from './ServerMemberStats';

export function InviteEmbed({ invite_code }: { invite_code: string }) {
  const supabase = useSupabaseClient();
  const [invite, setInvite] = useState<ServerInvite | null>(null);

  useEffect(() => {
    async function handleAsync() {
      const { data, error } = await getInviteAndServer(supabase, invite_code);

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        console.log(data);
        setInvite(data);
      }
    };

    handleAsync();
  }, [invite_code, supabase]);

  if (!invite) {
    return (<></>);
  }

  return (
    <div className='flex flex-row items-center justify-center bg-slate-700 p-4 rounded-md border-solid border-2 border-slate-800/50 max-w-lg'>
      <div className='flex flex-col justify-center space-y-2 items-start'>
        <div className='text-xl font-semibold tracking-wide text-left'>
          <OverflowMarquee content={`You have been invited to join ${invite.servers.name}!`} maxLength={50}/>
        </div>
        <div className='flex flex-row w-full space-x-3'>
          <div className='flex-grow-0 bg-zinc-700 p-2 rounded-lg border-solid border-2 border-slate-800/50'>
            <ServersIcon server={invite.servers} hovered={false} width={7} height={7}/>
          </div>
          <div className='justify-center items-center flex-grow'>
            {!!invite.servers.description && <div className='text-slate-400 font-semibold'>
              <OverflowMarquee content={invite.servers.description} maxLength={90}/>
            </div>}
            <ServerMemberStats server={invite.servers} flexStyle='flex flex-row space-x-4 font-semibold items-center justify-center'/>
          </div>
          <button className='bg-green-700 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md max-h-6 basis-8'>
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
