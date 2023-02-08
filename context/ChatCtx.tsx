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
};

export const ChatCtxDefaultVal: ChatCtxValue = {
  channelId: 0,
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
