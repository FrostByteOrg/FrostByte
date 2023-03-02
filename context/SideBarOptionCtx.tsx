import {
  createContext,
  SetStateAction,
  useContext,
  useState,
  Dispatch,
} from 'react';

type SideBarOptionCtxValue = {
  sideBarOption: 'friends' | 'servers' | 'messages';
  setSideBarOption: Dispatch<
    SetStateAction<'friends' | 'servers' | 'messages'>
  >;
  channelId: string;
  setChannelId: Dispatch<SetStateAction<string>>;
};

export const SideBarOptionCtxDefaultVal: SideBarOptionCtxValue = {
  sideBarOption: 'servers',
  setSideBarOption: (state) => {},
  channelId: '',
  setChannelId: (state) => {},
};

export const SideBarOptionCtx = createContext(SideBarOptionCtxDefaultVal);

export function SideBarOptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sideBarOption, setSideBarOption] = useState(
    SideBarOptionCtxDefaultVal.sideBarOption
  );
  const [channelId, setChannelId] = useState(
    SideBarOptionCtxDefaultVal.channelId
  );

  return (
    <SideBarOptionCtx.Provider
      value={{ sideBarOption, setSideBarOption, channelId, setChannelId }}
    >
      {children}
    </SideBarOptionCtx.Provider>
  );
}

export function useSideBarOptionValue() {
  const { sideBarOption } = useContext(SideBarOptionCtx);
  return sideBarOption;
}

export function useSideBarOptionSetter() {
  const { setSideBarOption } = useContext(SideBarOptionCtx);
  return setSideBarOption;
}
