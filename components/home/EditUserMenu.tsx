import { useState } from 'react';
import EditUserForm from '../forms/EditUserForm';
import MediaPick from './MediaPick';
import modalStyle from '@/styles/Modal.module.css';
import ChangePassword from '../forms/SettingsUpdatePassword';
import { Roboto_Slab } from 'next/font/google';

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
});

export default function EditUser() {
  const [formSwitch, setFormSwitch] = useState('editUser');

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
    <div
      className={`flex flex-row ${modalStyle.userSettings} ${robotoSlab.className}`}
    >
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
      </div>
      {settingView}
    </div>
  );
}
