import { Input } from './Styles';
import styles from '@/styles/Auth.module.css';
import { createUpdatePasswordSchema, CreateUpdatePasswordInput } from '@/types/client/updatePassword';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Database } from '@/types/database.supabase';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Dispatch, SetStateAction } from 'react';
import { toast } from 'react-toastify';
import { useRouter } from 'next/router';

export default function UpdatePassword({setServerError} : {setServerError: Dispatch<SetStateAction<string | null>>;}) {
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUpdatePasswordInput>({
    resolver: zodResolver(createUpdatePasswordSchema),
  });

  const onSubmit = async (formData: CreateUpdatePasswordInput) => {
    //TODO: disable updatePass button, loading spinner?
    const { data, error } = await supabase.auth.updateUser({
      password: formData.password
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
        autoClose: 3000
      });
      router.push('/');
    }
  };


  return (
    <form className="flex flex-col mt-7" onSubmit={handleSubmit(onSubmit)} >
      <label htmlFor="email" className="mt-6">
        New Password:
      </label>
      <div className='mt-3  relative'>
        <div className={`${errors.password ? styles.iconError : styles.icon} `}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 38 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.6667 20C7.88889 20 5.52778 19.0278 3.58334 17.0833C1.63889 15.1389 0.666672 12.7778 0.666672 10C0.666672 7.22222 1.63889 4.86111 3.58334 2.91667C5.52778 0.972222 7.88889 0 10.6667 0C12.9167 0 14.8822 0.631667 16.5633 1.895C18.2433 3.15944 19.4167 4.75 20.0833 6.66667H34C34.9167 6.66667 35.7017 6.99278 36.355 7.645C37.0072 8.29833 37.3333 9.08333 37.3333 10C37.3333 11 36.9861 11.8056 36.2917 12.4167C35.5972 13.0278 34.8333 13.3333 34 13.3333V16.6667C34 17.5833 33.6739 18.3683 33.0217 19.0217C32.3683 19.6739 31.5833 20 30.6667 20C29.75 20 28.965 19.6739 28.3117 19.0217C27.6594 18.3683 27.3333 17.5833 27.3333 16.6667V13.3333H20.0833C19.4167 15.25 18.2433 16.8406 16.5633 18.105C14.8822 19.3683 12.9167 20 10.6667 20ZM10.6667 13.3333C11.5833 13.3333 12.3678 13.0067 13.02 12.3533C13.6733 11.7011 14 10.9167 14 10C14 9.08333 13.6733 8.29833 13.02 7.645C12.3678 6.99278 11.5833 6.66667 10.6667 6.66667C9.75 6.66667 8.96556 6.99278 8.31334 7.645C7.66 8.29833 7.33334 9.08333 7.33334 10C7.33334 10.9167 7.66 11.7011 8.31334 12.3533C8.96556 13.0067 9.75 13.3333 10.6667 13.3333Z"
              fill="white"
            />
          </svg>
        </div>
        <input
          type="password"
          className={`${Input} ${styles.input}`}
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
          <svg
            width="18"
            height="18"
            viewBox="0 0 38 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.6667 20C7.88889 20 5.52778 19.0278 3.58334 17.0833C1.63889 15.1389 0.666672 12.7778 0.666672 10C0.666672 7.22222 1.63889 4.86111 3.58334 2.91667C5.52778 0.972222 7.88889 0 10.6667 0C12.9167 0 14.8822 0.631667 16.5633 1.895C18.2433 3.15944 19.4167 4.75 20.0833 6.66667H34C34.9167 6.66667 35.7017 6.99278 36.355 7.645C37.0072 8.29833 37.3333 9.08333 37.3333 10C37.3333 11 36.9861 11.8056 36.2917 12.4167C35.5972 13.0278 34.8333 13.3333 34 13.3333V16.6667C34 17.5833 33.6739 18.3683 33.0217 19.0217C32.3683 19.6739 31.5833 20 30.6667 20C29.75 20 28.965 19.6739 28.3117 19.0217C27.6594 18.3683 27.3333 17.5833 27.3333 16.6667V13.3333H20.0833C19.4167 15.25 18.2433 16.8406 16.5633 18.105C14.8822 19.3683 12.9167 20 10.6667 20ZM10.6667 13.3333C11.5833 13.3333 12.3678 13.0067 13.02 12.3533C13.6733 11.7011 14 10.9167 14 10C14 9.08333 13.6733 8.29833 13.02 7.645C12.3678 6.99278 11.5833 6.66667 10.6667 6.66667C9.75 6.66667 8.96556 6.99278 8.31334 7.645C7.66 8.29833 7.33334 9.08333 7.33334 10C7.33334 10.9167 7.66 11.7011 8.31334 12.3533C8.96556 13.0067 9.75 13.3333 10.6667 13.3333Z"
              fill="white"
            />
          </svg>
        </div>
        <input
          type="password"
          className={`${Input} ${styles.input}`}
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
        >
          Submit
        </button>
      </div>
    </form>
  );
}
