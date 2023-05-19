import Modal from '@/components/home/modals/Modal';
import EditUser from '@/components/home/EditUserMenu';
import { Dispatch, SetStateAction, useRef } from 'react';
import { Profile } from '@/types/dbtypes';
import Button from '@/components/svgs/Button';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import router from 'next/router';

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

  const supabase = useSupabaseClient();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log(error);
    router.push('/login');
  };

  return (
    <Modal
      modalRef={updateUserRef}
      showModal={showModal}
      size="big"
      title={'User Profile'}
      titleTextX={50}
      initTitleTextX={50}
      buttons={
        <>
          <Button
            twStyles="hover:underline hover:cursor-pointer"
            y={25}
            x={0}
            initX={150}
            text="Cancel"
            onClick={() => {
              setShowModal(false);
              updateUserRef.current?.close();
            }}
          />
          <Button
            twStyles="hover:underline hover:cursor-pointer"
            y={50}
            x={40}
            initX={-150}
            text="Log out"
            onClick={() => {
              handleLogout();
            }}
          />
        </>
      }
    >
      <EditUser />
    </Modal>
  );
}
