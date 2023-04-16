import { useSetUser, useUserRef } from '@/lib/store';
import { User } from '@/types/dbtypes';
import UserIcon from '@/components/icons/UserIcon';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import {
  updateUserAvatar,
  updateUserProfile,
} from '@/services/profile.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { UpdateUserInput, updateUserSchema } from '@/types/client/user';
import { useForm } from 'react-hook-form';
import { useState, useRef, ChangeEvent, useEffect } from 'react';
import { toast } from 'react-toastify';
import CameraIcon from '@/components/icons/CameraIcon';
import PlusIcon from '@/components/icons/PlusIcon';
import Image from 'next/image';

export default function EditUserForm() {
  const [userImage, setUserImage] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string>('');
  const imageRef = useRef<HTMLInputElement | null>(null);
  const previewImage = userImage ? URL.createObjectURL(userImage) : '';
  const updateUser = useSetUser();
  const user = useUserRef();
  const supabase = useSupabaseClient();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    setUserImage(e.target.files[0]);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    mode: 'onChange',
    defaultValues: {
      full_name: user && user.full_name,
      website: user && user.website,
    },
  });

  const onSubmit = async (formData: UpdateUserInput) => {
    const { data, error } = await updateUserProfile(
      supabase,
      user?.id!,
      formData.full_name!,
      formData.website!
    );

    const fileExt = userImage?.name.split('.').pop();
    const fileName = `${data?.id}.${fileExt}`;
    const filePath = `${fileName}`;

    if (userImage) {
      await updateUserAvatar(supabase, filePath, userImage, data!.id);
    }

    if (error) {
      setServerError(error.message);
      setTimeout(() => {
        setServerError('');
      }, 7000);
      return;
    }

    if (data && !error) {
      toast.success('Profile updated successfully'),
      {
        position: 'top-center',
        autoClose: 3000,
      };
    }
    setUserImage(null);
  };

  const handleStringDisplay = (
    userString: string | null,
    emptyMessage: string
  ) => {
    if (userString === null || userString.length === 0) {
      return emptyMessage;
    } 
    else if (userString.length >= 25) {
      return `${userString.slice(0, 25)}...`;
    }
    return userString;
  };

  return (
    <div className='flex flex-row ml-5 overflow-y-scroll'>
      <div className='flex flex-col w-12'>
        <div className='flex flex-row'>
          <h1 className='text-2xl font-semibold'>User Profile</h1>
        </div>
        <div className=' border-t-2 my-1 border-grey-700'></div>
        <form className='h-[17.5rem] ' onSubmit={handleSubmit(onSubmit)}>
          <div className='flex flex-row justify-center items-center mb-2 '>
            <div className='flex flex-col'>
              <label className='font-semibold text-xl mb-1 mx-auto'>
                Avatar
              </label>
              <div className='flex flex-col items-center'>
                <div
                  className={`${
                    userImage
                      ? 'p-4'
                      : 'w-8 py-4 px-6 border-dashed border-2 border-grey-600'
                  }  flex items-center rounded-lg justify-center relative hover:cursor-pointer`}
                  onClick={() => imageRef?.current?.click()}>
                  <div className='flex flex-col justify-center items-center'>
                    {userImage ? (
                      <Image
                        alt='userIcon'
                        src={previewImage}
                        width={40}
                        height={2}
                      />
                    ) : (
                      <>
                        <CameraIcon width={5} />
                        <span className='absolute -top-3 -right-3'>
                          <PlusIcon color='#4abfe8' />
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span className='text-xs font-semibold text-center tracking-wider mt-2'>
                  UPLOAD IMAGE
                </span>
              </div>
              <input
                type='file'
                ref={imageRef}
                onChange={handleFileChange}
                className='hidden'
                accept='image/*'
              />
            </div>
          </div>
          <div className='flex flex-row justify-between items-center mb-2'>
            <div className='flex flex-col justify-start '>
              <label className='font-semibold text-xl mb-1'>Name</label>
              {user && (
                <input
                  defaultValue={user.full_name!}
                  className='w-12 text-grey-300 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:text-white focus:outline-grey-100 py-1 pl-2'
                  placeholder={handleStringDisplay(
                    user.full_name,
                    'Add your name to your profile'
                  )}
                  {...register('full_name')}
                />
              )}
            </div>
          </div>
          <div className='flex flex-row justify-between items-center mb-2'>
            <div className='flex flex-col justify-start'>
              <label className='font-semibold text-xl mb-1'>Website</label>
              {user && (
                <input
                  defaultValue={user.website!}
                  className='w-12 text-medium text-grey-300 bg-grey-800 rounded-lg focus:bg-slate-600 focus:text-white focus:outline-grey-100 py-1 pl-2'
                  placeholder={handleStringDisplay(
                    user.website,
                    'Add your website to your profile'
                  )}
                  {...register('website')}
                />
              )}
            </div>
          </div>
          <div className='flex flex-row justify-end items-center'>
            <div className='flex flex-row'>
              <button
                className=' hover:text-frost-500 px-2 py-1 rounded-lg'
                type='submit'>
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
