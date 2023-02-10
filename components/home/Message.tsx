import UserIcon from '../icons/UserIcon';
import moment from 'moment';
import { ChatMessageWithUser } from '@/types/dbtypes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';


function renderImage(props: any) {
  return <img {...props} style={{maxWidth: '50vw'}}/>;
}

export default function Message({ message }: { message: any }) {
  const pastDate = moment(message.sent_time).format('MM/DD/YYYY h:mm A');
  const todayDate = moment(message.sent_time).format('h:mm A');
  const displayTime =
    moment(moment(message.sent_time)).isSame(moment(), 'day') &&
    moment(moment(message.sent_time)).isSame(moment(), 'year') &&
    moment(moment(message.sent_time)).isSame(moment(), 'month')
      ? `Today at ${todayDate}`
      : pastDate;

  return (
    <>
      <div className="px-2 p-4 flex">
        <UserIcon user={message.profiles}/>
        <div className="flex flex-col">
          <div className="flex items-center">
            <div className="text-xl font-semibold tracking-wider mr-2">
              {message.profiles.username}
            </div>
            <div className="text-xs tracking-wider text-grey-300 mt-1">
              {displayTime}{' '}
            </div>
          </div>
          <div className="font-light tracking-wide">
            <ReactMarkdown components={{img: renderImage}} remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </>
  );
}
