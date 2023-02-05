import Image, { StaticImageData } from 'next/image';
import supabaseLogo from '@/public/supabaseLogo.png';
import VerticalSettingsIcon from '@/components/icons/VerticalSettingsIcon';

//NOTE: this is a temp type just for testing, to be removed 
type Server = {
  name: string;
  icon: StaticImageData;
  members: string;
  onlineMembers: string;
}

export default function Server({server} : {server: Server}) {
  //TODO: remove hardcoded values, use dynamic ones from props?

  return (
    <div className='pt-4 hover:cursor-pointer'>
      <div className='border-b-2 border-grey-700 py-2 px-3 flex justify-between hover:bg-grey-700 hover:rounded-xl items-center'>
        <div className='flex items-center'>
          <div className='bg-grey-900 p-2 rounded-xl'>
            <Image className="w-5" src={server.icon} alt="Supabase" priority />
          </div>
          <div className='ml-3'>
            <div className='text-lg tracking-wide font-bold'>{server.name}</div>
            <div className='text-xs tracking-wide text-grey-300 flex'>
              <div className='flex items-center'>
                <span className='p-1 bg-green-300 rounded-full mr-1'></span>
                <span>{server.onlineMembers} Online</span>
              </div>
              <div className='flex items-center ml-2'>
                <span className='p-1 bg-grey-300 rounded-full mr-1'></span>
                <span>{server.members} Members</span>
              </div>
            </div>
          </div>
        </div>
        <div><VerticalSettingsIcon/></div>
      </div>
    </div>
  );
}
