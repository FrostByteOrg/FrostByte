import Modal from '@/components/home/modals/Modal';
import EditUser from '@/components/home/EditUserMenu';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { Profile } from '@/types/dbtypes';
import { useMediaQuery } from 'react-responsive';

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
  const checkMobile = useMediaQuery({ query: '(max-width: 500px)' });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(checkMobile);
  }, [checkMobile]);

  return (
    <Modal
      modalRef={updateUserRef}
      showModal={showModal}
      title={'User Profile'}
      buttonsClassName={
        isMobile
          ? 'flex justify-start space-x-5 items-center mt-4'
          : 'flex justify-end space-x-5 items-center mt-4'
      }
      buttons={
        <>
          <div
            className="hover:underline hover:cursor-pointer"
            onClick={() => {
              setShowModal(false);
              updateUserRef.current?.close();
            }}
          >
            Cancel
          </div>
        </>
      }
    >
      <EditUser />
    </Modal>
  );
}
