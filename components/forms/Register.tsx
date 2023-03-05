import { Dispatch, SetStateAction } from 'react';
import styles from '@/styles/Auth.module.css';
import { createUserSchema, CreateUserInput } from '@/types/client/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/types/database.supabase';
import { Input } from './Styles';
import EmailIcon from '../icons/EmailIcon';
import PasswordIcon from '../icons/PasswordIcon';
import UsernameIcon from '../icons/UsernameIcon';

export default function Register({
  setServerError,
  setAuthType,
}: {
  setServerError: Dispatch<SetStateAction<string | null>>;
  setAuthType: Dispatch<SetStateAction<'login' | 'register' | 'resetPassword'>>;
}) {
  const supabase = useSupabaseClient<Database>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    mode: 'onChange',
  });

  const onSubmit = async (formData: CreateUserInput) => {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          username: formData.username,
        },
      },
    });
    if (error) {
      setServerError(error.message);
      setTimeout(() => {
        setServerError(null);
      }, 7000);
    }
    if (data && !error) {
      setAuthType('login');
    }
  };

  return (
    <form
      className="flex flex-col justify-evenly mt-3 relative"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="relative">
        <div className={`${errors.username ? styles.iconError : styles.icon} `}>
          <UsernameIcon />
        </div>
        <input
          type="text"
          className={`${Input()} ${styles.input}`}
          placeholder="Enter Username"
          {...register('username')}
        ></input>
        {errors.username && (
          <span className="text-red-700 mt-1 text-sm font-bold">
            {errors.username.message}
          </span>
        )}
      </div>
      <div className={`${errors.username ? 'mt-2' : 'mt-6'}  relative`}>
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

      <div className={`${errors.email ? 'mt-2' : 'mt-6'}  relative`}>
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
      <div className={`${errors.passwordConfirmation ? 'mt-3' : 'mt-6'} `}>
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
          Register
        </button>
      </div>
    </form>
  );
}
