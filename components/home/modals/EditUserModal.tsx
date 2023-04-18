import Modal from '@/components/home/modals/Modal';
import EditUser from '@/components/home/EditUserMenu';
import { Dispatch, SetStateAction, useRef} from 'react';
import { Profile } from '@/types/dbtypes';

export default function EditUserModal({
  showModal,
  setShowModal,
  user,
}: {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  user?: Profile;
}) {
  const updateUserRef = useRef<HTMLDialogElement>(null);

  return (
    <Modal
      modalRef={updateUserRef}
      showModal={showModal}
      title={'User Profile'}
      buttons={
        <>
          <div
            className='hover:underline hover:cursor-pointer'
            onClick={() => {
              setShowModal(false);
              updateUserRef.current?.close();
            }}>
            Cancel
          </div>
        </>
      }>
      <EditUser />
    </Modal>
  );
}
