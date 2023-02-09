import { useChannelIdValue } from '@/context/ChatCtx';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useRef, useEffect, useState } from 'react';
import styles from '@/styles/Chat.module.css';
import { useUser } from '@supabase/auth-helpers-react';
import { useRealtime, addMessage } from '@/lib/Store';
import MessageInput from './MessageInput';
import type { ChatMessagesWithUser, Message as MessageType } from '@/types/dbtypes';
import { getMessagesInChannelWithUser, getMessageWithUser } from '@/services/message.service';
import Message  from '@/components/home/Message';

export default function Chat() {
  const channelId = useChannelIdValue();
  const [ messages, setMessages ] = useState<ChatMessagesWithUser[]>([]);

  useRealtime<MessageType>(
    'public:messages',
    [
      {
        type: 'postgres_changes',
        filter: { event: 'INSERT', schema: 'public', table: 'messages' },
        callback: async (payload) => {
          console.table(payload);
          const { data, error } = await getMessageWithUser((payload.new as MessageType).id);

          if (error) {
            console.error(error);
            return;
          }

          setMessages(messages.concat(data));
        }
      }
    ]
  );

  const user = useUser();
  const newestMessageRef = useRef<null | HTMLDivElement>(null);

  // Update when the channel changes
  useEffect(() => {
    if (channelId) {
      const handleAsync = async () => {
        const { data, error } = await getMessagesInChannelWithUser(channelId);

        if (error) {
          console.error(error);
        }

        if (data) {
          setMessages(data);
        }

      };
      handleAsync();
    }
  }, [channelId]);

  useEffect(() => {
    if (newestMessageRef && messages) {
      newestMessageRef.current?.scrollIntoView({
        block: 'end',
        behavior: 'auto'
      });
    }

  }, [newestMessageRef, messages]);

  return (
    <>
      <div className=" px-5 pt-5 mb-3 overflow-visible ">
        <div className="flex items-center  ">
          <div className="mr-2">
            <ChannelMessageIcon size="5" />
          </div>
          <h1 className=" text-3xl font-semibold tracking-wide">general</h1>
        </div>
      </div>
      <div className=" border-t-2 mx-5 border-grey-700 "></div>
      <div className="main flex flex-col p-5 bg-grey-800  overflow-clip">
        <div
          className={`${styles.messageList}  flex flex-col overflow-y-scroll `}
        >
          {
            messages && messages.map((value, index: number, array) => {
              const message = array[array.length - 1 - index];
              return <Message key={index} message={message}/>;
            })
          }
          <div ref={newestMessageRef} className=""></div>
        </div>

        <MessageInput onSubmit={async (text: string) => addMessage(text, channelId, user!.id)}/>
      </div>
    </>
  );
}
