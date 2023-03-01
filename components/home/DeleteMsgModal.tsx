import { deleteMessage } from '@/services/message.service';
import { Dispatch, RefObject, SetStateAction, useRef } from 'react';
import UserIcon from '@/components/icons/UserIcon';
import MessageContent from '@/components/home/MessageContent';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import styles from '@/styles/Chat.module.css';
import { useEffect } from 'react';

export default function DeleteMsgModal({
  showModal,
  message,
  displayTime,
  setMessageOptions,
}: {
  showModal: boolean;
  message: any;
  displayTime: string;
  setMessageOptions: Dispatch<SetStateAction<'delete' | 'edit' | null>>;
}) {
  const supabase = useSupabaseClient();

  const modal = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (showModal) modal.current?.showModal();
  }, [showModal]);

  return (
    <dialog ref={modal} className={`${styles.modal} rounded-lg `}>
      <div className="bg-grey-900 p-4 rounded-lg  z-50 ">
        <div className="text-2xl font-semibold tracking-wide">
          Are you sure you want to delete this message?
        </div>
        <div className="px-2 pt-4 pb-4 flex flex-col">
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
          <div className="font-light tracking-wide ml-8 -mt-2  rounded-lg p-1 transition-colors break-all relative flex items-center">
            <MessageContent messageContent={message.content} />
          </div>
        </div>
        <div className=" border-t-2 mx-5 border-grey-700"></div>
        <div className="flex justify-end space-x-5 items-center mt-4">
          <div
            className="hover:underline hover:cursor-pointer"
            onClick={() => {
              setMessageOptions(null);
              modal.current?.close();
            }}
          >
            Cancel
          </div>
          <div
            className="bg-red-500 py-2 px-5 rounded-lg hover:cursor-pointer hover:bg-red-700"
            onClick={() => {
              setMessageOptions(null);
              modal.current?.close();
              deleteMessage(supabase, message.id);
            }}
          >
            Delete
          </div>
        </div>
      </div>
    </dialog>
  );
}
