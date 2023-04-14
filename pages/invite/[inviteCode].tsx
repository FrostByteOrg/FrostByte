import { useRouter } from 'next/router';
import styles from '@/styles/Invite.module.css';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import { ServerInvite } from '@/types/dbtypes';
import { getInviteAndServer } from '@/services/invites.service';
import { addUserToServer } from '@/services/profile.service';
import ServersIcon from '@/components/icons/ServersIcon';
import { OverflowMarquee } from '@/components/home/OverflowMarquee';
import { getServersForUser } from '@/services/server.service';
import { useMediaQuery } from 'react-responsive';
import { toast } from 'react-toastify';
import { useRealtimeStore } from '@/hooks/useRealtimeStore';

export default function InviteSplash() {
  const user = useUser();
  const router = useRouter();
  const { inviteCode } = router.query;
  const supabase = useSupabaseClient();
  const [invite, setInvite] = useState<ServerInvite | null>(null);
  const [ userInServer, setUserInServer ] = useState<boolean>(false);
  const mq = useMediaQuery({ query: '(max-width: 1280px)' });
  const [ isMobile, setIsMobile ] = useState(true);

  useEffect(() => {
    setIsMobile(mq);
  }, [mq]);

  useEffect(() => {
    async function handleAsync() {
      if (!user || !inviteCode) {
        return;
      }

      const { data, error } = await getInviteAndServer(supabase, inviteCode as string);
      const { data: servers, error: serverError } = await getServersForUser(supabase, user!.id);

      if (error) {
        console.error(error);
        return;
      }

      if (data) {
        setInvite(data);
      }

      if (serverError) {
        console.error(serverError);
        return;
      }

      setUserInServer(servers.some((s) => s.server_id === data.servers.id));
    };

    handleAsync();
  }, [inviteCode, supabase, user]);

  return (
    <>
      <main className={`${styles.mainBackground} xl:bg-grey-600`}>
        <div
          className={`${styles.authMD} items-center overflow-auto h-screen w-full`}
          style={{
            background: isMobile ? 'rgba(50,50,50, 0.8)' : '',
            backdropFilter: isMobile ? 'blur(10px)' : '',
          }}
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
                        disabled={userInServer}
                        onClick={async () => {
                          const { error } = await addUserToServer(supabase, invite.servers.id);

                          if (error) {
                            toast.error('You cannot join this server.');
                            return;
                          }

                          router.push(`/?c=${invite.channel_id}&s=${invite.server_id}`, '/');
                        }}
                      >
                        {userInServer ? 'Joined' : 'Join'}
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
