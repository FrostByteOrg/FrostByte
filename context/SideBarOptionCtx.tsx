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

//DOCUMENTATION FOR FROS-UiImprovements:

// Refactored MobileViewCtx => SideBarOptionCtx
// mainly because this context value will no longer only be used in the mobile view.
// Removed the 'chat' option from this variable, from now on, the logic for rendering the chat component is as follows:
// *for mobile view*
// if the channel id > 0, display the chat Component
// else render the component based off the SideBarOption value
// NOTE: clicking on one of the 3 icons in the BottomNav bar will set the
// SideBarOption value to its respective value and display its component and will set the channelId to 0  NOTE: the order at which you do this is important, make sure that
// whenever these 2 setters are called, the setSideBarOption is called first followed by the setChannelId(0).
// Clicking on a direct message or server channel will set the channelId to that of the channelId that you clicked on

// *for desktop view*
// Clicking on one of the 3 options from the VerticalNav bar will set the
// SideBarOption value to its respective value and display its component in the sidebar next to the
// VerticalNav bar and will set the channelId to 0.
// If channelId > 0, the respective chat will be displayed
// else the default view for the current SideBarOption value will be displayed in the main/chat area

// also added the chatName value to the ChatCtx.
// whenever we set the channelId, we should also set the chatName as we should have access to it as well whever we have access
// to channelId.
// For server channels, chatname is simply the channel_name. For direct messages, chatName is the name of the coresponding user

// removed BottomNav and instead refactored so that both the vertical and bottom nav bars can be displayed
// by simply using the NavBar component and passing the respective type as a property
