import {
  createContext,
  SetStateAction,
  useContext,
  useState,
  Dispatch,
} from 'react';

type ChatCtxValue = {
  channelId: number;
  setChannelId: Dispatch<SetStateAction<number>>;
  chatName: string;
  setChatName: Dispatch<SetStateAction<string>>;
};

export const ChatCtxDefaultVal: ChatCtxValue = {
  channelId: 0,
  setChannelId: (state) => {},
  chatName: '',
  setChatName: (state) => {},
};

export const ChatCtx = createContext(ChatCtxDefaultVal);

export function ChatCtxProvider({ children }: { children: React.ReactNode }) {
  const [channelId, setChannelId] = useState(ChatCtxDefaultVal.channelId);

  const [chatName, setChatName] = useState(ChatCtxDefaultVal.chatName);

  return (
    <ChatCtx.Provider
      value={{ channelId, setChannelId, chatName, setChatName }}
    >
      {children}
    </ChatCtx.Provider>
  );
}

export function useChannelIdValue() {
  const { channelId } = useContext(ChatCtx);
  return channelId;
}

export function useChannelIdSetter() {
  const { setChannelId } = useContext(ChatCtx);
  return setChannelId;
}

export function useChatNameValue() {
  const { chatName } = useContext(ChatCtx);
  return chatName;
}

export function useChatNameSetter() {
  const { setChatName } = useContext(ChatCtx);
  return setChatName;
}
