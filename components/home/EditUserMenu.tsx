import { FieldErrorsImpl, useForm, UseFormRegister } from 'react-hook-form';
import {
  useRef,
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import LogOutIcon from '@/components/icons/LogOutIcon';
import EditUserForm from '../forms/EditUserForm';
import MediaPick from './MediaPick';
import modalStyle from '@/styles/Modal.module.css';
import ChangePassword from '../forms/SettingsUpdatePassword';
import { useMediaQuery } from 'react-responsive';

export default function EditUserMenu() {
  const supabase = createClientComponentClient();

  const router = useRouter();
  const checkMobile = useMediaQuery({ query: '(max-width: 500px)' });
  const [isMobile, setIsMobile] = useState(false);

  const [formSwitch, setFormSwitch] = useState('editUser');

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.log(error);
    router.push('/login');
  };

  useEffect(() => {
    setIsMobile(checkMobile);
  }, [checkMobile]);

  let settingView = <EditUserForm />;

  switch (formSwitch) {
    case 'editUser':
      settingView = <EditUserForm />;
      break;
    case 'changePassword':
      settingView = <ChangePassword />;
      break;
    case 'setMedia':
      settingView = <MediaPick isMobile={isMobile} />;
      break;
    default:
      settingView = <EditUserForm />;
      break;
  }
  if (isMobile) {
    return (
      <div className={`flex flex-col ${modalStyle.userSettings}  `}>
        <div className="w-10 mr-4 flex flex-col justify-between items-start  border-grey-700">
          <div className="flex mb-4">
            <div
              className={`flex flex-row w-10 px-3 py-1 items-center ${
                formSwitch === 'editUser' &&
                'border-r border-r-white bg-grey-500'
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
                formSwitch === 'setMedia' &&
                'border-r border-r-white bg-gray-500'
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
            <div
              className="bg-frost-500 py-2 px-5 rounded-lg hover:cursor-pointer hover:bg-frost-700"
              onClick={handleLogout}
            >
              Logout
            </div>
          </div>
        </div>
        {settingView}
      </div>
    );
  }
  return (
    <div className={`flex flex-row ${modalStyle.userSettings}  `}>
      <div className="w-10 mr-4 flex flex-col justify-between items-start border-r border-grey-700">
        <div>
          <div
            className={`flex flex-row w-10 px-3 py-1 items-center ${
              formSwitch === 'editUser' && 'border-r border-r-white bg-grey-500'
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
              'border-r border-r-white bg-grey-500'
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
              formSwitch === 'setMedia' && 'border-r border-r-white bg-grey-500'
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
        <div className="flex flex-row mb-1 ">
          <div
            className="bg-frost-500 py-2 px-5 rounded-lg hover:cursor-pointer hover:bg-frost-700"
            onClick={handleLogout}
          >
            Logout
          </div>
        </div>
      </div>
      {settingView}
    </div>
  );
}
