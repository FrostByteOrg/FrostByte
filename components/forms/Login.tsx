import { Dispatch, SetStateAction } from 'react';
import styles from '@/styles/Login.module.css';
import {
  createSessionSchema,
  CreateSessionInput,
} from '@/types/client/session';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/types/database.supabase';

export default function Login({
  setServerError,
}: {
  setServerError: Dispatch<SetStateAction<string | null>>;
}) {
  const router = useRouter();
  const supabase = useSupabaseClient<Database>();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateSessionInput>({
    resolver: zodResolver(createSessionSchema),
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
      <div className="relative mt-7">
        <div className={`${errors.email ? styles.iconError : styles.icon} `}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 34 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M30.3333 0.666626H3.66667C1.83334 0.666626 0.350003 2.16663 0.350003 3.99996L0.333336 24C0.333336 25.8333 1.83334 27.3333 3.66667 27.3333H30.3333C32.1667 27.3333 33.6667 25.8333 33.6667 24V3.99996C33.6667 2.16663 32.1667 0.666626 30.3333 0.666626ZM30.3333 7.33329L17 15.6666L3.66667 7.33329V3.99996L17 12.3333L30.3333 3.99996V7.33329Z"
              fill="white"
            />
          </svg>
        </div>
        <input
          type="email"
          className={`form-control
                w-full
                py-2 
                pl-6
                          self-start
                          text-base
                          font-normal
                          placeholder:text-white
                          placeholder:opacity-60     
                          border-2 border-solid border-blueGrey-600
                          rounded-2xl
                          transition
                          ease-in-out
                          focus:outline-frost-50
                          m-0 focus:outline-none  bg-inherit flex-1  ${styles.input}`}
          placeholder="Enter Email"
          {...register('email')}
        ></input>
        {errors.email && (
          <p className="text-red-700 mt-1 text-sm font-bold">
            {errors.email?.message}
          </p>
        )}
      </div>

      <div className={`${errors.email ? 'mt-2' : 'mt-6'}  relative`}>
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
          className={`form-control
                w-full
                py-2 pl-6
                          self-start
                          text-base
                          font-normal
                          placeholder:text-white
                          placeholder:opacity-60  
                          border-2 border-solid border-white
                          rounded-2xl
                          transition
                          ease-in-out
                          focus:outline-frost-50
                          m-0 focus:outline-none  bg-inherit flex-1 ${styles.input}`}
          placeholder="Enter password"
          {...register('password')}
        ></input>
        {errors.password && (
          <p className="text-red-700 mt-1 text-sm font-bold">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className={`${errors.password ? 'mt-7' : 'mt-8'}  relative`}>
        <button
          className={` ${styles.button} bg-frost-600 hover:bg-frost-700 font-bold py-2 px-4 w-full rounded-2xl tracking-widest text-frost-100 text-2xl`}
          type="submit"
        >
          Login
        </button>
      </div>
    </form>
  );
}
