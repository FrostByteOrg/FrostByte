import { Dispatch, SetStateAction } from 'react';

export default function Register({
  setServerError,
}: {
  setServerError: Dispatch<SetStateAction<string | null>>;
}) {
  return (
    <form className="flex flex-col    justify-evenly h-full">
      <div>
        <input
          type="text"
          className="form-control
                w-full
                py-2 px-4
                          self-start
                          text-base
                          font-normal
                          text-white
                          border border-solid border-blueGrey-600
                          rounded-2xl
                          transition
                          ease-in-out
                          focus:outline-blueGrey-50
                          m-0 focus:outline-none  bg-inherit flex-1"
          placeholder="Enter Username*"
        ></input>
      </div>
      <div className="mt-5">
        <input
          type="email"
          className="form-control
                w-full
                py-2 px-4
                          self-start
                          text-base
                          font-normal
                          text-white
                          border border-solid border-blueGrey-600
                          rounded-2xl
                          transition
                          ease-in-out
                          focus:outline-blueGrey-50
                          m-0 focus:outline-none  bg-inherit flex-1"
          placeholder="Enter Email*"
        ></input>
      </div>

      <div className="mt-5">
        <input
          type="password"
          className="form-control
                w-full
                py-2 px-4
                          self-start
                          text-base
                          font-normal
                          text-white
                          border border-solid border-blueGrey-600
                          rounded-2xl
                          transition
                          ease-in-out
                          focus:outline-blueGrey-50
                          m-0 focus:outline-none  bg-inherit flex-1"
          placeholder="Enter password*"
        ></input>
      </div>

      <div className="mt-5">
        <input
          type="password"
          className="form-control
                w-full
                py-2 px-4
                          self-start
                          text-base
                          font-normal
                          text-white
                          border border-solid border-blueGrey-600
                          rounded-2xl
                          transition
                          ease-in-out
                          focus:outline-blueGrey-50
                          m-0 focus:outline-none  bg-inherit flex-1"
          placeholder="Confirm password*"
        ></input>
      </div>

      <div className="mt-5">
        <button
          className=" bg-gradient-to-r from-blueGrey-500 to-blueGrey-700 hover:from-blueGrey-600 hover:to-blueGrey-800  text-white font-semibold py-2 px-4 w-full rounded-2xl tracking-widest "
          type="submit"
        >
          Register
        </button>
      </div>
    </form>
  );
}
