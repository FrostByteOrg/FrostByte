import { KeyboardEvent, useState } from 'react';
import styles from '@/styles/Chat.module.css';
import SendIcon from '@/components/icons/SendIcon';

export default function MessageInput({
  onSubmit,
  channelName,
  disabled = false,
}: {
  onSubmit: Function;
  channelName: string;
  disabled?: boolean;
}) {
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

  const submitMobile = (event: any) => {
    if (messageText !== '') {
      event.preventDefault();
      onSubmit(messageText);
      setMessageText('');
    }
  };

  return (
    <div className={`${styles.messageInput} mt-1 p-3 relative`}>
      <textarea
        className={`
        w-full
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
        disabled:opacity-70
        cursor-pointer

      `}
        disabled={disabled}
        placeholder={`Message ${channelName}`}
        inputMode="text"
        value={
          disabled
            ? 'You do not have permission to message in this channel'
            : messageText
        }
        onChange={(e) => setMessageText(e.target.value)}
        onKeyDown={(e) => submitOnEnter(e)}
      />

      <SendIcon
        onTouchStart={(e) => submitMobile(e)}
        className="w-5 h-5 absolute right-5 top-6 "
      />
    </div>
  );
}
