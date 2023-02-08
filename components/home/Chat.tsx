import { useChannelIdValue } from '@/context/ChatCtx';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useRef, useEffect } from 'react';
import styles from '@/styles/Chat.module.css';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useStore } from '@/lib/Store';
import Message from './Message';

export default function Chat() {
  const supabaseClient = useSupabaseClient();
  const channelId = useChannelIdValue();
  const {messages} = useStore({channelId: channelId});

  const newestMessageRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (newestMessageRef) newestMessageRef.current?.scrollIntoView({block: 'start',
      behavior: 'smooth',});
  }, [newestMessageRef]);


  //TODO:FETCH channel info and messages via channel id

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
          className={`${styles.messageList}  flex flex-col overflow-y-scroll`}
        >

          {messages.map((message: any) => <Message key={message.id} message={message}/>)}

          <div ref={newestMessageRef} className=""></div>
        </div>

        <input
          className="w-[90%]
           px-3 
           py-2
           self-start
           text-base
           font-normal
           placeholder:text-white
           placeholder:opacity-70     
           rounded-lg
           transition
           ease-in-out
           m-0
           focus:outline-none
           bg-grey-700
           bottom-[90px]
           fixed
           "
          placeholder="Message general"
        />
      </div>
    </>
  );
}
