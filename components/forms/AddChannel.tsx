import { Input } from './Styles';
import styles from '@/styles/Livekit.module.css';

import { Dispatch, SetStateAction, useState } from 'react';
import {
  Control,
  FieldErrorsImpl,
  UseFormRegister,
  Controller,
} from 'react-hook-form';
import ChannelMessageIcon from '@/components/icons/ChannelMessageIcon';
import { ChannelMediaIcon } from '@/components/icons/ChannelMediaIcon';

export default function AddChannel({
  register,
  errors,
  control,
  serverError,
  showDesc,
  setShowDesc,
  channelType,
  setChannelType,
}: {
  register: UseFormRegister<{
    description?: string | undefined;
    isMedia?: boolean | undefined;
    name: string;
  }>;
  errors: Partial<
    FieldErrorsImpl<{
      description: string;
      isMedia: NonNullable<boolean | undefined>;
      name: string;
    }>
  >;
  control: Control<
    {
      description?: string | undefined;
      isMedia?: boolean | undefined;
      name: string;
    },
    any
  >;
  serverError: string;
  showDesc: boolean;
  setShowDesc: Dispatch<SetStateAction<boolean>>;
  channelType: 'media' | 'text';
  setChannelType: Dispatch<SetStateAction<'media' | 'text'>>;
}) {
  return (
    <form
      className="flex flex-col w-12 mb-1 mx-6"
      onSubmit={(e) => e.preventDefault()}
    >
      {serverError ? (
        <span className="my-2 text-red-700 text-sm font-bold">
          {serverError}
        </span>
      ) : (
        ''
      )}

      <div className="flex flex-col mt-5">
        <div className="font-semibold tracking-wider">Channel Name</div>
        <input
          className={`${Input('bg-grey-700')} mt-2 ${styles.input}`}
          type="text"
          placeholder="Enter channel name"
          {...register('name')}
        />
        {errors.name && (
          <p className="text-red-700 mt-2 text-sm font-bold">
            {errors.name.message}
          </p>
        )}
        <div className="font-semibold tracking-wider mt-4">Channel Type</div>
        <div className="flex-col flex">
          <Controller
            control={control}
            name="isMedia"
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <>
                <div
                  className={`flex ${
                    channelType == 'text' ? 'bg-grey-600' : 'bg-grey-700'
                  } rounded-2xl py-2 pl-6 items-center`}
                >
                  <ChannelMessageIcon />
                  <label className="ml-1 flex items-center w-full justify-between hover:cursor-pointer">
                    Text{' '}
                    <input
                      className="mr-4"
                      type="radio"
                      onBlur={onBlur}
                      onChange={() => onChange(false)}
                      onClick={() => setChannelType('text')}
                      checked={value === false}
                      ref={ref}
                    />
                  </label>
                </div>
                <div
                  className={`flex ${
                    channelType == 'media' ? 'bg-grey-600' : 'bg-grey-700'
                  } rounded-2xl py-2 pl-6 mt-2 items-center`}
                >
                  <ChannelMediaIcon />
                  <label className="ml-1 flex items-center w-full justify-between hover:cursor-pointer">
                    Voice{' '}
                    <input
                      className="mr-4 "
                      type="radio"
                      onBlur={onBlur}
                      onChange={() => onChange(true)}
                      onClick={() => setChannelType('media')}
                      checked={value === true}
                      ref={ref}
                    />
                  </label>
                </div>
              </>
            )}
          />
        </div>
        {showDesc ? (
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
        ) : (
          <div
            className={`${styles.description} mt-4 text-frost-600 font-bold tracking-wide hover:cursor-pointer hover:text-frost-500 underline underline-offset-2`}
            onClick={() => setShowDesc(true)}
          >
            Add a description{' '}
          </div>
        )}
      </div>
    </form>
  );
}
