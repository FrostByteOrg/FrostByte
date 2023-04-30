import { useEffect, RefObject, useRef, useState } from 'react';
import styles from '@/styles/Livekit.module.css';
import { KeyboardEventHandler } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
  modalRef,
  showModal,
  title,
  children: content,
  buttons,
  onKeyDown = undefined,
}: {
  modalRef?: RefObject<HTMLDialogElement>;
  showModal: boolean;
  title: string;
  children: JSX.Element;
  buttons: JSX.Element;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement> | undefined;
}) {
  const ref = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ref.current = document.querySelector<HTMLElement>('#modalPortal');
    setMounted(true);
  }, []);

  if (!showModal) return null;

  return mounted && ref.current
    ? createPortal(
        <>
          <div className="fixed z-50 top-[0px] left-[0px] right-[0px] bottom-[0px] bg-frost-900 opacity-50"></div>
          <div
            className="rounded-lg fixed top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]  p-5 z-50"
            onKeyDown={onKeyDown}
          >
            <div className="bg-grey-900 p-4 rounded-lg  z-50 ">
              <div className="text-2xl font-bold tracking-wider">{title}</div>
              <div className="px-2 pt-4 pb-4 flex flex-col">{content}</div>
              <div className=" border-t-2 mx-5 border-grey-700"></div>
              <div className="flex justify-end space-x-5 items-center mt-4">
                {buttons}
              </div>
            </div>
          </div>
        </>,
        ref.current
      )
    : null;
}
