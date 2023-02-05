import AddServerIcon from '@/components/icons/AddServerIcon';
import {SearchBar} from '@/components/forms/Styles';
import { useState } from 'react';
import supabaseLogo from '@/public/supabaseLogo.png';
import Image from 'next/image';
import VerticalSettingsIcon from '@/components/icons/VerticalSettingsIcon';

export default function ServerList() {

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
      <div className='pt-4'>
        <div className='border-b-2 border-grey-700 py-2 px-3 flex justify-between hover:bg-grey-700 hover:rounded-xl items-center'>
          <div className='flex items-center'>
            <div className='bg-grey-900 p-2 rounded-xl'>
              <Image className="w-5" src={supabaseLogo} alt="Supabase" priority />
            </div>
            <div className='ml-3'>
              
              <div className='text-lg tracking-wide font-bold'>Supabase</div>
              <div className='text-xs tracking-wide text-grey-300 flex'>
                <div className='flex items-center'>
                  <span className='p-1 bg-green-300 rounded-full mr-1'></span>
                  <span>32 Online</span>
                </div>
                <div className='flex items-center ml-2'>
                  <span className='p-1 bg-grey-300 rounded-full mr-1'></span>
                  <span>458 Members</span>
                </div>
              </div>
            </div>
          </div>
          <div><VerticalSettingsIcon/></div>
        </div>
      </div>
    </div>
  );
}
