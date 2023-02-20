import { useChannelIdValue } from '@/context/ChatCtx';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useRef, useEffect, useState } from 'react';
import styles from '@/styles/Chat.module.css';
import { useUser } from '@supabase/auth-helpers-react';
import { useRealtime, addMessage } from '@/lib/Store';
import MessageInput from './MessageInput';
import type { ChatMessageWithUser, Message as MessageType } from '@/types/dbtypes';
import { getMessagesInChannelWithUser, getMessageWithUser } from '@/services/message.service';
import Message  from '@/components/home/Message';

export default function Chat() {
  const channelId = useChannelIdValue();
  const [ messages, setMessages ] = useState<ChatMessageWithUser[]>([]);


  const user = useUser();
  const newestMessageRef = useRef<null | HTMLDivElement>(null);

  useRealtime<MessageType>(
    'public:messages',
    [
      {
        type: 'postgres_changes',
        filter: { event: 'INSERT', schema: 'public', table: 'messages' },
        callback: async (payload) => {
          const { data, error } = await getMessageWithUser((payload.new as MessageType).id);

          if (error) {
            console.error(error);
            return;
          }

          if (data.channel_id === channelId) {
            setMessages(messages.concat(data));
          }
        }
      },
      {
        type: 'postgres_changes',
        filter: { event: 'UPDATE', schema: 'public', table: 'messages' },
        callback: async (payload) => {
          const { data, error } = await getMessageWithUser((payload.new as MessageType).id);

          if (error) {
            console.error(error);
            return;
          }

          if (data.channel_id === channelId) {
            setMessages(messages.map((message) => {
              // Once we hit a message that matches the id, we can return the updated message instead of the old one
              // @ts-expect-error message here is a ChatMessageWithUser, note NOT an array
              if (message.id === data.id) {
                return data;
              }

              // Otherwise fallback to the old one
              return message;
            }));
          }
        }
      },
      {
        type: 'postgres_changes',
        filter: { event: 'DELETE', schema: 'public', table: 'messages' },
        callback: async (payload) => {
          if (!payload.old) {
            console.error('No old message found');
            return;
          }

          // @ts-expect-error payload.old is a MessageType, not a ChatMessageWithUser
          if (!payload.old.channel_id || payload.old.channel_id === channelId) {
            setMessages(messages.filter((message) => {
              // @ts-expect-error message here is a ChatMessageWithUser, note NOT an array
              return message.id !== payload.old.id;
            }));
          }
        }
      }
    ]
  );

  // Update when the channel changes
  useEffect(() => {
    if (channelId) {
      const handleAsync = async () => {
        const { data, error } = await getMessagesInChannelWithUser(channelId);

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
      <div className="main flex flex-col p-5 bg-grey-800 overflow-clip min-h-0">
        <div
          className={`${styles.messageList} flex flex-col overflow-y-scroll`}
        >
          {
            messages && messages.map((value, index: number, array) => {
              // Get the previous message, if the authors are the same, we don't need to repeat the header (profile picture, name, etc.)
              const previousMessage: ChatMessageWithUser | null = index > 0 ? array[index - 1] : null;

              if (previousMessage && previousMessage.profiles.id === value.profiles.id) {
                // @ts-expect-error This is actually valid, TypeScript just considers this an array internally for some reason
                return <Message key={value.id} message={value} collapse_user={true}/>;
              }

              // @ts-expect-error This is actually valid, TypeScript just considers this an array internally for some reason
              return <Message key={value.id} message={value}/>;
            })
          }
          <div ref={newestMessageRef} className=""></div>
        </div>

        <MessageInput onSubmit={async (text: string) => addMessage(text, channelId, user!.id)}/>
      </div>
    </>
  );
}
