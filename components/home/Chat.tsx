import { useChannelIdValue } from '@/context/ChatCtx';
import ChannelMessageIcon from '../icons/ChannelMessageIcon';
import { useRef, useEffect } from 'react';

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
  const channelId = useChannelIdValue();

  const newestMessageRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    if (newestMessageRef) newestMessageRef.current?.scrollIntoView();
  }, [newestMessageRef]);

  //TODO:FETCH channel info and messages via channel id

  return (
    <>
      <div className="p-5 ">
        <div className="flex pb-4 items-center border-b-2 border-grey-700">
          <div className="mr-2">
            <ChannelMessageIcon size="5" />
          </div>
          <h1 className=" text-3xl font-semibold tracking-wide">general</h1>
        </div>
      </div>
      <div className="main h-full flex flex-col p-5 ">
        <div className="messages overflow-y-scroll h-[80%]">
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
        <div className="messageInput fixed bottom-9">input</div>
      </div>
    </>
  );
}
