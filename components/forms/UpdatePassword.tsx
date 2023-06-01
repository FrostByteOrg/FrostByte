import { Input } from './Styles';
import styles from '@/styles/Auth.module.css';
import {
  createUpdatePasswordSchema,
  CreateUpdatePasswordInput,
} from '@/types/client/updatePassword';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Database } from '@/types/database.supabase';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';
import PasswordIcon from '../icons/PasswordIcon';

export default function UpdatePassword({
  setServerError,
}: {
  setServerError: Dispatch<SetStateAction<string | null>>;
}) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUpdatePasswordInput>({
    resolver: zodResolver(createUpdatePasswordSchema),
    mode: 'onChange',
  });

  const onSubmit = async (formData: CreateUpdatePasswordInput) => {
    const { data, error } = await supabase.auth.updateUser({
      password: formData.password,
    });

    if (error) {
      setServerError(error.message);
      setTimeout(() => {
        setServerError(null);
      }, 7000);
    }
    if (data && !error) {
      toast.success('Password successfully updated', {
        position: 'top-center',
        autoClose: 3000,
      });
      router.push('/');
    }
  };

  return (
    <form className="flex flex-col mt-7" onSubmit={handleSubmit(onSubmit)}>
      <label htmlFor="email" className="mt-6">
        New Password:
      </label>
      <div className="mt-3  relative">
        <div className={`${errors.password ? styles.iconError : styles.icon} `}>
          <PasswordIcon />
        </div>
        <input
          type="password"
          className={`${Input()} ${styles.input}`}
          placeholder="Enter password"
          {...register('password')}
        ></input>
        {errors.password && (
          <p className="text-red-700 mt-1 text-sm font-bold">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className={`${errors.password ? 'mt-2' : 'mt-6'}  relative`}>
        <div
          className={`${
            errors.passwordConfirmation ? styles.iconError : styles.icon
          } `}
        >
          <PasswordIcon />
        </div>
        <input
          type="password"
          className={`${Input()} ${styles.input}`}
          placeholder="Confirm password"
          {...register('passwordConfirmation')}
        ></input>
        {errors.passwordConfirmation && (
          <p className="text-red-700 mt-1 text-sm font-bold">
            {errors.passwordConfirmation.message}
          </p>
        )}
      </div>

      <div className={`${errors.passwordConfirmation ? 'mt-5' : 'mt-7'} `}>
        <button
          className={`
           bg-frost-600
           hover:bg-frost-700
           disabled:bg-grey-600
           active:shadow-sm
           active:bg-frost-800
           font-bold 
           py-2 
           px-4 
           w-full 
           rounded-2xl 
           tracking-widest 
           text-frost-100 
           text-2xl 
           ${styles.button}
          `}
          type="submit"
          disabled={isSubmitting}
        >
          Submit
        </button>
      </div>
    </form>
  );
}
