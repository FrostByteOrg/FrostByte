import { Dispatch, SetStateAction } from 'react';
import { Input } from './Styles';
import styles from '@/styles/Auth.module.css';
import { CreatePasswordInputRecovery, createPasswordRecoverySchema } from '@/types/client/passwordRecovery';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/types/database.supabase';
import { toast } from 'react-toastify';

export default function PasswordReset({
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
    formState: { errors },
  } = useForm<CreatePasswordInputRecovery>({
    resolver: zodResolver(createPasswordRecoverySchema),
  });


  const onSubmit = async (formData: CreatePasswordInputRecovery) => {
    //TODO: disable resetpass button, loading spinner?
    const { data, error } = await supabase.auth.resetPasswordForEmail(formData.email, {
      redirectTo: 'http://localhost:3000/passwordreset',
    });

    if (error) {
      setServerError(error.message);
      setTimeout(() => {
        setServerError(null);
      }, 7000);
    }
    if (data && !error) {
      toast.success(`An email has been sent to ${formData.email}`, {
        position: 'top-center',
        autoClose: 3000
      });
      setAuthType('login');
    }
  };

  return (
    <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)} >
      <div className='text-3xl font-bold'>Password Recovery</div>
      <label htmlFor="email" className="mt-6">
        Enter the Email that belongs to your account:
      </label>
      <div className="relative mt-3">
        
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
          className={`${Input} ${styles.input}`}
          placeholder="Enter Email"
          {...register('email')}
        ></input>
        {errors.email && (
          <p className="text-red-700 mt-1 text-sm font-bold">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className={`${errors.email ? 'mt-7' : 'mt-8'}  relative`}>
        <button
          className={`
           ${styles.button}
           bg-frost-600 
           hover:bg-frost-700
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
        >
          Send Email
        </button>
      </div>
    </form>
  );
}
