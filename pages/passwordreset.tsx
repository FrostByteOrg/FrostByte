import { useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

export default function  Passwordreset() {

  const user = useUser();

  useEffect(() => {
    console.log(user);
  },[user]);

  return (
    <div>
      <div>password reset</div>
    
    </div>
  );
}