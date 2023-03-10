import CameraIcon from '@/components/icons/CameraIcon';
import { Input } from './Styles';
import styles from '@/styles/Components.module.css';
import PlusIcon from '@/components/icons/PlusIcon';
import {
  useRef,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
} from 'react';
import Image from 'next/image';
import { createServerSchema, CreateServerInput } from '@/types/client/server';
import { FieldErrorsImpl, useForm, UseFormRegister } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function AddServer({
  serverImage,
  setServerImage,
  register,
  errors,
  serverError,
}: {
  serverImage: File | null;
  setServerImage: Dispatch<SetStateAction<File | null>>;
  register: UseFormRegister<{
    name: string;
  }>;
  errors: Partial<
    FieldErrorsImpl<{
      name: string;
    }>
  >;
  serverError: string;
}) {
  const imageRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    setServerImage(e.target.files[0]);
  };
  const previewImage = serverImage ? URL.createObjectURL(serverImage) : '';

  return (
    <form
      className="flex flex-col w-12 my-4 mx-6"
      onSubmit={(e) => e.preventDefault()}
    >
      {serverError ? (
        <span className="my-2 text-red-700 text-sm font-bold">
          {serverError}
        </span>
      ) : (
        ''
      )}
      <div
        className={`${
          serverImage
            ? 'p-4'
            : 'w-9 py-4 px-7 border-dashed border-2 border-grey-600'
        }  flex items-center rounded-lg justify-center  self-center relative hover:cursor-pointer`}
        onClick={() => imageRef?.current?.click()}
      >
        <div className="flex flex-col justify-center items-center">
          {serverImage ? (
            <Image alt="serverIcon" src={previewImage} width={50} height={50} />
          ) : (
            <>
              <CameraIcon />
              <span className="text-sm font-semibold text-center tracking-wider">
                UPLOAD
              </span>
              <span className="absolute -top-3 -right-3">
                <PlusIcon color="#4abfe8" />
              </span>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col mt-5">
        <div className="font-semibold tracking-wider">Server Name</div>
        <input
          type="file"
          ref={imageRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />
        <input
          className={`${Input('bg-grey-700')} mt-2 ${styles.input}`}
          type="text"
          placeholder="Enter Server name"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-red-700 mt-2 text-sm font-bold">
            {errors.name.message}
          </p>
        )}
      </div>
    </form>
  );
}
