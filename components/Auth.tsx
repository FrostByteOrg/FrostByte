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
    <div className="basis-3/4 flex flex-col w-12">
      <div>{serverError ?? serverError}</div>
      <div className="basis-2/3 flex flex-col ">
        {type == 'login' ? (
          <Login setServerError={setServerError} />
        ) : (
          <Register setServerError={setServerError} />
        )}
      </div>
      {type == 'login' ? (
        <div className="basis-1/3 flex justify-center items-center">
          <div>
            Not registed?{'  '}
            <span
              className="hover:cursor-pointer "
              onClick={() => setAuthType('register')}
            >
              Sign up now
            </span>
          </div>
        </div>
      ) : (
        <div className="basis-1/3 flex justify-center items-center">
          <div>
            Have an account?{' '}
            <span
              className="hover:cursor-pointer"
              onClick={() => setAuthType('login')}
            >
              Login here
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
