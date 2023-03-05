import AddServer from '@/components/forms/AddServer';
import Modal from '@/components/home/Modal';
import { Dispatch, SetStateAction, useRef } from 'react';

export default function AddServerModal({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}) {
  const addServerRef = useRef<HTMLDialogElement>(null);

  return (
    <Modal
      modalRef={addServerRef}
      showModal={showModal}
      title={'Create a new Server'}
      buttons={
        <>
          <div
            className="hover:underline hover:cursor-pointer"
            onClick={() => {
              setShowModal(false);
              addServerRef.current?.close();
            }}
          >
            Cancel
          </div>
          <div
            className="bg-frost-500 py-2 px-5 rounded-lg hover:cursor-pointer hover:bg-frost-700"
            onClick={() => {
              setShowModal(false);
              addServerRef.current?.close();
            }}
          >
            Submit
          </div>
        </>
      }
    >
      <AddServer />
    </Modal>
  );
}
