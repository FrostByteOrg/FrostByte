import UserIcon from '../icons/UserIcon';
import moment from 'moment';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkBreaks from 'remark-breaks';
import { Tooltip } from 'react-tooltip';
import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import TrashIcon from '@/components/icons/TrashIcon';
import EditIcon from '@/components/icons/EditIcon';
import { editMessage } from '@/services/message.service';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

// NOTE: Any here because of the way Supabase has incorrectly typed the message object as an array when it is in fact, not.
export default function Message({
  message,
  collapse_user,
}: {
  message: any;
  collapse_user: boolean;
}) {
  const pastDate = moment(message.sent_time).format('MM/DD/YYYY h:mm A');
  const todayDate = moment(message.sent_time).format('h:mm A');
  const displayTime =
    moment(moment(message.sent_time)).isSame(moment(), 'day') &&
    moment(moment(message.sent_time)).isSame(moment(), 'year') &&
    moment(moment(message.sent_time)).isSame(moment(), 'month')
      ? `Today at ${todayDate}`
      : pastDate;

  const supabase = useSupabaseClient();

  const [showOptions, setShowOptions] = useState<'show' | 'hide'>('hide');
  const [messageOptions, setMessageOptions] = useState<
    null | 'delete' | 'edit'
  >(null);

  const chatMessage = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messageOptions == 'edit') {
      chatMessage.current?.focus();
    }
  }, [messageOptions]);

  function handleKeyPress(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setMessageOptions(null);
    }

    if (e.key === 'Enter') {
      console.log(message.id, chatMessage.current?.value);
      if (chatMessage.current?.value !== '')
        editMessage(supabase, message.id, chatMessage.current?.value as string);

      setMessageOptions(null);
    }
  }

  return (
    <>
      <div className="px-2 pt-4 pb-4 flex flex-col">
        {!collapse_user && (
          <div className="flex-grow flex flex-row">
            <UserIcon user={message.profiles} />
            <div className="flex-grow flex items-center">
              <div className="text-xl font-semibold tracking-wider mr-2">
                {message.profiles.username}
              </div>
              <div className="text-xs tracking-wider text-grey-300 mt-1">
                {displayTime}{' '}
                {message.is_edited && (
                  <span className="text-gray-400">(edited)</span>
                )}
              </div>
            </div>
          </div>
        )}

        <div
          className="font-light tracking-wide ml-8 -mt-2 hover:bg-grey-900 rounded-lg p-1 transition-colors break-all relative flex items-center"
          onMouseEnter={() => setShowOptions('show')}
          onMouseLeave={() => setShowOptions('hide')}
        >
          <div
            className={`${
              showOptions == 'hide' ? 'hidden' : ''
            } absolute left-[90%] bottom-4 bg-grey-925 px-2 py-1 rounded-lg z-10 flex `}
          >
            <span onClick={() => setMessageOptions('edit')}>
              <EditIcon styles="mr-1 hover:bg-grey-600 rounded-lg hover:cursor-pointer" />
            </span>
            <span onClick={() => setMessageOptions('delete')}>
              <TrashIcon styles="hover:bg-grey-600 rounded-lg hover:cursor-pointer" />
            </span>
          </div>
          <Tooltip id="link-id" />
          {messageOptions == 'edit' ? (
            <span className="grow">
              <input
                type="text"
                className="w-full bg-grey-900 focus:outline-none px-2 py-1 rounded-lg"
                defaultValue={message.content}
                ref={chatMessage}
                onKeyDown={(e) => handleKeyPress(e)}
              />
              <span className="text-sm  px-2 py-1 ">
                escape to{' '}
                <span
                  className="text-frost-400 hover:cursor-pointer hover:underline"
                  onClick={() => setMessageOptions(null)}
                >
                  cancel
                </span>{' '}
                • enter to{' '}
                <span
                  className="text-frost-400 hover:cursor-pointer hover:underline"
                  onClick={() => {
                    if (chatMessage.current?.value !== '')
                      editMessage(
                        supabase,
                        message.id,
                        chatMessage.current?.value as string
                      );
                    setMessageOptions(null);
                  }}
                >
                  save
                </span>
              </span>
            </span>
          ) : (
            <ReactMarkdown
              components={{
                ul: ({ children }) => (
                  <ul className="list-disc ml-6">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal ml-6">{children}</ol>
                ),
                // TODO: Add support for providing alt text for images
                img: (props) => (
                  <img className="max-w-4xl" alt="Attachment" {...props}></img>
                ),
                a: (props) => (
                  <>
                    <a
                      data-tooltip-id="link-id"
                      data-tooltip-place="top"
                      data-tooltip-content={`${props.href}`}
                      className="text-frost-300"
                      {...props}
                    >
                      {props.children}
                    </a>
                  </>
                ),
                h1: (props) => (
                  <h1 className="text-2xl font-bold" {...props}></h1>
                ),
                h2: (props) => (
                  <h2 className="text-xl font-bold" {...props}></h2>
                ),
                h3: (props) => (
                  <h3 className="text-lg font-bold" {...props}></h3>
                ),
                h4: (props) => (
                  <h4 className="text-base font-bold" {...props}></h4>
                ),
                h5: (props) => (
                  <h5 className="text-sm font-bold" {...props}></h5>
                ),
                h6: (props) => (
                  <h6 className="text-xs font-bold" {...props}></h6>
                ),
                table: (props) => (
                  <table className="table-auto" {...props}></table>
                ),
                thead: (props) => (
                  <thead className="bg-grey-800" {...props}></thead>
                ),
                tbody: (props) => (
                  <tbody className="bg-grey-700" {...props}></tbody>
                ),
                tr: (props) => (
                  <tr className="border-b border-grey-600" {...props}></tr>
                ),
                th: (props) => <th className="px-4 py-2" {...props}></th>,
                td: (props) => <td className="px-4 py-2" {...props}></td>,
                blockquote: (props) => (
                  <blockquote
                    className="border-l-4 border-grey-600 pl-4"
                    {...props}
                  ></blockquote>
                ),
              }}
              rehypePlugins={[
                [rehypeHighlight, { detect: false, ignoreMissing: true }],
                [rehypeKatex, { strict: false, output: 'mathml' }],
              ]}
              remarkPlugins={[
                [
                  remarkGfm,
                  {
                    singleTilde: false,
                    tableCellPadding: false,
                    tablePipeAlign: false,
                  },
                ],
                [remarkMath],
                [remarkBreaks],
              ]}
            >
              {message.content}
            </ReactMarkdown>
          )}

          {collapse_user && message.is_edited && (
            <span className="text-grey-400 text-xs ml-2">(edited)</span>
          )}
        </div>
      </div>
    </>
  );
}
