import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useRef, useEffect, useState } from 'react';
import styles from '@/styles/Chat.module.css';
import { useUser } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import MessageInput from './MessageInput';
import type {
  MessageWithServerProfile,
  Message as MessageType,
} from '@/types/dbtypes';
import { createMessage } from '@/services/message.service';
import Message from '@/components/home/Message';
import {
  useChannel,
  useLoadMoreMessages,
  useMessages,
  useServerUserProfilePermissions,
  useUserPerms,
} from '@/lib/store';
import { Channel } from '@/types/dbtypes';
import { ChannelMediaIcon } from '@/components/icons/ChannelMediaIcon';
import { ChannelPermissions, ServerPermissions } from '@/types/permissions';
import MobileCallControls from './mobile/MobileCallControls';
import { useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';

export default function Chat() {
  const supabase = createClientComponentClient();
  const user = useUser();
  const newestMessageRef = useRef<null | HTMLDivElement>(null);
  const messages = useMessages();
  const channel = useChannel();
  const userPerms = useUserPerms();
  const serverPermissions = useServerUserProfilePermissions(
    channel?.server_id!,
    user?.id!
  );
  const connectionState = useConnectionState();
  const loadMoreMessages = useLoadMoreMessages();
  const [pageNum, setPageNum] = useState(1);
  const [initalScroll, setInitalScroll] = useState(true);

  const messagesRef = useRef<HTMLDivElement>(null);
  const shouldScrollToBottomRef = useRef(true);
  //NOTE: should figure out a way to store to bottom on page load only IF the messages have loaded (the component)
  useEffect(() => {
    if (
      shouldScrollToBottomRef.current &&
      messagesRef.current &&
      messages.length > 0 &&
      initalScroll
    ) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
      setInitalScroll(false);
    }
  }, [initalScroll, messages.length]);

  //This useEffect is for pull the scroll bar down to the bottom if ur scroll bar is already close to the
  //bottom of the messages
  useEffect(() => {
    if (
      shouldScrollToBottomRef.current &&
      messagesRef.current &&
      messagesRef.current.scrollHeight - messagesRef.current.scrollTop <=
        messagesRef.current.clientHeight + 300
    ) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    setInitalScroll(true);
    setPageNum(1);
  }, [channel?.channel_id]);

  const handleScroll = () => {
    if (messagesRef.current && messagesRef.current.scrollTop === 0) {
      loadMoreMessages(supabase, channel!.channel_id, pageNum, 100);
      setPageNum(pageNum + 1);
    }
  };

  return (
    <>
      <div className={`${styles.chatHeader} px-5 pt-5 mb-3`}>
        <div className="flex items-center  ">
          <div className="mr-2">
            {channel && channel.is_media ? (
              <ChannelMediaIcon />
            ) : (
              <ChannelMessageIcon size="5" />
            )}
          </div>
          <h1 className=" text-3xl font-semibold tracking-wide">
            {channel ? channel.name : ''}
          </h1>
        </div>
      </div>
      <div className="border-t-2 mx-5 border-grey-700 flex "></div>
      {connectionState === ConnectionState.Connected && <MobileCallControls />}
      <div
        className={`${styles.messagesParent}  flex flex-col p-5 bg-grey-800 overflow-y-auto`}
        ref={messagesRef}
        onScroll={handleScroll}
      >
        <div className={`${styles.messageList} flex flex-col `}>
          {messages &&
            messages.map((value, index: number, array) => {
              // Get the previous message, if the authors are the same, we don't need to repeat the header (profile picture, name, etc.)
              const previousMessage: MessageType | null =
                index > 0 ? array[index - 1] : null;

              return (
                <Message
                  key={value.id}
                  message={value}
                  collapse_user={
                    !!previousMessage &&
                    previousMessage.profile_id === value.profile_id
                  }
                  hasDeletePerms={
                    (serverPermissions & ServerPermissions.MANAGE_MESSAGES) !==
                    0
                  }
                />
              );
            })}
          {/* <div ref={newestMessageRef} className=""></div> */}
        </div>
      </div>
      <div className="flex grow"></div>
      <MessageInput
        onSubmit={async (content: string) => {
          // const message = await createMessage(supabase, {
          //   content,
          //   channel_id: (channel as Channel).channel_id,
          //   profile_id: user!.id,
          // });
          //TODO: THIS WORKS HAHAHA
          const res = await fetch('/api/v1/message', {
            method: 'POST',
            body: JSON.stringify({
              message: content,
              channel_id: (channel as Channel).channel_id,
              profile_id: user!.id,
            }),
          });
        }}
        disabled={!(userPerms & ChannelPermissions.SEND_MESSAGES)}
        channelName={(channel as Channel).name}
      />
    </>
  );
}
