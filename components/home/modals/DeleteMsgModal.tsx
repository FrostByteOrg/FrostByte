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
import { useAreButtonsEnabled, useSetButtonsEnabled } from '@/lib/store';

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
  const setButtonsEnabled = useSetButtonsEnabled();
  const areButtonsEnabled = useAreButtonsEnabled();

  return (
    <Modal
      size="small"
      modalRef={modalRef}
      showModal={showModal}
      title={'Are you sure you want to delete this message?'}
      buttons={
        <>
          <Button
            fill1="hsla(198, 80%, 45%,0.6)"
            fill2="hsla(198, 80%, 45%,0.08)"
            text="CANCEL"
            initX={80}
            initY={40}
            y={135}
            size="small"
            onClick={
              areButtonsEnabled
                ? () => {
                    setMessageOptions(null);
                    setButtonsEnabled(false);
                    modalRef.current?.close();
                  }
                : () => null
            }
            twStyles={`${areButtonsEnabled ? 'hover:cursor-pointer' : ''}`}
          />

          <Button
            fill1="hsla(198, 70%, 55%,0.15)"
            fill2="hsla(198, 70%, 55%,0.01)"
            stroke2Opacity={0.8}
            text="DELETE"
            initX={-80}
            initY={40}
            x={60}
            y={150}
            size="small"
            onClick={
              areButtonsEnabled
                ? () => {
                    setMessageOptions(null);
                    setButtonsEnabled(false);
                    modalRef.current?.close();

                    setTimeout(() => {
                      deleteMessage(supabase, message.id);
                    }, 1500);
                  }
                : () => null
            }
            twStyles={`${areButtonsEnabled ? 'hover:cursor-pointer' : ''}`}
          />
        </>
      }
      contentY={75}
      initContentY={50}
      titleY={75}
      titleX={15}
      initTitleX={-10}
      titleScale={0.85}
      titleTextX={-150}
      initTitleTextX={-150}
      initTitleScale={0.5}
      initTitleOpacity={0.015}
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
