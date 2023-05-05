import modalStyle from '@/styles/Modal.module.css';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { toast } from 'react-toastify';
import { Database } from '@/types/database.supabase';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createUpdatePasswordSchema, CreateUpdatePasswordInput } from '@/types/client/updatePassword';



export default function ChangePassword() {
  const supabase = useSupabaseClient<Database>();

  const{
    register,
    handleSubmit,
    reset,
    formState: {errors, isSubmitting},
  } = useForm<CreateUpdatePasswordInput>({
    resolver: zodResolver(createUpdatePasswordSchema),
    mode: 'onChange'
  });

  const onSubmit = async (formData: CreateUpdatePasswordInput) => {
    const {data, error} = await supabase.auth.updateUser({
      password: formData.password
    });

    if(data && !error) {
      toast.success('Password updated', {
        position: 'top-center',
        autoClose: 3000
      });

      reset();
    }
  };
  return(
    <div className='flex flex-col w-12 ml-5 '>
      <div className='flex flex-row'>
        <h1 className='text-2xl font-semibold'>Change Password</h1>
      </div>
      <div className=" border-t-2 my-1 border-grey-700"></div>
      <form  onSubmit={handleSubmit(onSubmit)}>
        <div className='py-2 h-[11rem]'>
          <div className='flex flex-row justify-start mb-2'>
            <div className='flex flex-col'>
              <label className='font-medium text-xl mb-1'>
            New Password
              </label>
              <input 
                type='text' 
                className='w-12 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
                placeholder='Enter New Password'
                {...register('password')}
              />
              {errors.password && (
                <p className="text-red-700 mt-1 text-sm font-bold">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
          <div className='flex flex-row justify-start'>
            <div className='flex flex-col'>
              <label className='font-medium text-xl mb-1'>
            Confirm New Password
              </label>
              <input 
                type='text' 
                className='w-12 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
                placeholder='Confirm New Password'
                {...register('passwordConfirmation')}
              />
              {errors.passwordConfirmation && (
                <span className="text-red-700 mt-1 text-sm font-bold">
                  {errors.passwordConfirmation.message}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className='flex flex-row justify-end items-center '>
          <div className='flex flex-row'>
            <button className='hover:text-frost-500 px-2 py-1 rounded-lg' type='submit'>Submit</button>
          </div>
        </div>
      </form>
    </div>
  );
}