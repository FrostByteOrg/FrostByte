import { deleteMessage } from '@/services/message.service';
import { Dispatch, RefObject, SetStateAction, useRef } from 'react';
import UserIcon from '@/components/icons/UserIcon';
import MessageContent from '@/components/home/MessageContent';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import styles from '@/styles/Components.module.css';
import { useEffect } from 'react';
import Modal from '@/components/home/modals/Modal';
import {
  Message,
  MessageWithServerProfile,
  ServerUserProfile,
} from '@/types/dbtypes';

export default function DeleteMsgModal({
  showModal,
  message,
  server_user_profile,
  displayTime,
  setMessageOptions,
}: {
  showModal: boolean;
  message: Message;
  server_user_profile: ServerUserProfile;
  displayTime: string;
  setMessageOptions: Dispatch<SetStateAction<'delete' | 'edit' | null>>;
}) {
  const supabase = createClientComponentClient();

  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <Modal
      modalRef={modalRef}
      showModal={showModal}
      title="Are you sure you want to delete this message?"
      buttons={
        <>
          <div
            className="hover:underline hover:cursor-pointer"
            onClick={() => {
              setMessageOptions(null);
              modalRef.current?.close();
            }}
          >
            Cancel
          </div>
          <div
            className="bg-red-500 py-2 px-5 rounded-lg hover:cursor-pointer hover:bg-red-700"
            onClick={() => {
              setMessageOptions(null);
              modalRef.current?.close();
              deleteMessage(supabase, message.id);
            }}
          >
            Delete
          </div>
        </>
      }
    >
      <>
        <div className="flex-grow flex flex-row">
          <UserIcon user={server_user_profile} />
          <div className="flex-grow flex items-center">
            <div className="text-xl font-semibold tracking-wider mr-2">
              {server_user_profile.username}
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
      </>
    </Modal>
  );
}
