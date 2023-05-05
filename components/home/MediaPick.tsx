import { MediaDeviceMenu, MediaDeviceSelect } from '@livekit/components-react';
import modalStyle from '@/styles/Modal.module.css';
import { useState } from 'react';

export default function MediaPick(){
  const [inputVisible, setInputVisible] = useState(false);
  const [outputVisible, setOutputVisible] = useState(false);

  return(
    <div className='flex flex-col ml-5'>
      <div className='flex flex-row'>
        <h1 className='text-2xl font-semibold'>Media Settings</h1>
      </div>
      <div className=" border-t-2 my-1 border-grey-700"></div>
      <div className='w-12 h-auto flex flex-col mx-auto mt-2 items-center overflow-y-scroll'>
        <div className={`flex flex-col ${modalStyle.mediaSelect} mb-4`}>
          <button onClick={() => {inputVisible ? setInputVisible(false) : setInputVisible(true);}} className='text-lg bg-frost-500 rounded-t-lg' >
        Set Input Devices
          </button>
          <div className={`${inputVisible ? 'hidden' : 'visible'} flex flex-col items-center border-frost-500 border rounded-b-lg`}>
            <span className='underline font-bold text-base mb-2 tracking-wide'>Audio input Devices</span>
            <MediaDeviceSelect className='text-sm px-2 mb-2' kind={'audioinput'}/>
            <span className='underline font-bold text-base mb-2 tracking-wide'>Video input Devices</span>
            <MediaDeviceSelect className='text-sm px-2 mb-2' kind={'videoinput'}/>
          </div>
        </div>
        <div className={`flex flex-col ${modalStyle.mediaSelect}`}>
          <button onClick={() => {outputVisible ? setOutputVisible(false) : setOutputVisible(true);}} className='text-lg bg-frost-500 rounded-t-lg' >
        Set Output Device
          </button>
          <div className={`${outputVisible ? 'hidden' : 'visible'} flex flex-col items-center border-frost-500 border rounded-b-lg`}>
            <span className='underline font-bold text-base mb-2 tracking-wide'>Audio Output Devices</span>
            <MediaDeviceSelect className='text-sm px-2 mb-2' kind={'audiooutput'}/>
          </div>
        </div>
      </div>
    </div>
    
  );
}