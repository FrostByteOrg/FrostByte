import { CreateInviteform } from '@/components/forms/CreateInviteForm';
import Modal from '@/components/home/modals/Modal';
import { createInvite } from '@/services/invites.service';
import { Channel } from '@/types/dbtypes';
import { CreateInviteFormInput } from '@/types/forms/CreateInviteFormData';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Dispatch, SetStateAction, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';



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
  const supabase = useSupabaseClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInviteFormInput>({
    mode: 'onSubmit',
    defaultValues: {
      numUses: 'null',
      expiresAt: '1 week',
    },
  });

  const onSubmit = async (formData: CreateInviteFormInput) => {
    console.log(formData);

    // Try to parse values
    let numUses: number | null = null;
    if (formData.numUses) {
      numUses = parseInt(formData.numUses);

      if (isNaN(numUses)) {
        numUses = null;
      }
    }

    const { data, error } = await createInvite(
      supabase,
      channel.server_id,
      channel.channel_id,
      formData.expiresAt,
      numUses
    );

    if (error) {
      console.error(error);
      toast.error('Failed to create invite');
      return;
    }

    toast.success('Invite copied to clipboard');
    navigator.clipboard.writeText(`${window.location.origin}/invite/${data?.url_id}`);

    // Finally, close the modal
    setShowModal(false);
    modalRef.current?.close();
  };

  return (
    <Modal
      modalRef={modalRef}
      showModal={showModal}
      title={'Create invite link'}
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
              modalRef.current?.close();
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
            Create
          </div>
        </>
      }
    >
      <CreateInviteform register={register}/>
    </Modal>
  );
}
