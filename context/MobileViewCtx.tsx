import {
  createContext,
  SetStateAction,
  useContext,
  useState,
  Dispatch,
} from 'react';

type MobileViewCtxValue = {
  mobileView: 'friends' | 'servers' | 'messages' | 'chat';
  setMobileView: Dispatch<
    SetStateAction<'friends' | 'servers' | 'messages' | 'chat'>
  >;
  channelId: string;
  setChannelId: Dispatch<SetStateAction<string>>;
};

export const MobileViewCtxDefaultVal: MobileViewCtxValue = {
  mobileView: 'servers',
  setMobileView: (state) => {},
  channelId: '',
  setChannelId: (state) => {},
};

export const MobileViewCtx = createContext(MobileViewCtxDefaultVal);

export function MobileViewProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileView, setMobileView] = useState(
    MobileViewCtxDefaultVal.mobileView
  );
  const [channelId, setChannelId] = useState(MobileViewCtxDefaultVal.channelId);

  return (
    <MobileViewCtx.Provider
      value={{ mobileView, setMobileView, channelId, setChannelId }}
    >
      {children}
    </MobileViewCtx.Provider>
  );
}

export function useMobileViewValue() {
  const { mobileView } = useContext(MobileViewCtx);
  return mobileView;
}

export function useMobileViewSetter() {
  const { setMobileView } = useContext(MobileViewCtx);
  return setMobileView;
}
