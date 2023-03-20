import Head from 'next/head';
import styles from '@/styles/Home.module.css';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import NavBar from '@/components/home/NavBar';
import { SideBarOptionProvider } from '@/context/SideBarOptionCtx';
import RenderMobileView from '@/components/home/mobile/RenderMobileView';
import RenderDesktopView from '@/components/home/RenderDesktopView';
import { useMediaQuery } from 'react-responsive';
import { useEffect, useState } from 'react';
import { useRealtimeStore } from '@/hooks/useRealtimeStore';
import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { useTokenRef } from '@/lib/store';

export default function Home() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const token = useTokenRef();

  useRealtimeStore(supabase);

  const [isMobile, setIsMobile] = useState(false);
  const [tryConnect, setTryConnect] =useState(true);
  const [connected, setConnected] = useState(true);

  const checkMobile = useMediaQuery({ query: '(max-width: 940px)' });
  //TODO: Server list view, create server form, Server view, create server invite form, join server via invite
  //TODO: fix the positioning of the logout button

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log(error);
    router.push('/login');
  };

  useEffect(() => {
    setIsMobile(checkMobile);
  }, [checkMobile]);

  return (
    <>
      <Head>
        <title>FrostCord</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SideBarOptionProvider>
        <LiveKitRoom
          video={false}
          audio={true}
          screen={false}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL}
          connect={tryConnect}
          onConnected={() => setConnected(true)}
          className='flex flex-col w-full' 
        >
          {isMobile ? (
            <div>
              <div className={'bg-grey-800'}>
                <RenderMobileView />
                <div>
                  {!user ? (
                    ''
                  ) : (
                    <button
                      className="bg-grey-600 hover:bg-grey-700 font-bold py-2 px-4 fixed right-[20px] top-[20px] rounded-xl tracking-wide text-frost-100"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div className={'bg-grey-800 '}>
                <RenderDesktopView />
                <div>
                  {!user ? (
                    ''
                  ) : (
                    <button
                      className="bg-grey-600 hover:bg-grey-700 font-bold py-2 px-4 fixed right-[20px] top-[20px] rounded-xl tracking-wide text-frost-100"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </LiveKitRoom>
      </SideBarOptionProvider>
    </>
  );
}
