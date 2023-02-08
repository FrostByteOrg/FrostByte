import { useChannelIdValue } from '@/context/ChatCtx';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useRef, useEffect } from 'react';
import styles from '@/styles/Chat.module.css';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useStore } from '@/lib/Store';

//NOTE: this is a temp type just for testing...to be removed or possibly extracted to the types dir under client
type Author = {
  id: string;
  username: string;
};

//NOTE: this is a temp type just for testing...to be removed or possibly extracted to the types dir under client
type Message = {
  id: string;
  content: string;
  author: Author;
  createdAt: Date;
};

//NOTE: this is temporary and just for testing
const MESSAGES: Message[] = [
  {
    id: '1',
    content: 'first msg',
    author: { id: '1', username: 'weedpolice420' },
    createdAt: new Date('2023-02-06T03:24:00'),
  },
  {
    id: '2',
    content: '2nd msg',
    author: { id: '2', username: 'kingsgambit' },
    createdAt: new Date('2023-02-06T03:26:00'),
  },
  {
    id: '3',
    content: 'stop copying my cat',
    author: { id: '1', username: 'weedpolice420' },
    createdAt: new Date('2023-02-06T03:37:00'),
  },
];

export default function Chat() {
  const supabaseClient = useSupabaseClient();
  const channelId = useChannelIdValue();
  const {messages} = useStore({channelId: channelId});

  const newestMessageRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (newestMessageRef) newestMessageRef.current?.scrollIntoView({block: 'start',
      behavior: 'smooth',});
  }, [newestMessageRef]);

  // useEffect(() => {
  //   //
  //   async function loadData() {
  //     const { data } = await supabaseClient.from('test').select('*');
  //     setData(data);
  //   }
  //   // Only run query once user is logged in.
  //   loadData();
  // },[]);

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
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">messages</div>
          <div className="messageList">chiee</div>

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
