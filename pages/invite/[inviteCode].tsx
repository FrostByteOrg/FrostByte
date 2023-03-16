import { useRouter } from 'next/router';
import Image from 'next/image';
import Head from 'next/head';
import styles from '@/styles/Invite.module.css';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { ServerInvite } from '@/types/dbtypes';
import { getInviteAndServer } from '@/services/invites.service';
import { ServerMemberStats } from '@/components/home/ServerMemberStats';
import { addUserToServer } from '@/services/profile.service';
import ServersIcon from '@/components/icons/ServersIcon';
import { OverflowMarquee } from '@/components/home/OverflowMarquee';

export default function InviteSplash() {
  const router = useRouter();
  const { inviteCode } = router.query;
  const supabase = useSupabaseClient();
  const [invite, setInvite] = useState<ServerInvite | null>(null);

  useEffect(() => {
    async function handleAsync() {
      const { data, error } = await getInviteAndServer(supabase, inviteCode as string);

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
  }, [inviteCode, supabase]);

  return (
    <>
      <main className={`${styles.mainBackground} xl:bg-grey-600`}>
        <div
          className={`${styles.authMD} items-center overflow-auto h-screen w-full `}
        >
          <div
            className={`${styles.mainContainer} col-start-4 col-end-10 row-start-2 row-end-3 flex w-full h-full xl:rounded-3xl`}
          >
            <div className="w-full hidden xl:flex xl:flex-col  h-full ">

            </div>
            <div className={`flex flex-col items-center xl:rounded-r-3xl ${styles.rightSide} w-full overflow-hidden`}>
              <div className="flex flex-col items-center justify-center w-full h-full overflow-hidden">
                {!!invite && (
                  <div className="basis-1/4 flex flex-col items-center relative mt-8 space-y-6 !w-1/2">
                    <div className="flex-shrink-0 bg-zinc-700 p-4 rounded-lg border-solid border-2 border-slate-800/50">
                      <ServersIcon
                        server={invite.servers}
                        hovered={false}
                        className='w-8 h-8'
                      />
                    </div>
                    <div className="h-full flex flex-col justify-center items-center text-8xl font-extrabold">
                      <div className={`${styles.frostCord} max-w-[450px] h-10 overflow-hidden`}>
                        <OverflowMarquee content={invite.servers.name} maxLength={8}/>
                      </div>
                      {!!invite.servers.description && (
                        <p className='text-center text-2xl font-semibold tracking-wide overflow-hidden w-[80%]'>
                          {invite.servers.description}
                        </p>
                      )}
                      <button
                        className="bg-green-700
                          hover:bg-green-600
                          text-white
                          py-2
                          px-4
                          rounded-md
                          flex-shrink-0
                          self-center
                          mt-9
                          leading-3
                          text-lg
                          w-1/2
                          max-w-[50%]
                          h-7
                          disabled:bg-gray-600
                        "
                        disabled
                        onClick={async () => {
                          await addUserToServer(supabase, invite.servers.id);
                        }}
                      >
                        Join
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
