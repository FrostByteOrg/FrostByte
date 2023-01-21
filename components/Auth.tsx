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
    <div className="basis-3/4 flex flex-col w-12 ">
      <div className="text-red-300">{serverError ?? serverError}</div>
      <div className="flex flex-col h-13">
        {type == 'login' ? (
          <Login setServerError={setServerError} />
        ) : (
          <Register setServerError={setServerError} setAuthType={setAuthType} />
        )}
      </div>
      {type == 'login' ? (
        <div className=" flex justify-center mt-8">
          <div className="text-frost-600 text-lg">
            Not registered?{'  '}
            <span
              className="hover:cursor-pointer text-frost-900 font-bold hover:text-frost-500 drop-shadow-xl "
              onClick={() => setAuthType('register')}
            >
              Sign up now
            </span>
          </div>
        </div>
      ) : (
        <div className=" flex justify-center mt-8">
          <div className="text-frost-600 text-lg">
            Have an account?{' '}
            <span
              className="hover:cursor-pointer text-frost-900 font-bold hover:text-frost-500 drop-shadow-xl "
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
