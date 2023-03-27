import { Channel, DMChannelWithRecipient } from '@/types/dbtypes';
import UserIcon from '../icons/UserIcon';
import styles from '@/styles/Chat.module.css';
import { useDMChannels, useSetChannel } from '@/lib/store';
import { useEffect, useState } from 'react';

function mapToComponentArray(
  _map: Map<string, DMChannelWithRecipient>,
  setChannel: (channel: Channel) => void
) {
  const rv = [];

  for (const [_, value] of _map) {
    rv.push(
      <div
        key={value.channel_id}
        className="flex items-center p-2 w-full hover:bg-grey-700 rounded-md transition-colors"
        onClick={() => {
          setChannel({
            channel_id: value.channel_id,
            server_id: value.server_id,
            name: value.recipient.username,
            is_media: false,
            description: null,
            created_at: null
          });
        }}
      >
        <UserIcon user={value.recipient} className="!w-6 !h-6"/>
        <div>{value.recipient.username}</div>
      </div>
    );
  }

  return rv;
}
export default function DMessageList() {
  const setChannel = useSetChannel();
  const dmChannels = useDMChannels();
  console.table(dmChannels);

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
        { mapToComponentArray(dmChannels, setChannel) }
      </div>
    </>
  );
}
