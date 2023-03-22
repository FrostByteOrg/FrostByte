import { TrackToggle, useLocalParticipant } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { BiPhoneOff } from 'react-icons/bi';
import { BsBarChart, BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { TbScreenShare, TbScreenShareOff } from 'react-icons/tb';


export default function FloatingCallControl(){

  const videoTrack = useLocalParticipant();
  const screenTrack = useLocalParticipant();

  return(
    <div className='h-auto border rounded-md absolute bottom-2 bg-grey-950 w-full'>
      <div className='flex flex-row items-center justify-between '>
        <div className='p-3 flex flex-row ml-2'>
          <BsBarChart size={22} className='text-green-500 mr-3' />
          <span className='text-green-500 text-lg font-semibold'>Connected</span>
        </div>
        <BiPhoneOff size={24} className='mr-4 text-red-500 hover:text-red-700'/>
      </div>
      <div className='flex flex-row justify-evenly'>
        <TrackToggle showIcon={false} className={'w-2/4 h-7 mb-2 mx-2 px-2 py-1 border hover:bg-grey-800 rounded-md text-md flex items-center justify-center'} source={Track.Source.ScreenShare}> 
          {screenTrack.isScreenShareEnabled ? (
            <div className='flex flex-row'>
              <TbScreenShare size={28} className='mr-2'/>
              <span>Screen</span>
            </div>
          ) : (
            <div className='flex flex-row'>
              <TbScreenShareOff size={28} className='mr-2'/>
              <span>Screen</span>
            </div>)}
        </TrackToggle>
        <TrackToggle showIcon={false} className={'w-2/4 h-7 mb-2 mx-2 p-1 border hover:bg-grey-800 rounded-lg text-lg flex items-center justify-center'} source={Track.Source.Camera}>
          {videoTrack.isCameraEnabled ? (
            <div className='flex flex-row items-center'>
              <BsCameraVideo size={22} className='mr-2'/>
              <span>Video</span>
            </div>
          ) : (
            <div className='flex flex-row items-center'>
              <BsCameraVideoOff size={22} className='mr-2'/>
              <span>Video</span>
            </div>
          )} 
        </TrackToggle>
      </div>
    </div>
  );
}