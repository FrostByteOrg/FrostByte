import { Dispatch, SetStateAction } from 'react';

export default function Login({
  setServerError,
}: {
  setServerError: Dispatch<SetStateAction<string | null>>;
}) {
  return <form>Login</form>;
}
