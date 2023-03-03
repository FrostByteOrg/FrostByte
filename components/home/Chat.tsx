import { useChannelIdValue, useChatNameValue } from '@/context/ChatCtx';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useRef, useEffect, useState } from 'react';
import styles from '@/styles/Chat.module.css';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import MessageInput from './MessageInput';
import type {
  ChatMessageWithUser,
  Message as MessageType,
} from '@/types/dbtypes';
import {
  createMessage,
  getMessagesInChannelWithUser,
  getMessageWithUser,
} from '@/services/message.service';
import Message from '@/components/home/Message';
import { useRealtime } from 'hooks/useRealtime';

export default function Chat() {
  const channelId = useChannelIdValue();
  const chatName = useChatNameValue();
  const [messages, setMessages] = useState<ChatMessageWithUser[]>([]);
  const supabase = useSupabaseClient();
  const user = useUser();
  const newestMessageRef = useRef<null | HTMLDivElement>(null);

  useRealtime<MessageType>('public:messages', [
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
      },
    },
    {
      type: 'postgres_changes',
      filter: { event: 'UPDATE', schema: 'public', table: 'messages' },
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
          setMessages(
            messages.map((message) => {
              // Once we hit a message that matches the id, we can return the updated message instead of the old one
              // @ts-expect-error message here is a ChatMessageWithUser, note NOT an array
              if (message.id === data.id) {
                return data;
              }

              // Otherwise fallback to the old one
              return message;
            })
          );
        }
      },
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
          setMessages(
            messages.filter((message) => {
              // @ts-expect-error message here is a ChatMessageWithUser, note NOT an array
              return message.id !== payload.old.id;
            })
          );
        }
      },
    },
  ]);

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
        behavior: 'auto',
      });
    }
  }, [newestMessageRef, messages]);

  return (
    <>
      <div className={`${styles.chatHeader} px-5 pt-5 mb-3`}>
        <div className="flex items-center  ">
          <div className="mr-2">
            <ChannelMessageIcon size="5" />
          </div>
          <h1 className=" text-3xl font-semibold tracking-wide">{chatName}</h1>
        </div>
      </div>
      <div className="border-t-2 mx-5 border-grey-700 flex "></div>

      <div
        className={`${styles.messagesParent}  flex flex-col p-5 bg-grey-800 overflow-y-scroll`}
      >
        <div className={`${styles.messageList} flex flex-col `}>
          {messages &&
            messages.map((value, index: number, array) => {
              // Get the previous message, if the authors are the same, we don't need to repeat the header (profile picture, name, etc.)
              const previousMessage: ChatMessageWithUser | null =
                index > 0 ? array[index - 1] : null;

              // @ts-expect-error This is actually valid, TypeScript just considers this an array internally for some reason
              return (
                <Message
                  key={value.id}
                  message={value}
                  collapse_user={
                    previousMessage &&
                    previousMessage.profiles.id === value.profiles.id
                  }
                />
              );
            })}
          <div ref={newestMessageRef} className=""></div>
        </div>
      </div>
      <MessageInput
        onSubmit={async (content: string) => {
          createMessage(supabase, {
            content,
            channel_id: channelId,
            profile_id: user!.id,
          });
        }}
      />
    </>
  );
}
