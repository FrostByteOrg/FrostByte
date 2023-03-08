import UserIcon from '../icons/UserIcon';
import moment from 'moment';
import { Tooltip } from 'react-tooltip';
import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import TrashIcon from '@/components/icons/TrashIcon';
import EditIcon from '@/components/icons/EditIcon';
import { editMessage } from '@/services/message.service';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import MessageContent from './MessageContent';
import DeleteMsgModal from '@/components/home/DeleteMsgModal';
import { MiniProfile } from '../forms/MiniProfile';

// NOTE: Any here because of the way Supabase has incorrectly typed the message object as an array when it is in fact, not.
export default function Message({
  message,
  collapse_user,
  hasDeletePerms = false,
}: {
  message: any;
  collapse_user: boolean;
  hasDeletePerms?: boolean;
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
  const user = useUser();

  const [showOptions, setShowOptions] = useState<'show' | 'hide'>('hide');
  const [messageOptions, setMessageOptions] = useState<null | 'delete' | 'edit'>(null);

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
      if (
        chatMessage.current?.value !== '' &&
        chatMessage.current?.value !== message.content
      )
        editMessage(supabase, message.id, chatMessage.current?.value as string);

      setMessageOptions(null);
    }
  }

  return (
    <>
      <div className="px-2 pt-1 pb-1 flex flex-col">
        {!collapse_user && (
          <div className="flex-grow flex flex-row">
            <Tooltip id="miniprofile" className='z-20 !w-12' clickable>
              <MiniProfile user={message.profiles} nickname={message.server_users.nickname} />
            </Tooltip>
            <UserIcon user={message.profiles} data-tooltip-id='miniprofile'/>
            <div className="flex-grow flex items-center">
              <div className="text-xl font-semibold tracking-wider mr-2" data-tooltip-id='miniprofile'>
                {message.server_users.nickname || message.profiles.username}
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

        {/* TODO: figure out how to close modal on blur (cant use onBlur on the dialog cuz it takes up the entire screen meaning you can never focus off of it) */}

        <DeleteMsgModal
          message={message}
          displayTime={displayTime}
          showModal={messageOptions == 'delete' ? true : false}
          setMessageOptions={setMessageOptions}
        />

        <div
          className="font-light tracking-wide ml-8 -mt-2 hover:bg-grey-900 rounded-lg p-1 transition-colors break-all relative flex flex-col items-start"
          onMouseEnter={() => {
            if ((user && user.id == message.profiles.id) || hasDeletePerms)
              setShowOptions('show');
          }}
          onMouseLeave={() => setShowOptions('hide')}
        >
          <div
            className={`${
              showOptions == 'hide' ? 'hidden' : ''
            } absolute left-[90%] bottom-4 bg-grey-925 px-2 py-1 rounded-lg z-10 flex `}
          >
            {user && user.id == message.profiles.id ? (
              <span onClick={() => setMessageOptions('edit')}>
                <EditIcon styles="mr-1 hover:bg-grey-600 rounded-lg hover:cursor-pointer" />
              </span>
            ) : (
              ''
            )}

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
                  onClick={() => {
                    setMessageOptions(null);
                    setShowOptions('hide');
                  }}
                >
                  cancel
                </span>{' '}
                • enter to{' '}
                <span
                  className="text-frost-400 hover:cursor-pointer hover:underline"
                  onClick={() => {
                    if (
                      chatMessage.current?.value !== '' &&
                      chatMessage.current?.value !== message.content
                    )
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
            <MessageContent messageContent={message.content} />
          )}

          {collapse_user && message.is_edited && (
            <span className="text-grey-400 text-xs ml-2">(edited)</span>
          )}
        </div>
      </div>
    </>
  );
}
