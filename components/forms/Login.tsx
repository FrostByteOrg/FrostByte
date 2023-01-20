import { Dispatch, SetStateAction } from 'react';

export default function Login({
  setServerError,
}: {
  setServerError: Dispatch<SetStateAction<string | null>>;
}) {
  return (
    <form className="flex flex-col bg-frost-800">
      <div>Login</div>
    </form>
  );
}
