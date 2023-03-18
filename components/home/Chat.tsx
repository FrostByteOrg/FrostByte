import {
  useChannelIdValue,
  useChatNameValue,
  useOnlinePresenceRef,
} from '@/context/ChatCtx';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useRef, useEffect } from 'react';
import styles from '@/styles/Chat.module.css';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import MessageInput from './MessageInput';

import { createMessage } from '@/services/message.service';
import Message from '@/components/home/Message';

import { ChannelPermissions } from '@/types/permissions';

import {
  useChannelId,
  useGetMessages,
  useGetUserPerms,
  useMessages,
  useUserPerms,
} from '@/lib/store';

export default function Chat() {
  const chatName = useChatNameValue();

  const supabase = useSupabaseClient();
  const user = useUser();
  const newestMessageRef = useRef<null | HTMLDivElement>(null);
  const realtimeRef = useOnlinePresenceRef();

  const messages = useMessages();
  const channelId = useChannelId();
  const userPerms = useUserPerms();

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

              return (
                <Message
                  key={value.id}
                  message={value}
                  collapse_user={
                    !!previousMessage &&
                    previousMessage.profiles.id === value.profiles.id
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
        channelName={chatName}
      />
    </>
  );
}
