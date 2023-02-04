import {
  createContext,
  SetStateAction,
  useContext,
  useState,
  Dispatch,
} from 'react';

type MobileViewCtxValue = {
  mobileView: 'friends' | 'servers' | 'messages' | 'chat';
  setMobileView: Dispatch<SetStateAction<'friends' | 'servers' | 'messages' | 'chat'>>;
};

export const MobileViewCtxDefaultVal: MobileViewCtxValue = {
  mobileView: 'friends',
  setMobileView: (state) => {},
};

export const MobileViewCtx = createContext(MobileViewCtxDefaultVal);

export function MobileViewProvider({ children }: { children: React.ReactNode }) {
  const [mobileView, setMobileView] = useState(MobileViewCtxDefaultVal.mobileView);

  return (
    <MobileViewCtx.Provider value={{ mobileView, setMobileView }}>
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
