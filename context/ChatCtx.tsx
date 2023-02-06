import {
  createContext,
  SetStateAction,
  useContext,
  useState,
  Dispatch,
} from 'react';

type ChatCtxValue = {
  channelId: string;
  setChannelId: Dispatch<SetStateAction<string>>;
};

export const ChatCtxDefaultVal: ChatCtxValue = {
  channelId: '',
  setChannelId: (state) => {},
};

export const ChatCtx = createContext(ChatCtxDefaultVal);

export function ChatCtxProvider({ children }: { children: React.ReactNode }) {
  const [channelId, setChannelId] = useState(ChatCtxDefaultVal.channelId);

  return (
    <ChatCtx.Provider value={{ channelId, setChannelId }}>
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
