import AddServer from '@/components/forms/MutateServer';
import Modal from '@/components/home/modals/Modal';
import { CreateServerInput, createServerSchema } from '@/types/client/server';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  createServer,
  addServerIcon,
  getServer,
} from '@/services/server.service';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { PostgrestError } from '@supabase/supabase-js';
import Button from '@/components/svgs/Button';
import { Roboto_Slab } from 'next/font/google';

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
});

export default function AddServerModal({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}) {
  const addServerRef = useRef<HTMLDialogElement>(null);
  const [serverImage, setServerImage] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string>('');
  const [showDesc, setSetShowDesc] = useState<boolean>(false);

  const supabase = useSupabaseClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateServerInput>({
    resolver: zodResolver(createServerSchema),
    mode: 'onSubmit',
  });

  const onSubmit = async (formData: CreateServerInput) => {
    const { data, error } = await createServer(
      supabase,
      formData.name,
      formData.description
    );

    if (error) {
      if ((error as PostgrestError).message) {
        setServerError((error as PostgrestError).message);
      } else {
        setServerError(error as string);
      }

      setTimeout(() => {
        setServerError('');
      }, 7000);
      return;
    }

    const fileExt = serverImage?.name.split('.').pop();
    const fileName = `${data?.id}.${fileExt}`;
    const filePath = `${fileName}`;

    if (serverImage) {
      const { data: updatedServer, error: serverImgError } =
        await addServerIcon(supabase, filePath, serverImage, data!.id);

      if (serverImgError) {
        if ((serverImgError as PostgrestError).message) {
          setServerError((serverImgError as PostgrestError).message);
        } else {
          setServerError(error as string);
        }

        setTimeout(() => {
          setServerError('');
        }, 7000);
        return;
      }

      addServerRef.current?.close();
      setServerImage(null);
      setSetShowDesc(false);
      reset();
      setShowModal(false);
    } else {
      addServerRef.current?.close();
      setServerImage(null);
      setSetShowDesc(false);
      reset();
      setShowModal(false);
    }
  };

  return (
    <Modal
      size="big"
      modalRef={addServerRef}
      showModal={showModal}
      title={'Create a new Server'}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSubmit(onSubmit)();
        } else if (e.key === 'Escape') {
          addServerRef.current?.close();
          setServerImage(null);
          setSetShowDesc(false);
          reset();
          setShowModal(false);
        }
      }}
      buttons={
        <>
          <div
            className={`${robotoSlab.className} flex flex-col justify-end items-center mt-4 space-y-4`}
          >
            <div
              className=" rounded-lg hover:cursor-pointer relative"
              onClick={() => {
                handleSubmit(onSubmit)();
              }}
            >
              <Button
                fill1="hsla(198, 80%, 45%,0.6)"
                fill2="hsla(198, 80%, 45%,0.08)"
                text="SUBMIT"
                initX={40}
                initY={40}
              />
            </div>
            <div
              className=" hover:cursor-pointer relative"
              onClick={() => {
                setServerImage(null);
                setShowModal(false);
                setSetShowDesc(false);
                reset();
                addServerRef.current?.close();
              }}
            >
              <Button
                fill1="hsla(198, 70%, 55%,0.15)"
                fill2="hsla(198, 70%, 55%,0.01)"
                stroke2Opacity={0.8}
                text="CANCEL"
                initX={80}
                initY={40}
                x={60}
              />
            </div>
          </div>
        </>
      }
    >
      <AddServer
        serverImage={serverImage}
        setServerImage={setServerImage}
        register={register}
        errors={errors}
        serverError={serverError}
        showDesc={showDesc}
        setShowDesc={setSetShowDesc}
      />
    </Modal>
  );
}
