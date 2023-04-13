import { Input } from './Styles';
import { UseFormRegister } from 'react-hook-form';
import styles from '@/styles/Livekit.module.css';
import { CreateInviteFormInput } from '@/types/client/forms/createInvite';

export function CreateInviteform({
  register,
}: {
  register: UseFormRegister<CreateInviteFormInput>;
}) {
  return (
    <form className="flex flex-col space-y-4">
      <div className="flex flex-col">
        <label htmlFor="numUses">Max number of uses</label>
        <select
          id="numUses"
          {...(register('numUses'), { valueAsNumber: true })}
          className={`${Input('bg-grey-700')} mt-2 ${styles.input}`}
        >
          <option value="-1">Unlimited</option>
          <option value="1">1</option>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </select>
      </div>

      <div className="flex flex-col">
        <label htmlFor="expiresAt">Expires in...</label>
        <select
          id="expiresAt"
          {...register('expiresAt')}
          className={`${Input('bg-grey-700')} mt-2 ${styles.input}`}
        >
          <option value="1 week">1 week</option>
          <option value="1 day">1 day</option>
          <option value="1 hour">1 hour</option>
          <option value="30 minutes">30 minutes</option>
          <option value="null">Never</option>
        </select>
      </div>
    </form>
  );
}
