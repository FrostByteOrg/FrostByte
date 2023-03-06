import AddServer from '@/components/forms/AddServer';
import Modal from '@/components/home/Modal';
import { CreateServerInput, createServerSchema } from '@/types/client/server';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { createServer } from '@/services/server.service';

export default function AddServerModal({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}) {
  const addServerRef = useRef<HTMLDialogElement>(null);
  const [serverImage, setServerImage] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateServerInput>({
    resolver: zodResolver(createServerSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (formData: CreateServerInput) => {
    // const { data, error } = await supabase.auth.signInWithPassword({
    //   email: formData.email,
    //   password: formData.password,
    // });
    // if (error) {
    //   setServerError(error.message);
    //   setTimeout(() => {
    //     setServerError(null);
    //   }, 7000);
    // }
    // if (data && !error) {
    //   router.push('/');
    // }

    addServerRef.current?.close();
    reset();
    setShowModal(false);
  };

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
              setServerImage(null);
              setShowModal(false);
              reset();
              addServerRef.current?.close();
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
      <AddServer
        serverImage={serverImage}
        setServerImage={setServerImage}
        showModal={showModal}
        register={register}
        errors={errors}
      />
    </Modal>
  );
}
