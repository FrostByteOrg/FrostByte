import { useServers } from '@/lib/store';
import { getInviteAndServer } from '@/services/invites.service';
import { addUserToServer } from '@/services/profile.service';
import { ServerInvite } from '@/types/dbtypes';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { PostgrestError } from '@supabase/supabase-js';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import InvalidInviteIcon from '../icons/InvalidInviteIcon';
import LoadingIcon from '../icons/LoadingIcon';
import ServersIcon from '../icons/ServersIcon';
import { OverflowMarquee } from './OverflowMarquee';
import { ServerMemberStats } from './ServerMemberStats';
import { toast } from 'react-toastify';

export function InviteEmbed({ invite_code }: { invite_code: string }) {
  const servers = useServers();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [invite, setInvite] = useState<ServerInvite | null>(null);
  const [userInServer, setUserInServer] = useState<boolean>(false);
  const [error, setErrorText] = useState<PostgrestError | null>(null);

  useEffect(() => {
    async function handleAsync() {
      const { data, error } = await getInviteAndServer(supabase, invite_code);

      if (error) {
        setErrorText(error);
        return;
      }

      if (data) {
        setInvite(data);
        if (data['servers']) {
          setUserInServer(
            servers.some((s) => s.server_id === data['servers']['id'])
          );
        }
      }
    }

    handleAsync();
  }, [invite_code, supabase, servers]);

  if (!invite) {
    return (
      <div
        className="flex
        flex-row
        items-center
        justify-center
        bg-slate-700
        p-4
        rounded-md
        border-solid
        border-2
        border-slate-800/50
        w-full
        max-w-xl
        overflow-hidden
      "
      >
        <div className="flex flex-col justify-center space-y-2 items-start max-w-full">
          <div className="text-xl font-semibold tracking-wide text-left overflow-hidden w-[45ch]">
            {!!error ? (
              <h1>{error.hint || 'Invalid invite.'}</h1>
            ) : (
              <h1>Loading</h1>
            )}
          </div>
          <div className="flex-shrink-0 bg-zinc-700 p-2 rounded-lg border-solid border-2 border-slate-800/50 ">
            {!!error ? (
              <InvalidInviteIcon className="w-7 h-7 fill-red-400" />
            ) : (
              <LoadingIcon className="w-7 h-7 stroke-frost-300" />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex
      flex-row
      items-center
      justify-center
      bg-slate-700
      p-4
      rounded-md
      border-solid
      border-2
      border-slate-800/50
      w-full
      max-w-xl
      overflow-hidden
    "
    >
      <div className="flex flex-col justify-center space-y-2 items-start max-w-full">
        <div className="text-xl font-semibold tracking-wide text-left overflow-hidden w-[45ch]">
          <OverflowMarquee
            content={`You have been invited to join ${invite.servers.name}!`}
            maxLength={50}
          />
        </div>
        <div className="flex flex-row w-full space-x-3 items-center">
          <div className="flex-shrink-0 bg-zinc-700 p-2 rounded-lg border-solid border-2 border-slate-800/50 ">
            <ServersIcon
              server={invite.servers}
              hovered={false}
              className="w-7 h-7"
            />
          </div>
          <div className="flex flex-col justify-center items-start px-2">
            {!!invite.servers.description && (
              <div className="text-slate-400 font-semibold w-[39ch] flex-grow">
                <OverflowMarquee
                  content={invite.servers.description}
                  maxLength={40}
                />
              </div>
            )}
            <ServerMemberStats
              server={invite.servers}
              flexStyle="flex flex-row space-x-4 font-semibold items-center justify-center flex-grow"
            />
          </div>
          <button
            className="bg-green-700
              hover:bg-green-600
              text-white
              font-semibold
              py-2
              px-4
              rounded-md
              flex-shrink-0
              align-middle
              disabled:bg-gray-600
            "
            disabled={userInServer}
            onClick={async () => {
              const { error } = await addUserToServer(
                supabase,
                invite.servers.id
              );

              if (error) {
                toast.error('You cannot join this server.');
                return;
              }

              router.push(`/?c=${invite.channel_id}`, '/');
            }}
          >
            {userInServer ? 'Joined' : 'Join'}
          </button>
        </div>
      </div>
    </div>
  );
}
