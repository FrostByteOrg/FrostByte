import { useChannelIdValue } from '@/context/ChatCtx';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useRef, useEffect, useState } from 'react';
import styles from '@/styles/Chat.module.css';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import MessageInput from './MessageInput';
import type { ChatMessageWithUser, Message as MessageType } from '@/types/dbtypes';
import { createMessage, getMessagesInChannelWithUser, getMessageWithUser } from '@/services/message.service';
import Message  from '@/components/home/Message';
import { useRealtime } from 'hooks/useRealtime';

export default function Chat() {
  const channelId = useChannelIdValue();
  const [ messages, setMessages ] = useState<ChatMessageWithUser[]>([]);
  const supabase = useSupabaseClient();
  const user = useUser();
  const newestMessageRef = useRef<null | HTMLDivElement>(null);

  useRealtime<MessageType>(
    'public:messages',
    [
      {
        type: 'postgres_changes',
        filter: { event: 'INSERT', schema: 'public', table: 'messages' },
        callback: async (payload) => {
          const { data, error } = await getMessageWithUser(
            supabase,
            (payload.new as MessageType).id
          );

          if (error) {
            console.error(error);
            return;
          }

          if (data.channel_id === channelId) {
            setMessages(messages.concat(data));
          }
        }
      }
    ]
  );

  // Update when the channel changes
  useEffect(() => {
    if (channelId) {
      const handleAsync = async () => {
        const { data, error } = await getMessagesInChannelWithUser(
          supabase,
          channelId
        );

        if (error) {
          console.error(error);
        }

        if (data) {
          data.reverse();
          setMessages(data);
        }

      };
      handleAsync();
    }
  }, [channelId, supabase]);

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
      <div className="main flex flex-col p-5 bg-grey-800 overflow-clip min-h-0">
        <div
          className={`${styles.messageList} flex flex-col overflow-y-scroll`}
        >
          {
            messages && messages.map((value, index: number, array) => {
              // @ts-expect-error This is actually valid, TypeScript just considers this an array internally for some reason
              return <Message key={value.id} message={value}/>;
            })
          }
          <div ref={newestMessageRef} className=""></div>
        </div>

        <MessageInput
          onSubmit={async (content: string) => {
            createMessage(
              supabase,
              {
                content,
                channel_id: channelId,
                profile_id: user!.id}
            );
          }}
        />
      </div>
    </>
  );
}
