import CameraIcon from '@/components/icons/CameraIcon';
import { Input } from './Styles';
import styles from '@/styles/Components.module.css';
import PlusIcon from '@/components/icons/PlusIcon';

export default function AddServer() {
  return (
    <form className="flex flex-col w-12 my-4 mx-6">
      <div className="w-9 py-4 px-7 flex items-center justify-center rounded-lg border-dashed border-2 border-grey-600 self-center relative hover:cursor-pointer">
        <div className="flex flex-col justify-center items-center">
          <CameraIcon />
          <span className="text-sm font-semibold text-center tracking-wider">
            UPLOAD
          </span>
          <span className="absolute -top-3 -right-3">
            <PlusIcon color="#4abfe8" />
          </span>
        </div>
      </div>
      <div className="flex flex-col mt-5">
        <div className="font-semibold tracking-wider">Server Name</div>
        <input
          className={`${Input('bg-grey-700')} mt-2 ${styles.input}`}
          type="text"
          placeholder="Enter Server name"
        />
      </div>
    </form>
  );
}
