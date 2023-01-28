import { useState } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import styles from '@/styles/Auth.module.css';
import UpdatePassword from '@/components/forms/UpdatePassword';
import { useRouter } from 'next/router';

export default function Passwordreset() {

  const user = useUser();
  const router = useRouter();
  const [serverError, setServerError] = useState<null | string>(null);

  if (!user) {
    return (
      <main className="bg-grey-700">
        <div
          className={`${styles.resetPWMD} items-center overflow-auto h-screen w-full `}
        >
          <div
            className={`
           ${styles.mainContainer}
           col-start-5 
           col-end-9 
           row-start-2 
           row-end-3 
           flex 
           w-full 
           h-full 
           justify-center 
           bg-gradient-to-t 
           from-frost-300 
           to-frost-600 
           xl:rounded-3xl
           `}
          >
            <div>
              <div className='w-full flex flex-col justify-center mt-10'>
                <div className='text-4xl font-bold text-center'>Unauthorized</div>
                <div className="text-frost-700 text-lg">return to <span className="hover:cursor-pointer text-frost-900 font-bold hover:text-frost-500 drop-shadow-xl "
                  onClick={() => router.push('/login')}>login</span></div>
              </div> 
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-grey-700">
      <div
        className={`${styles.resetPWMD} items-center overflow-auto h-screen w-full `}
      >
        <div
          className={`
         ${styles.mainContainer}
         col-start-5 
         col-end-9 
         row-start-2 
         row-end-3 
         flex 
         w-full 
         h-full 
         justify-center 
         bg-gradient-to-t 
         from-frost-300 
         to-frost-600 
         xl:rounded-3xl
         `}
        >
          <div>
            <div className='w-full flex flex-col justify-center mt-10'>
              <div className='text-4xl font-bold text-center'>Update Password</div>
              <p className="text-red-700  font-bold flex items-center justify-center">
                {serverError ?? serverError}
              </p>
              <UpdatePassword setServerError={setServerError}/>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
