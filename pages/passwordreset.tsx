import { useEffect } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

export default function  Passwordreset() {

  const user = useUser();
  const supabase = useSupabaseClient();
  //TODO: redirect user to this page after clicking link in email

  return (
    <div>
      <div>password reset</div>
    
    </div>
  );
}
