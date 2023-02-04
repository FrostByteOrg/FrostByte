import AddServerIcon from '@/components/icons/AddServerIcon';
import {SearchBar} from '@/components/forms/Styles';
import { useState } from 'react';
import supabaseLogo from '@/public/supabaseLogo.png';
import Image from 'next/image';

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
        <div className='border-b-2 border-grey-700 py-2 px-3 flex justify-between hover:bg-grey-700 hover:rounded-xl'>
          <div className='bg-grey-900 p-2 rounded-xl'><Image className="w-5" src={supabaseLogo} alt="Supabase" priority /></div>
          <div>rightSide</div>
        </div>
      </div>
    </div>
  );
}
