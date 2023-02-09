import { useChannelIdValue } from '@/context/ChatCtx';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useRef, useEffect, useState } from 'react';
import styles from '@/styles/Chat.module.css';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useStore, addMessage } from '@/lib/Store';
import Message, { ChatMessage } from './Message';
import MessageInput from './MessageInput';
import { io, Socket } from 'socket.io-client';
import { SocketClientEvents, SocketServerEvents } from '@/types/socketevents';

export default function Chat() {
  const supabaseClient = useSupabaseClient();
  const channelId = useChannelIdValue();
  const { messages } = useStore({channelId: channelId});
  const user = useUser();
  const newestMessageRef = useRef<null | HTMLDivElement>(null);
  const [ socket, setSocket ] = useState<Socket<SocketServerEvents, SocketClientEvents>>();

  const sendMessage = (channel_id: number, profile_id: string, content: string) => {
    if (!socket) {
      return;
    }

    socket.emit('messageCreated', {
      channel_id,
      content,
      profile_id
    });
  };

  useEffect(() => {
    
    if (newestMessageRef && messages) {
      console.log(newestMessageRef);
      newestMessageRef.current?.scrollIntoView({
        block: 'end',
        behavior: 'auto'
      });
    }
    console.log('rerender heartbeat');
    setSocket(io( {path: '/api/socket.io'}));
  }, [newestMessageRef, messages]);


  //TODO: SET AUTHOR_ID (SERVERUSER) WHEN ENTERING A CHANNEL IN A SERVER AND REMOVE HARDCODED 10

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
            messages && messages.map((value: ChatMessage, index: number, array: ChatMessage[]) => {
              const message = array[array.length - 1 - index];
              return <Message key={index} message={message}/>;
            })
          }
          <div ref={newestMessageRef} className=""></div>
        </div>

        {/* <MessageInput onSubmit={async (text: string) => addMessage(text, channelId, user?.id as string, 10)}/> */}
        <MessageInput onSubmit={async (text: string) => sendMessage(channelId, user?.id!, text)}/>
      </div>
    </>
  );
}
