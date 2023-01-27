import { useContext, useEffect, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { toast } from 'react-toastify';
import styles from '@/styles/Auth.module.css';
import UpdatePassword from '@/components/forms/UpdatePassword';
import { PWRecoveryEventContext } from 'context/EventContext';

export default function  Passwordreset() {

  const user = useUser();
  const supabase = useSupabaseClient();

  const {pwRecoveryEvent, setPWRecoveryEvent} = useContext(PWRecoveryEventContext);

  const [serverError, setServerError] = useState<null | string>(null);

  const isAuth = user && pwRecoveryEvent;


  //conditionally render this form if user exists AND event is password recovery, our middleware ill not catch this route since
  //the access token is return in the URL fragment 


  if (!isAuth) {
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
            <div><div className='w-full flex flex-col justify-center mt-10'>
              <div className='text-4xl font-bold text-center'>Unauthorized</div>


            </div> return to login</div>
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
          <div>{user ? <div className='w-full flex flex-col justify-center mt-10'>
            <div className='text-4xl font-bold text-center'>Update Password</div>
            <p className="text-red-700  font-bold flex items-center justify-center">
              {serverError ?? serverError}
            </p>
            <UpdatePassword setServerError={setServerError}/>
          </div> : <p>no user</p>}</div>
        </div>
      </div>
    </main>
  );
}
