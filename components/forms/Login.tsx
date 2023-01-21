import { Dispatch, SetStateAction } from 'react';

export default function Login({
  setServerError,
}: {
  setServerError: Dispatch<SetStateAction<string | null>>;
}) {
  return (
    <form className="flex flex-col justify-evenly h-full">
      <div>
        <input
          type="email"
          className="form-control
                w-full
                py-2 px-4
                          self-start
                          text-base
                          font-normal
                          placeholder:text-white
                          placeholder:opacity-60     
                          border-2 border-solid border-blueGrey-600
                          rounded-2xl
                          transition
                          ease-in-out
                          focus:outline-frost-50
                          m-0 focus:outline-none  bg-inherit flex-1"
          placeholder="Enter Email"
        ></input>
      </div>

      <div>
        <input
          type="password"
          className="form-control
                w-full
                py-2 px-4
                          self-start
                          text-base
                          font-normal
                          placeholder:text-white
                          placeholder:opacity-60  
                          border-2 border-solid border-white
                          rounded-2xl
                          transition
                          ease-in-out
                          focus:outline-frost-50
                          m-0 focus:outline-none  bg-inherit flex-1"
          placeholder="Enter password"
        ></input>
      </div>

      <div className="">
        <button
          className=" bg-gradient-to-r from-frost-300 to-frost-500 hover:from-frost-500 hover:to-frost-600  font-bold py-2 px-4 w-full rounded-2xl tracking-widest text-frost-100 text-xl"
          type="submit"
        >
          Login
        </button>
      </div>
    </form>
  );
}
