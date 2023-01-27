import {
  createContext,
  SetStateAction,
  useContext,
  useState,
  Dispatch,
} from 'react';

type PWRecoveryEventContextValue = {
  pwRecoveryEvent: boolean;
  setPWRecoveryEvent: Dispatch<SetStateAction<boolean>>;
};

export const PWRecoveryEventCtxDefaultVal: PWRecoveryEventContextValue = {
  pwRecoveryEvent: false,
  setPWRecoveryEvent: (state) => {},
};

export const PWRecoveryEventContext = createContext(PWRecoveryEventCtxDefaultVal);

export function EventProvider({ children }: { children: React.ReactNode }) {
  const [pwRecoveryEvent, setPWRecoveryEvent] = useState(PWRecoveryEventCtxDefaultVal.pwRecoveryEvent);

  return (
    <PWRecoveryEventContext.Provider value={{ pwRecoveryEvent, setPWRecoveryEvent }}>
      {children}
    </PWRecoveryEventContext.Provider>
  );
}

// export function usePWRecoveryEvent() {
//   const { pwRecoveryEvent } = useContext(PWRecoveryEventContext);
//   return pwRecoveryEvent;
// }

// export function usePWRecoveryEventSetter() {
//   const { setPWRecoveryEvent } = useContext(PWRecoveryEventContext);
//   return setPWRecoveryEvent;
// }
