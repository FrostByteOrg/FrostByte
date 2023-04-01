import Modal from '@/components/home/Modal';
import EditUser from '@/components/forms/EditUser';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { UpdateUserProfileResponseSuccess, getProfile, updateUserProfile } from '@/services/profile.service';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { PostgrestError } from '@supabase/supabase-js';
import { Set } from 'typescript';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateUserInput, updateUserSchema } from '@/types/client/user';
import { User } from '@/types/dbtypes';

export default function EditUserModal({
  showModal,
  setShowModal,
  user
} : {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  user: User
}){
  const supabase = useSupabaseClient();
  const updateUserRef = useRef<HTMLDialogElement>(null);
  const [editUser, setEditUser] = useState<User>();

  setEditUser(user);

  const {
    handleSubmit,
    reset,
    formState: {errors},
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    mode: 'onSubmit'
  });

  const onSubmit = async(formData: UpdateUserInput) => {
    const {data, error} = await updateUserProfile(
      supabase,
      user.id,
      formData.full_name,
      formData.website,
      formData.avatarUrl,
      formData.password,
    );
  };
  return(
    <Modal
      modalRef={updateUserRef}
      showModal={showModal}
      title={'User Settings'}
      buttons={
        <>
          <div
            className="hover:underline hover:cursor-pointer"
            onClick={() => {
              setShowModal(false);
              reset();
              updateUserRef.current?.close();
            }}
          >
            Cancel
          </div>
          <div
            className="bg-frost-500 py-2 px-5 rounded-lg hover:cursor-pointer hover:bg-frost-700"
            onClick={() => {
              handleSubmit(onSubmit)();
            }}
          >
            Submit
          </div>
        </>
      }
    >
      <EditUser/>
    </Modal>
  );
}; 