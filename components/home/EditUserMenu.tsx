import { FieldErrorsImpl, useForm, UseFormRegister } from 'react-hook-form';
import {
  useRef,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import router from 'next/router';
import LogOutIcon from '@/components/icons/LogOutIcon';
import EditUserForm from '../forms/EditUserForm';
import MediaPick from './MediaPick';
import modalStyle from '@/styles/Modal.module.css';
import ChangePassword from '../forms/SettingsUpdatePassword';

export default function EditUser() {
  const supabase = useSupabaseClient();

  const [formSwitch, setFormSwitch] = useState('editUser');

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log(error);
    router.push('/login');
  };

  let settingView = <EditUserForm />;

  switch (formSwitch) {
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
  return (
    <div className={`flex flex-row ${modalStyle.userSettings}`}>
      <div className="w-10 mr-4 flex flex-col justify-between items-start border-r border-grey-700">
        <div>
          <div
            className={`flex flex-row w-10 px-3 py-1 items-center ${
              formSwitch === 'editUser' && 'border-r border-r-white bg-gray-500'
            }`}
          >
            <button
              className="h-6 text-sm tracking-wide hover:text-frost-400"
              onClick={() => setFormSwitch('editUser')}
            >
              Edit Profile
            </button>
          </div>
          <div
            className={`flex flex-row w-10 px-3 py-1 items-center ${
              formSwitch === 'changePassword' &&
              'border-r border-r-white bg-gray-500'
            }`}
          >
            <button
              className="h-6 text-sm tracking-wide hover:text-frost-400"
              onClick={() => setFormSwitch('changePassword')}
            >
              Edit Password
            </button>
          </div>
          <div
            className={`flex flex-row w-10 px-3 py-1 items-center ${
              formSwitch === 'setMedia' && 'border-r border-r-white bg-gray-500'
            }`}
          >
            <button
              className="h-6 text-sm tracking-wide hover:text-frost-400"
              onClick={() => setFormSwitch('setMedia')}
            >
              Device Settings
            </button>
          </div>
        </div>
        <div className="flex flex-row mb-1">
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
             hover:text-red-500"
            onClick={handleLogout}
          >
            Logout
            <LogOutIcon width={5} height={5} />
          </button>
        </div>
      </div>
      {settingView}
    </div>
  );
}
