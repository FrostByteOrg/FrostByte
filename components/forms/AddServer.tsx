import CameraIcon from '@/components/icons/CameraIcon';
import { Input } from './Styles';

export default function AddServer() {
  return (
    <form className="flex flex-col w-12">
      <div className="w-9 py-4 px-7 flex items-center justify-center rounded-lg border-dashed border-2 border-grey-600 self-center">
        <div className="flex flex-col justify-center items-center">
          <CameraIcon />
          <span className="text-sm font-semibold text-center tracking-wider">
            UPLOAD
          </span>
        </div>
      </div>
      <div className="flex flex-col mt-5">
        <div className="font-semibold tracking-wider">Server Name</div>
        <input
          className={`${Input('bg-grey-700')}`}
          type="text"
          placeholder="Enter Server name"
        />
      </div>
    </form>
  );
}
