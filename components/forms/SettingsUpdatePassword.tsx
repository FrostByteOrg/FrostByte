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
    <div className='flex flex-col w-12 ml-5'>
      <div className='flex flex-row'>
        <h1 className='text-2xl font-semibold'>Change Password</h1>
      </div>
      <div className=" border-t-2 my-1 border-grey-700"></div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='flex flex-row justify-start mb-2'>
          <div className='flex flex-col'>
            <label className='font-medium text-xl mb-1'>
            Current Password
            </label>
            <input 
              type='password' 
              className='w-12 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
              placeholder='Enter Current Password'></input>
          </div>
        </div>
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
          </div>
        </div>
        <div className='flex flex-row justify-end mt-[4.5rem]'>
          <button type='submit'>
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}