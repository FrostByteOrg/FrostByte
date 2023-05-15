import { deleteMessage } from '@/services/message.service';
import { Dispatch, RefObject, SetStateAction, useRef } from 'react';
import UserIcon from '@/components/icons/UserIcon';
import MessageContent from '@/components/home/MessageContent';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import styles from '@/styles/Components.module.css';
import { useEffect } from 'react';
import Modal from '@/components/home/modals/Modal';
import {
  Message,
  MessageWithServerProfile,
  ServerUserProfile,
} from '@/types/dbtypes';
import Button from '@/components/svgs/Button';

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
  const supabase = useSupabaseClient();

  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <Modal
      size="small"
      modalRef={modalRef}
      showModal={showModal}
      title="Are you sure you want to delete this message?"
      buttons={
        <>
          <div
            className=" hover:cursor-pointer"
            onClick={() => {
              setMessageOptions(null);
              modalRef.current?.close();
            }}
          >
            <Button
              fill1="hsla(198, 80%, 45%,0.6)"
              fill2="hsla(198, 80%, 45%,0.08)"
              text="CANCEL"
              initX={80}
              initY={40}
              y={110}
            />
          </div>
          <div
            className=" hover:cursor-pointer "
            onClick={() => {
              setMessageOptions(null);

              modalRef.current?.close();

              setTimeout(() => {
                deleteMessage(supabase, message.id);
              }, 1500);
            }}
          >
            <Button
              fill1="hsla(198, 70%, 55%,0.15)"
              fill2="hsla(198, 70%, 55%,0.01)"
              stroke2Opacity={0.8}
              text="DELETE"
              initX={-80}
              initY={40}
              x={60}
              y={125}
            />
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
