import { Dispatch, SetStateAction } from 'react';
import styles from '@/styles/Auth.module.css';
import {
  createSessionSchema,
  CreateSessionInput,
} from '@/types/client/session';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/types/database.supabase';
import { Input } from './Styles';
import EmailIcon from '../icons/EmailIcon';
import PasswordIcon from '../icons/PasswordIcon';

export default function Login({
  setServerError,
  setAuthType,
}: {
  setServerError: Dispatch<SetStateAction<string | null>>;
  setAuthType: Dispatch<SetStateAction<'login' | 'register' | 'resetPassword'>>;
}) {
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
    mode: 'onChange',
  });

  const onSubmit = async (formData: CreateSessionInput) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setServerError(error.message);
      setTimeout(() => {
        setServerError(null);
      }, 7000);
    }
    if (data && !error) {
      router.push('/');
    }
  };
  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
      <div className="relative mt-5">
        <div className={`${errors.email ? styles.iconError : styles.icon} `}>
          <EmailIcon />
        </div>
        <input
          type="email"
          className={`${Input()} ${styles.input}`}
          placeholder="Enter Email"
          {...register('email')}
        ></input>
        {errors.email && (
          <p className="text-red-700 mt-1 text-sm font-bold">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className={`${errors.email ? 'mt-2' : 'mt-7'}  relative`}>
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
      <span
        onClick={() => setAuthType('resetPassword')}
        className="text-sm mt-3 text-frost-800 font-bold hover:text-frost-600 hover:cursor-pointer"
      >
        Forgot password?
      </span>

      <div className={`${errors.password ? 'mt-7' : 'mt-8'}  relative`}>
        <button
          className={`
           ${styles.button} 
           bg-frost-600 
           hover:bg-frost-700
           disabled:bg-grey-600
           active:shadow-sm
           active:bg-frost-800
           font-bold 
           py-2 px-4 
           w-full 
           rounded-2xl 
           tracking-widest 
           text-frost-100 
           text-2xl
          `}
          type="submit"
          disabled={isSubmitting}
        >
          Login
        </button>
      </div>
    </form>
  );
}
