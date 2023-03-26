import { getAllDMChannels } from '@/services/directmessage.service';
import { DMChannelWithRecipient } from '@/types/dbtypes';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';
import UserIcon from '../icons/UserIcon';
import styles from '@/styles/Chat.module.css';
import { useSetChannel } from '@/lib/store';

export default function DMessageList() {
  const supabase = useSupabaseClient();
  const [ dmChannels, setDMChannels ] = useState<DMChannelWithRecipient[]>([]);
  const setChannel = useSetChannel();

  // TODO: Move this to store
  useEffect(() => {
    async function handleAsync() {
      const { data, error } = await getAllDMChannels(supabase);

      if (error) {
        console.error(error);
      }

      setDMChannels(data || []);
    }

    handleAsync();
  }, [supabase]);

  return (
    <>
      <div className={`${styles.chatHeader} px-5 pt-5 mb-3`}>
        <div className="flex flex-row items-center space-x-3">
          <h1 className="text-3xl font-semibold tracking-wide">
            Directs
          </h1>
        </div>
      </div>
      <div className="border-t-2 mx-5 border-grey-700 flex flex-col pt-3">
        {
          dmChannels.map((dmChannel) => (
            <div
              key={dmChannel.channel_id}
              className="flex items-center p-2 w-full hover:bg-grey-700 rounded-md transition-colors"
              onClick={() => {
                setChannel({
                  channel_id: dmChannel.channel_id,
                  server_id: dmChannel.server_id,
                  name: dmChannel.recipient.username,
                  is_media: false,
                  description: null,
                  created_at: null
                });
              }}
            >
              <UserIcon user={dmChannel.recipient} className="!w-6 !h-6"/>
              <div>{dmChannel.recipient.username}</div>
            </div>
          ))
        }
      </div>
    </>
  );
}
