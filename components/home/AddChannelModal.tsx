import AddChannel from '@/components/forms/AddChannel';
import Modal from '@/components/home/Modal';
import {
  CreateChannelInput,
  createChannelSchema,
} from '@/types/client/channel';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function AddChannelModal({
  showModal,
  setShowModal,
  serverId,
}: {
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  serverId: number;
}) {
  const addChannelRef = useRef<HTMLDialogElement>(null);

  const [serverError, setServerError] = useState<string>('');
  const [showDesc, setSetShowDesc] = useState<boolean>(false);
  const [channelType, setChannelType] = useState<'media' | 'text'>('text');

  const supabase = useSupabaseClient();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateChannelInput>({
    resolver: zodResolver(createChannelSchema),
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      description: '',
      isMedia: false,
    },
  });

  const onSubmit = async (formData: CreateChannelInput) => {
    //
    console.log(serverId);

    // setChannelType('text');
  };

  return (
    <Modal
      modalRef={addChannelRef}
      showModal={showModal}
      title={'Create a new Channel'}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleSubmit(onSubmit)();
        }
      }}
      buttons={
        <>
          <div
            className="hover:underline hover:cursor-pointer"
            onClick={() => {
              setShowModal(false);
              setSetShowDesc(false);
              setChannelType('text');
              reset();
              addChannelRef.current?.close();
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
      <AddChannel
        register={register}
        errors={errors}
        serverError={serverError}
        showDesc={showDesc}
        setShowDesc={setSetShowDesc}
        control={control}
        channelType={channelType}
        setChannelType={setChannelType}
      />
    </Modal>
  );
}
