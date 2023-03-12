import { useChannelIdValue, useChatNameValue, useOnlinePresenceRef } from '@/context/ChatCtx';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useRef, useEffect, useState, Dispatch, SetStateAction } from 'react';
import styles from '@/styles/Chat.module.css';
import { SupabaseClient, useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import MessageInput from './MessageInput';
import type { MessageWithServerProfile, Message as MessageType } from '@/types/dbtypes';
import { createMessage, getMessagesInChannelWithUser, getMessageWithUser } from '@/services/message.service';
import Message from '@/components/home/Message';
import { getCurrentUserChannelPermissions } from '@/services/channels.service';
import { ChannelPermissions } from '@/types/permissions';
import { ChannelPermissions as ChannelPermissionsTableType } from '@/types/dbtypes';
import { getMessageWithServerProfile } from '@/services/profile.service';

export default function Chat() {
  const channelId = useChannelIdValue();
  const chatName = useChatNameValue();
  const [messages, setMessages] = useState<MessageWithServerProfile[]>([]);
  const supabase = useSupabaseClient();
  const user = useUser();
  const newestMessageRef = useRef<null | HTMLDivElement>(null);
  const [userPerms, setUserPerms] = useState<any>(null);
  const realtimeRef = useOnlinePresenceRef();

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
      updateUserPerms(supabase, channelId, setUserPerms);
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

  useEffect(() => {
    const channel = supabase.channel('chat-listener')
      .on<MessageType>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          console.log('New message event');
          const { data, error } = await getMessageWithServerProfile(
            supabase,
            (payload.new as MessageType).id
          );

          if (error) {
            console.error(error);
            return;
          }

          setMessages(messages.concat(data as MessageWithServerProfile));
        }
      )
      .on<MessageType>(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          console.log('Message update event');
          const { data, error } = await getMessageWithServerProfile(
            supabase,
            (payload.new as MessageType).id
          );

          if (error) {
            console.error(error);
            return;
          }

          setMessages(
            messages.map((message) => {
              // Once we hit a message that matches the id, we can return the updated message instead of the old one
              if (message.id === data.id) {
                return data as MessageWithServerProfile;
              }

              // Otherwise fallback to the old one
              return message;
            })
          );
        }
      )
      .on<MessageType>(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          console.log('Message delete event');
          if (!payload.old) {
            console.error('No old message found');
            return;
          }

          setMessages(
            messages.filter((message) => {
              return message.id !== payload.old.id;
            })
          );
        }
      )
      .on<ChannelPermissionsTableType>(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'channel_permissions', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          console.log('Channel permissions update event');
          updateUserPerms(supabase, channelId, setUserPerms);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [channelId, messages, supabase]);

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
              const previousMessage: MessageWithServerProfile | null = index > 0 ? array[index - 1] : null;

              return (
                <Message
                  key={value.id}
                  message={value}
                  collapse_user={
                    !!previousMessage &&
                    previousMessage.profile.id === value.profile.id
                  }
                  hasDeletePerms={
                    (userPerms & ChannelPermissions.MANAGE_MESSAGES) !== 0
                  }
                />
              );
            })}
          <div ref={newestMessageRef} className=""></div>
        </div>
      </div>
      <div className="flex grow"></div>
      <MessageInput
        onSubmit={async (content: string) => {
          createMessage(supabase, {
            content,
            channel_id: channelId,
            profile_id: user!.id,
          });
        }}
        disabled={!(userPerms & ChannelPermissions.SEND_MESSAGES)}
      />
    </>
  );
}

async function updateUserPerms(
  supabase: SupabaseClient,
  channelId: number,
  setUserPerms: Dispatch<any>
) {
  const { data, error } = await getCurrentUserChannelPermissions(
    supabase,
    channelId
  );

  if (error) {
    console.log(error);
  }

  setUserPerms(data);
}
