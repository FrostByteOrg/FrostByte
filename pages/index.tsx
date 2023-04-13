import Head from 'next/head';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { SideBarOptionProvider } from '@/context/SideBarOptionCtx';
import RenderMobileView from '@/components/home/mobile/RenderMobileView';
import RenderDesktopView from '@/components/home/RenderDesktopView';
import { useMediaQuery } from 'react-responsive';
import { useEffect, useRef, useState } from 'react';
import { useRealtimeStore } from '@/hooks/useRealtimeStore';
import { LiveKitRoom } from '@livekit/components-react';
import {
  useTokenRef,
  useConnectionRef,
  useUserSettings,
  useSetConnectionState,
} from '@/lib/store';
import { useSetChannel } from '@/lib/store';
import { getChannelById } from '@/services/channels.service';
import Modal from '@/components/home/modals/Modal';

export default function Home() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const token = useTokenRef();
  const userSettings = useUserSettings();
  const setChannel = useSetChannel();
  const { c: channel_id } = router.query;

  useRealtimeStore(supabase);
  const [isMobile, setIsMobile] = useState(false);
  const [connect, setConnect] = useState(false);
  const [connected, setConnected] = useState(false);

  const tryConnect = useConnectionRef();
  const setConnectionState = useSetConnectionState();
  const [livekitError, setLivekitError] = useState<Error | null>(null);

  const modalRef = useRef<HTMLDialogElement>(null);

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

  const handleDisconnect = () => {
    setConnect(false);
    setConnected(false);
  };

  useEffect(() => {
    if (!channel_id) {
      return;
    }

    async function handleAsync() {
      // First, try parsing the channel_id as a number. If that fails, we're done
      const channel_id_as_number = parseInt(channel_id as string);

      if (isNaN(channel_id_as_number)) {
        return;
      }

      const { data: _channel } = await getChannelById(
        supabase,
        channel_id_as_number
      );

      if (_channel) {
        setChannel(_channel);
      }
    }

    handleAsync();
  }, [channel_id, setChannel, supabase]);

  return (
    <>
      <Head>
        <title>FrostCord</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Modal
        modalRef={modalRef}
        showModal={livekitError !== null}
        title="Error"
        buttons={
          <button
            className="bg-grey-600 hover:bg-grey-700 font-bold py-2 px-4 rounded-xl tracking-wide text-frost-100"
            onClick={() => {
              setLivekitError(null);
              modalRef.current?.close();
            }}
          >
            Close
          </button>
        }
      >
        <p>{livekitError?.message}</p>
      </Modal>
      <SideBarOptionProvider>
        <LiveKitRoom
          video={false}
          audio={userSettings}
          screen={false}
          token={token}
          serverUrl={process.env.NEXT_PUBLIC_LK_SERVER_URL}
          connect={tryConnect}
          onDisconnected={handleDisconnect}
          onError={(err) => {
            console.error(err);
            setLivekitError(err);
            setConnectionState(false);
          }}
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
