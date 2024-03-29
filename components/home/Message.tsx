import UserIcon from '../icons/UserIcon';
import moment from 'moment';
import { Tooltip } from 'react-tooltip';
import { useEffect, useRef, useState, KeyboardEvent } from 'react';
import TrashIcon from '@/components/icons/TrashIcon';
import EditIcon from '@/components/icons/EditIcon';
import { editMessage } from '@/services/message.service';
import { useUser } from '@supabase/auth-helpers-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import MessageContent from './MessageContent';
import DeleteMsgModal from '@/components/home/DeleteMsgModal';
import {
  Message as MessageType,
  MessageWithServerProfile,
} from '@/types/dbtypes';
import { MessageHeader } from './MessageHeader';
import { useChannel, useServerUserProfile } from '@/lib/store';
import { formatDateStr } from '@/lib/dateManagement';

export default function Message({
  message,
  collapse_user,
  hasDeletePerms = false,
}: {
  message: MessageType;
  collapse_user: boolean;
  hasDeletePerms?: boolean;
}) {
  const displayTime = formatDateStr(message.sent_time);

  const supabase = createClientComponentClient();
  const user = useUser();
  const channel = useChannel();
  const [showOptions, setShowOptions] = useState<'show' | 'hide'>('hide');
  const [messageOptions, setMessageOptions] = useState<
    null | 'delete' | 'edit'
  >(null);
  const serverUser = useServerUserProfile(
    channel!.server_id,
    message.profile_id
  );

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
        {!collapse_user && serverUser && (
          <MessageHeader
            server_user_profile={serverUser}
            message_id={message.id}
            display_time={displayTime}
            edited={message.is_edited}
          />
        )}

        {/* TODO: figure out how to close modal on blur (cant use onBlur on the dialog cuz it takes up the entire screen meaning you can never focus off of it) */}

        {serverUser && (
          <DeleteMsgModal
            message={message}
            server_user_profile={serverUser}
            displayTime={displayTime}
            showModal={messageOptions == 'delete' ? true : false}
            setMessageOptions={setMessageOptions}
          />
        )}

        <div
          className="font-light tracking-wide ml-8 -mt-2 hover:bg-grey-900 rounded-lg p-1 transition-colors break-all relative flex flex-col items-start"
          onMouseEnter={() => {
            if ((user && user.id == message.profile_id) || hasDeletePerms)
              setShowOptions('show');
          }}
          onMouseLeave={() => setShowOptions('hide')}
        >
          <div
            className={`${
              showOptions == 'hide' ? 'hidden' : ''
            } absolute left-[90%] bottom-4 bg-grey-925 px-2 py-1 rounded-lg z-10 flex `}
          >
            {user && user.id == message.profile_id ? (
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
