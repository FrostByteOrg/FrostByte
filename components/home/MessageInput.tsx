import { KeyboardEvent, useState } from 'react';

export default function MessageInput({ onSubmit }: {onSubmit: Function}){
  const [messageText, setMessageText] = useState('');

  const submitOnEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    // Watch for enter key
    if (event.key === 'Enter') {
      onSubmit(messageText);
      setMessageText('');
    }
  };

  return (
    <>
      <input
        className="w-[90%]
        px-3
        py-2
        self-start
        text-base
        font-normal
        placeholder:text-white
        placeholder:opacity-70
        rounded-lg
        transition
        ease-in-out
        m-0
        focus:outline-none
        bg-grey-700
        bottom-[90px]
        fixed
        "
        placeholder="Message general"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyDown={(e) => submitOnEnter(e)}
      />
    </>
  );
}
