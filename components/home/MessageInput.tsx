import { KeyboardEvent, useState } from 'react';
import styles from '@/styles/Chat.module.css';

export default function MessageInput({ onSubmit }: { onSubmit: Function }) {
  const [messageText, setMessageText] = useState('');

  const submitOnEnter = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // Watch for enter key (exclude shift + enter)
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      // Double newlines are required for markdown to render
      onSubmit(messageText);
      setMessageText('');
    }
  };

  return (
    <div className={`${styles.messageInput} mt-5`}>
      <textarea
        className={`
        w-[90%]
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
      `}
        placeholder="Message general"
        value={messageText}
        onChange={(e) => setMessageText(e.target.value)}
        onKeyDown={(e) => submitOnEnter(e)}
      />
    </div>
  );
}
