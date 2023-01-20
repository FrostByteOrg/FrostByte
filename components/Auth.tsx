import { Dispatch, SetStateAction } from 'react';
import Login from './forms/Login';
import Register from './forms/Register';
import { useState } from 'react';

export default function Auth({
  type,
  setAuthType,
}: {
  type: 'login' | 'register';
  setAuthType: Dispatch<SetStateAction<'login' | 'register'>>;
}) {
  const [serverError, setServerError] = useState<null | string>(null);
  return (
    <div>
      <div>{serverError ?? serverError}</div>
      {type == 'login' ? (
        <Login setServerError={setServerError} />
      ) : (
        <Register setServerError={setServerError} />
      )}
      {type == 'login' ? (
        <div>
          Not registed?{' '}
          <span
            className="hover:cursor-pointer"
            onClick={() => setAuthType('register')}
          >
            Sign up now
          </span>
        </div>
      ) : (
        <div>
          Have an account?{' '}
          <span
            className="hover:cursor-pointer"
            onClick={() => setAuthType('login')}
          >
            Login here
          </span>
        </div>
      )}
    </div>
  );
}
