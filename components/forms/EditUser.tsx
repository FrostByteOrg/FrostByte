import { User } from '@/types/dbtypes';
import { FieldErrorsImpl, useForm, UseFormRegister } from 'react-hook-form';
import {
  useRef,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { useUserRef } from '@/lib/store';
import UserIcon from '@/components/icons/UserIcon';
import modalStyle from '@/styles/Modal.module.css';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import router from 'next/router';
import LogOutIcon from '../icons/LogOutIcon';
import { MediaDeviceMenu, MediaDeviceSelect} from '@livekit/components-react';

export default function EditUser(){
  const user = useUserRef();
  const supabase = useSupabaseClient();
  const sessionUser = useUser();


  const [editName, setEditName] = useState(false);
  const [editWebsite, setWebsite] = useState(false);
  const [editAvatar, setAvatar] = useState(false);
  const [formSwitch, setFormSwitch] = useState('editUser');
  const [isVisible, setIsvisible] = useState(false);

  const handleStringDisplay = (userString: string | null, emptyMessage: string) => {
    if(userString === null){
      return emptyMessage;
    }
    else if(userString.length >= 35){
      return `${userString.slice(0, 35)}...`;
    }

    return userString;
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log(error);
    router.push('/login');
  };

  let settingView = <EditUserForm />;

  function EditUserForm() {
    return(
      <div className='flex flex-row mx-auto'>
        <div className='flex flex-col w-12 '>
          <div className='flex flex-row justify-between items-center mb-2'>
            <div className='flex flex-col justify-start '>
              <label className='font-semibold text-xl mb-1'>Name</label>
              {user &&  
              <input className='w-12 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
                placeholder={handleStringDisplay(user.full_name, 'Add your name to your profile')}/>}
            </div>
          </div>
          <div className='flex flex-row justify-between items-center mb-2'>
            <div className='flex flex-col justify-start'>
              <label className='font-semibold text-xl mb-1'>Website</label>
              {user && 
              <input className='w-12 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
                placeholder={handleStringDisplay(user.website, 'Add your website to your profile')}/>}
            </div>
          </div>
          <div className='flex flex-row justify-between items-center mb-2'>
            <div className='flex flex-col justify-start'>
              <label className='font-semibold text-xl mb-1'>Avatar</label>
              {user && 
                <input className='w-12 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
                  placeholder={handleStringDisplay(user.website, 'Add an avatar to your profile')}/>}
              {/* <div className='flex flex-row mt-5 items-center'>
                <h1 className='text-md font-semibold mb-1 mr-2'>Avatar Preview</h1>
                {user && <UserIcon user={user} className='h-6 w-6' indicator={false}/>}
              </div> */}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function MediaPick(){
    return(
      <div className='w-13 h-auto flex flex-row mx-auto'>
        <MediaDeviceMenu className={` ${modalStyle.mediaSelect}h-auto bg-green-400 px-3 py-2 rounded-lg text-sm`}> Select Input Device </MediaDeviceMenu>
        <div className={`flex flex-col ${modalStyle.mediaSelect}`}>
          <button onClick={() => {isVisible ? setIsvisible(false) : setIsvisible(true);}} className='text-sm bg-green-400' >
          Select Output Device
          </button>
          <div className={isVisible ? 'hidden' : 'visible'}>
            <MediaDeviceSelect className='text-sm px-2' kind={'audiooutput'}>Select OutPut</MediaDeviceSelect>
          </div>
        </div>
      </div>
    );
  }

  function ChangePassword() {
    return(
      <div className='flex flex-col w-13 mx-auto'>
        <div className='flex flex-row'>
          <h1 className='text-2xl font-semibold'>Change Password</h1>
        </div>
        <div className=" border-t-2 my-1 border-grey-700"></div>
        <form>
          <div className='flex flex-row justify-start mb-2'>
            <div className='flex flex-col'>
              <label className='font-medium text-xl mb-1'>
              Current Password
              </label>
              <input 
                type='text' 
                className='w-13 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
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
                className='w-13 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
                placeholder='Enter New Password'></input>
            </div>
          </div>
          <div className='flex flex-row justify-start'>
            <div className='flex flex-col'>
              <label className='font-medium text-xl mb-1'>
              Confirm New Password
              </label>
              <input 
                type='text' 
                className='w-13 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
                placeholder='Enter New Password'/>
            </div>
          </div>
        </form>
      </div>
    );
  }

  switch(formSwitch){
    case 'editUser':
      settingView = <EditUserForm />;
      break;
    case 'changePassword':
      settingView = <ChangePassword />;
      break;
    case 'setMedia':
      settingView = <MediaPick />;
      break;
    default:
      settingView = <EditUserForm />;
      break;
  }
  return(
    <div className={`flex flex-row h-12 ${modalStyle.userSettings}`}>
      <div className='w-auto mr-4 flex flex-col justify-between'>
        <div>
          <div className='flex flex-row'>
            <button 
              className='rounded-lg mb-1 h-6 text-sm tracking-wide hover:text-frost-400'
              onClick={() => setFormSwitch('editUser')}>
              Edit Profile
            </button>
          </div>
          <div className='flex flex-row'>
            <button 
              className='rounded-lg mb-1 h-6 text-sm tracking-wide hover:text-frost-400'
              onClick={() => setFormSwitch('changePassword')}>
              Change Password
            </button>
          </div>
          <div className='flex flex-row'>
            <button 
              className='rounded-lg mb-1 h-6 text-sm tracking-wide hover:text-frost-400'
              onClick={() => setFormSwitch('setMedia')}>
              Media Settings
            </button>
          </div>
        </div>
        <div className='flex flex-row mb-1'>
          <button
            className="
            tracking-wide 
            text-md mb-1 
            text-frost-100 
            flex 
            flex-row 
            items-center 
            justify-evenly
             w-9
             hover:text-frost-400"
            onClick={handleLogout}
          >
            Logout
            <LogOutIcon width={5} height={5}/>
          </button>
        </div>
      </div>
      {settingView}
    </div>
  );
}