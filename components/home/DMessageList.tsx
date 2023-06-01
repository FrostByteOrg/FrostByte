import { Channel, DMChannelWithRecipient } from '@/types/dbtypes';
import UserIcon from '../icons/UserIcon';
import styles from '@/styles/Chat.module.css';
import {
  useChannel,
  useConnectionRef,
  useDMChannels,
  useSetChannel,
  useGetAllServerUserProfiles,
} from '@/lib/store';
import SidebarCallControl from '@/components/home/SidebarCallControl';
import { SearchBar } from '@/components/forms/Styles';
import { useState } from 'react';
import { Database } from '@/types/database.supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

function mapToComponentArray(
  _map: Map<string, DMChannelWithRecipient>,
  setChannel: (channel: Channel) => void,
  channel: Channel | null,
  getAllServerUserProfiles: (
    supabase: SupabaseClient<Database>,
    server_id: number
  ) => void,
  supabase: SupabaseClient<Database>
) {
  const rv = [];

  for (const [_, value] of _map) {
    rv.push(
      <div
        key={value.channel_id}
        className={`${
          channel?.channel_id == value.channel_id
            ? 'bg-grey-700'
            : 'hover:bg-grey-700'
        } flex items-center p-2 w-full rounded-md transition-colors hover:cursor-pointer mt-2`}
        onClick={() => {
          getAllServerUserProfiles(supabase, value.server_id);
          setChannel({
            channel_id: value.channel_id,
            server_id: value.server_id,
            name: value.recipient.username,
            is_media: false,
            description: null,
            created_at: null,
          });
        }}
      >
        <UserIcon user={value.recipient} className="!w-6 !h-6" />
        <div>{value.recipient.username}</div>
      </div>
    );
  }

  return rv;
}
export default function DMessageList() {
  const supabase = createClientComponentClient();
  const setChannel = useSetChannel();
  const dmChannels = useDMChannels();
  const channel = useChannel();
  const isInVoice = useConnectionRef();
  const getAllServerProfiles = useGetAllServerUserProfiles();
  const [filteredDMs, setFilteredDMs] = useState(dmChannels);

  return (
    <div className="flex flex-col h-full">
      <div className={`${styles.chatHeader} px-5 pt-5 mb-3`}>
        <div className="flex flex-row items-center space-x-3">
          <h1 className="text-3xl font-semibold tracking-wide">Directs</h1>
        </div>
      </div>
      <div className="border-t-2 mx-5 border-grey-700 flex-grow pt-3">
        <div className="pt-4 pb-4">
          <input
            type="text"
            className={`${SearchBar()}`}
            placeholder="Search"
            onKeyUp={(e) => {
              const value = (e.target as HTMLInputElement).value;

              // Filter DMs

              setFilteredDMs(
                new Map(
                  [...dmChannels].filter(([_, dmChannel]) => {
                    return dmChannel.recipient.username
                      .toLowerCase()
                      .includes(value.toLowerCase());
                  })
                )
              );
            }}
          />
        </div>
        {mapToComponentArray(
          filteredDMs,
          setChannel,
          channel,
          getAllServerProfiles,
          supabase
        )}
      </div>
      {isInVoice && (
        <div className="w-full self-end p-4 mb-7">
          <SidebarCallControl />
        </div>
      )}
    </div>
  );
}
