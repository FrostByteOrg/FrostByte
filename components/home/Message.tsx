import UserIcon from '../icons/UserIcon';
import moment from 'moment';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

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
        <div className="flex flex-col w-full">
          <div className="flex items-center">
            <div className="text-xl font-semibold tracking-wider mr-2">
              {message.profiles.username}
            </div>
            <div className="text-xs tracking-wider text-grey-300 mt-1">
              {displayTime}{' '}
              { message.is_edited && <span className="text-frost-300">(edited)</span>}
            </div>
          </div>
          <div className="font-light tracking-wide">
            <ReactMarkdown
              components={{
                ul: ({ children }) => (<ul className="list-disc ml-6">{children}</ul>),
                ol: ({ children }) => (<ol className="list-decimal ml-6">{children}</ol>),
                // TODO: Add support for providing alt text for images
                img: (props) => (<img className="w-1/2" alt="Attachment" {...props}></img>),
                a: (props) => (<a className="text-frost-300" {...props}></a>),
                h1: (props) => (<h1 className="text-2xl font-bold" {...props}></h1>),
                h2: (props) => (<h2 className="text-xl font-bold" {...props}></h2>),
                h3: (props) => (<h3 className="text-lg font-bold" {...props}></h3>),
                h4: (props) => (<h4 className="text-base font-bold" {...props}></h4>),
              }}
              rehypePlugins={[
                [ rehypeHighlight, { detect: false, ignoreMissing: true} ],
                [ rehypeKatex, { strict: false, output: 'mathml' } ]
              ]}
              remarkPlugins={[
                [ remarkGfm, { singleTilde: false } ],
                [ remarkMath ]
              ]}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </>
  );
}
