import AddChannel from '@/components/forms/AddChannel';
import Modal from '@/components/home/modals/Modal';
import {
  CreateChannelInput,
  createChannelSchema,
} from '@/types/client/channel';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { createChannel } from '@/services/channels.service';
import { PostgrestError } from '@supabase/supabase-js';
import { useGetUserPermsForServer } from '@/lib/store';
import Button from '@/components/svgs/Button';

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
  const user = useUser();
  const getUserServerPerms = useGetUserPermsForServer();

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

  useEffect(() => {
    if (getUserServerPerms) {
      if (user) {
        getUserServerPerms(supabase, serverId, user.id);
      }
    }
  }, [user, getUserServerPerms, supabase, serverId]);

  const onSubmit = async (formData: CreateChannelInput) => {
    const { data, error } = await createChannel(
      supabase,
      serverId,
      formData.name,
      formData.description,
      formData.isMedia
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
    } else {
      addChannelRef.current?.close();
      setChannelType('text');
      setSetShowDesc(false);
      reset();
      setShowModal(false);
    }
  };

  return (
    <Modal
      size="small"
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
          <Button
            twStyles=" hover:cursor-pointer"
            onClick={() => {
              setShowModal(false);
              setSetShowDesc(false);
              setChannelType('text');
              reset();
              addChannelRef.current?.close();
            }}
            y={50}
            x={20}
            text="Cancel"
          />

          <Button
            twStyles=" hover:cursor-pointer "
            onClick={() => {
              handleSubmit(onSubmit)();
            }}
            y={75}
            x={55}
            text="Submit"
          />
        </>
      }
      contentY={35}
      contentX={10}
      initContentY={50}
      titleY={75}
      titleX={15}
      initTitleX={-55}
      titleScale={0.85}
      initTitleScale={0.5}
      initTitleOpacity={0.015}
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
