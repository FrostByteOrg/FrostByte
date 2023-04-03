import { useUserRef } from '@/lib/store';
import { User } from '@/types/dbtypes';
import UserIcon from '@/components/icons/UserIcon';

export default function EditUserForm() {
  const user = useUserRef();

  const handleStringDisplay = (userString: string | null, emptyMessage: string) => {
    if(userString === null){
      return emptyMessage;
    }
    else if(userString.length >= 35){
      return `${userString.slice(0, 35)}...`;
    }

    return userString;
  };

  return(
    <div className='flex flex-row ml-5'>
      <div className='flex flex-col w-12 '>
        <div className='flex flex-row'>
          <h1 className='text-2xl font-semibold'>User Profile</h1>
        </div>
        <div className=" border-t-2 my-1 border-grey-700"></div>
        <div className='flex flex-row justify-between items-center mb-2'>
          <div className='flex flex-col justify-start '>
            <label className='font-semibold text-xl mb-1'>Name</label>
            {user &&  
            <input className='w-12 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
              placeholder={handleStringDisplay(user.full_name, 'Add your name to your profile')}/>}
          </div>
        </div>
        <div className='flex flex-row justify-between items-center mb-2'>
          <div className='flex flex-col justify-start'>
            <label className='font-semibold text-xl mb-1'>Website</label>
            {user && 
            <input className='w-12 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
              placeholder={handleStringDisplay(user.website, 'Add your website to your profile')}/>}
          </div>
        </div>
        <div className='flex flex-row justify-between items-center mb-2'>
          <div className='flex flex-col justify-start'>
            <label className='font-semibold text-xl mb-1'>Avatar</label>
            {user && 
              <input className='w-12 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
                placeholder={handleStringDisplay(user.avatar_url, 'Add an avatar to your profile')}/>}
            <div className='flex flex-row mt-5 items-center'>
              <h1 className='text-md font-semibold mb-1 mr-2'>Avatar Preview</h1>
              {user && <UserIcon user={user} className='h-6 w-6' indicator={false}/>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}