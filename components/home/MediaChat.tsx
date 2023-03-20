import { useOnlinePresenceRef } from '@/context/ChatCtx';
import { useChannel, useUserPerms } from '@/lib/store';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import Stream from './Stream';
import styles from '@/styles/Chat.module.css';
import { ChannelMediaIcon } from '../icons/ChannelMediaIcon';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { TrackToggle } from '@livekit/components-react';


export default function MediaChat() {
  const supabase = useSupabaseClient();
  const user = useUser();

  const realtimeRef = useOnlinePresenceRef();
  const channel = useChannel();
  const userPerms = useUserPerms();

  return (
    <>
      <div className={`${styles.chatHeader} px-5 pt-5 mb-3`}>
        <div className='flex items-center'>
          <div className='mr-2'>
            {channel && channel.is_media ? (
              <ChannelMediaIcon />
            ) : (
              <ChannelMessageIcon size="5" />
            )}
          </div>
          <h1 className='text-3xl font-semibold tracking-wide'>
            {channel ? channel.name : ''}
          </h1>
        </div>
      </div>
      <div className="border-t-2 mx-5 border-grey-700 flex "></div>
      <div className={'h-full'}>
        <Stream/>
      </div>
    </>
  );
}
