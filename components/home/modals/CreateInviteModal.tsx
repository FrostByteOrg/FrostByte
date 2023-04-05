import Modal from '@/components/home/modals/Modal';
import { Channel } from '@/types/dbtypes';
import { Dispatch, SetStateAction, useRef } from 'react';

export default function CreateInviteModal({
  showModal,
  setShowModal,
  channel,
}: {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  channel: Channel;
}) {
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <Modal
      modalRef={modalRef}
      showModal={showModal}
      title={'Create invite link'}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          // handleSubmit(onSubmit)();
        }
      }}
      buttons={
        <>
          <div
            className="hover:underline hover:cursor-pointer"
            onClick={() => {
              setShowModal(false);
              modalRef.current?.close();
            }}
          >
            Cancel
          </div>
          <div
            className="bg-frost-500 py-2 px-5 rounded-lg hover:cursor-pointer hover:bg-frost-700"
            onClick={() => {
              // handleSubmit(onSubmit)();
            }}
          >
            Submit
          </div>
        </>
      }
    >
      <div>beesechurger</div>
    </Modal>
  );
}
