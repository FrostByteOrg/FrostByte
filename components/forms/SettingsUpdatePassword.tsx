import modalStyle from '@/styles/Modal.module.css';


export default function ChangePassword() {
  return(
    <div className='flex flex-col w-13 mx-auto'>
      <div className='flex flex-row'>
        <h1 className='text-2xl font-semibold'>Change Password</h1>
      </div>
      <div className=" border-t-2 my-1 border-grey-700"></div>
      <form>
        <div className='flex flex-row justify-start mb-2'>
          <div className='flex flex-col'>
            <label className='font-medium text-xl mb-1'>
            Current Password
            </label>
            <input 
              type='text' 
              className='w-13 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
              placeholder='Enter Current Password'></input>
          </div>
        </div>
        <div className='flex flex-row justify-start mb-2'>
          <div className='flex flex-col'>
            <label className='font-medium text-xl mb-1'>
            New Password
            </label>
            <input 
              type='text' 
              className='w-13 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
              placeholder='Enter New Password'></input>
          </div>
        </div>
        <div className='flex flex-row justify-start'>
          <div className='flex flex-col'>
            <label className='font-medium text-xl mb-1'>
            Confirm New Password
            </label>
            <input 
              type='text' 
              className='w-13 text-medium bg-grey-800 rounded-lg focus:bg-slate-600 focus:outline-grey-100 py-1 pl-2' 
              placeholder='Enter New Password'/>
          </div>
        </div>
      </form>
    </div>
  );
}