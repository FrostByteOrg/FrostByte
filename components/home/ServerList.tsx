import AddServerIcon from '@/components/icons/AddServerIcon';
import {SearchBar} from '@/components/forms/Styles';
import { useState } from 'react';
import supabaseLogo from '@/public/supabaseLogo.png';
import Server from '@/components/home/Server';
import fireShipLogo from '@/public/fireShipLogo.png';
import { StaticImageData } from 'next/image';

//NOTE: this is a temp type just for testing, to be removed 
type Server = {
  name: string;
  icon: StaticImageData;
  members: string;
  onlineMembers: string;
}

//NOTE: this is temporary and just for testing 
const SERVERS: Server[] = [{name: 'Supabase', icon: supabaseLogo,members: '458', onlineMembers: '32' },{name: 'Fireship', icon: fireShipLogo,members: '2833', onlineMembers: '181' }];

export default function ServerList() {

  //TODO: Extract and create single server component with props for clicked (boolean, when true, server is expanded and channels are shown)

  //TODO: Display default page (when user belongs to and has no servers)

  const [addServerhover, setAddServerHover] = useState(false);

  return (
    <div className="main p-4">
      <div className='flex pb-3 items-center border-b-2 border-grey-700'>
        <h1 className=' text-5xl font-bold tracking-wide'>Servers</h1>
        <div className='pt-2 ml-3 hover:cursor-pointer' onMouseEnter={() =>setAddServerHover(true)} 
          onMouseLeave={() => setAddServerHover(false)}><AddServerIcon hovered={addServerhover}/></div>
      </div>
      <div className='pt-4'>
        <input
          type="password"
          className={`${SearchBar}`}
          placeholder="Search"
        ></input>
      </div>
      {SERVERS.map((server,idx) => <Server key={idx} server={server}/>)}
      
    </div>
  );
}
