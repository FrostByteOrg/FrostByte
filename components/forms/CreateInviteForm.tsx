import { Channel } from '@/types/dbtypes';
import { InviteExpiry } from '@/types/inviteExpiry';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useForm } from 'react-hook-form';

interface CreateInviteFormInput {
  numUses: number | null;
  expiresAt: InviteExpiry | null;
}

export function CreateInviteform({ channel }: { channel: Channel }) {
  const supabase = useSupabaseClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateInviteFormInput>({
    mode: 'onSubmit',
    defaultValues: {
      numUses: null,
      expiresAt: '1 week',
    },
  });

  const onSubmit = async (formData: CreateInviteFormInput) => {
    console.log(formData);
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="numUses">Number of uses</label>
      <input
        type="number"
        id="numUses"
        {...register('numUses')}
        className="border border-gray-300 rounded-md"
      />

      <label htmlFor="expiresAt">Expires at</label>
      <select
        id="expiresAt"
        {...register('expiresAt')}
        className="border border-gray-300 rounded-md"
      >
        <option value="1 week">1 week</option>
        <option value="1 day">1 day</option>
        <option value="1 hour">1 hour</option>
        <option value="30 minutes">30 minutes</option>
        <option value="null">Never</option>
      </select>
    </form>
  );
}
