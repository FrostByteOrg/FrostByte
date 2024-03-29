import { Dispatch, SetStateAction } from 'react';
import Login from './forms/Login';
import Register from './forms/Register';
import PasswordReset from './forms/PasswordReset';
import { useState } from 'react';

export default function Auth({
  type,
  setAuthType,
}: {
  type: 'login' | 'register' | 'resetPassword';
  setAuthType: Dispatch<SetStateAction<'login' | 'register' | 'resetPassword'>>;
}) {
  const [serverError, setServerError] = useState<null | string>(null);

  return (
    <div className="basis-3/4 flex flex-col w-12 ">
      <p className="text-red-700  font-bold flex items-center justify-center">
        {serverError ?? serverError}
      </p>
      <div className={`flex flex-col  ${serverError ? '' : 'mt-5'}`}>
        {renderAuth(type, setServerError, setAuthType)}
      </div>
      {type == 'login' ? (
        <div className=" flex justify-center mt-7">
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
        <div className=" flex justify-center mt-7">
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

function renderAuth(
  type: 'login' | 'register' | 'resetPassword',
  setServerError: Dispatch<SetStateAction<string | null>>,
  setAuthType: Dispatch<SetStateAction<'login' | 'register' | 'resetPassword'>>
) {
  switch (type) {
    case 'login':
      return (
        <Login setServerError={setServerError} setAuthType={setAuthType} />
      );
    case 'register':
      return (
        <Register setServerError={setServerError} setAuthType={setAuthType} />
      );
    case 'resetPassword':
      return (
        <PasswordReset
          setServerError={setServerError}
          setAuthType={setAuthType}
        />
      );
    default:
      return (
        <Login setServerError={setServerError} setAuthType={setAuthType} />
      );
  }
}
