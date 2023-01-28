import { Dispatch, SetStateAction } from 'react';
import { Input } from './Styles';
import styles from '@/styles/Auth.module.css';
import { CreatePasswordInputRecovery, createPasswordRecoverySchema } from '@/types/client/passwordRecovery';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Database } from '@/types/database.supabase';
import { toast } from 'react-toastify';
import EmailIcon from '../icons/EmailIcon';

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
    formState: { errors, isSubmitting },
  } = useForm<CreatePasswordInputRecovery>({
    resolver: zodResolver(createPasswordRecoverySchema),
    mode: 'onChange'
  });


  const onSubmit = async (formData: CreatePasswordInputRecovery) => {
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
          <EmailIcon/>
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
          Send Email
        </button>
      </div>
    </form>
  );
}
