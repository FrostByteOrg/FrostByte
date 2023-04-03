import CameraIcon from '@/components/icons/CameraIcon';
import { Input } from './Styles';
import styles from '@/styles/Livekit.module.css';
import PlusIcon from '@/components/icons/PlusIcon';
import {
  useRef,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import Image from 'next/image';
import {
  FieldErrorsImpl,
  useForm,
  UseFormHandleSubmit,
  UseFormRegister,
} from 'react-hook-form';
import { CreateServerInput, createServerSchema } from '@/types/client/server';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateServer, updateServerIcon } from '@/services/server.service';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Server, ServersForUser } from '@/types/dbtypes';
import { PostgrestError } from '@supabase/supabase-js';
import ServersIcon from '../icons/ServersIcon';

export default function EditServer({
  server,
  register,
  handleSubmit,
  errors,
  serverImage,
  setServerImage,
}: {
  server: ServersForUser | null;
  register: UseFormRegister<{
    description?: string | undefined | null;
    name: string;
  }>;
  handleSubmit: UseFormHandleSubmit<{
    description?: string | undefined | null;
    name: string;
  }>;
  errors: Partial<
    FieldErrorsImpl<{
      description: string;
      name: string;
    }>
  >;
  serverImage: File | null;
  setServerImage: Dispatch<SetStateAction<File | null>>;
}) {
  const imageRef = useRef<HTMLInputElement | null>(null);
  const [serverError, setServerError] = useState<string>('');
  const supabase = useSupabaseClient();

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return;
    }

    setServerImage(e.target.files[0]);
  };

  let previewImage = '';

  if (!serverImage && server?.servers.image_url) {
    previewImage = server?.servers.image_url;
  } else if (serverImage) {
    previewImage = URL.createObjectURL(serverImage);
  } else {
    previewImage = '';
  }
  console.log(previewImage);
  const onSubmit = async (formData: CreateServerInput) => {
    const { data, error } = await updateServer(
      supabase,
      server!.server_id,
      formData.name,
      formData.description
    );

    if (error) {
      if ((error as PostgrestError).message) {
        setServerError((error as PostgrestError).message);
      } else {
        setServerError(error as unknown as string);
      }

      setTimeout(() => {
        setServerError('');
      }, 7000);
      return;
    }

    const fileExt = serverImage
      ? serverImage.name.split('.').pop()
      : previewImage.split('.').pop();
    const fileName = `${data?.id}.${fileExt}`;
    const filePath = `${fileName}`;
    console.log(fileExt);

    // if (serverImage) {
    //   const { data: updatedServer, error: serverImgError } =
    //     await updateServerIcon(supabase, filePath, serverImage);

    //   if (serverImgError) {
    //     setServerError(serverImgError.message);
    //     setTimeout(() => {
    //       setServerError('');
    //     }, 7000);
    //     return;
    //   }
    // }
  };

  return (
    <form
      className="flex flex-col w-12 my-4 mx-6"
      onSubmit={handleSubmit(onSubmit)}
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
          serverImage || previewImage
            ? 'p-4'
            : 'w-9 py-4 px-7 border-dashed border-2 border-grey-600'
        }  flex items-center rounded-lg justify-center  self-center relative hover:cursor-pointer`}
        onClick={() => imageRef?.current?.click()}
      >
        <div className="flex flex-col justify-center items-center ">
          {serverImage || previewImage ? (
            serverImage ? (
              <div>
                <Image
                  alt="serverIcon"
                  src={previewImage}
                  width={50}
                  height={50}
                />
                <span className="absolute -top-3 -right-3">
                  <PlusIcon color="#4abfe8" outline={false} />
                </span>
              </div>
            ) : (
              <div className="w-7 h-7">
                <img src={previewImage} alt={server?.servers.name}></img>
                <span className="absolute -top-3 -right-3">
                  <PlusIcon color="#4abfe8" outline={false} />
                </span>
              </div>
            )
          ) : (
            <>
              <CameraIcon />
              <span className="text-sm font-semibold text-center tracking-wider">
                UPLOAD
              </span>
              <span className="absolute -top-3 -right-3">
                <PlusIcon color="#4abfe8" outline={false} />
              </span>
            </>
          )}
        </div>
      </div>
      {/* <img
                src="https://hmmdmicyvzwicpckacld.supabase.co/storage/v1/object/public/servericons/197.png"
                alt="assfg"
                className="w-6 h-6"
              ></img> */}
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
          placeholder="Enter server name"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-red-700 mt-2 text-sm font-bold">
            {errors.name.message}
          </p>
        )}
        <div className="mt-4">
          <div className="font-semibold tracking-wider">Description</div>
          <input
            className={`${Input('bg-grey-700')} mt-2 ${styles.input}`}
            type="text"
            placeholder="Enter a description"
            {...register('description')}
          />
          {errors.description && (
            <p className="text-red-700 mt-2 text-sm font-bold">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
