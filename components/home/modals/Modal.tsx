import { useEffect, RefObject, DetailedHTMLProps, HTMLAttributes } from 'react';
import styles from '@/styles/Modal.module.css';
import { KeyboardEventHandler } from 'react';

export default function Modal({
  modalRef,
  showModal,
  title,
  children: content,
  buttons,
  onKeyDown = undefined,
  closeBtn = '',
  className = '',
  buttonsClassName = 'flex justify-end space-x-5 items-center mt-4',
}: {
  modalRef: RefObject<HTMLDialogElement>;
  showModal: boolean;
  title: string | JSX.Element;
  children: JSX.Element;
  buttons: JSX.Element;
  onKeyDown?: KeyboardEventHandler<HTMLDialogElement> | undefined;
  closeBtn?: JSX.Element | '';
  className?: string;
  buttonsClassName?: string;
}) {
  useEffect(() => {
    if (showModal && !modalRef.current?.open) {
      modalRef.current?.showModal();
    }
  }, [showModal, modalRef]);

  return (
    <dialog
      ref={modalRef}
      className={`${styles.modal} rounded-lg `}
      onKeyDown={onKeyDown}
    >
      <div className={`${className} bg-grey-900 p-5 rounded-lg z-50 `}>
        <div className="text-2xl font-bold tracking-wider flex justify-between items-center text-white">
          {title}
          {closeBtn}
        </div>
        <div className="px-2 pt-4 pb-4 flex flex-col text-white">{content}</div>
        <div className=" border-t-2 mx-5 border-grey-700"></div>
        <div className={buttonsClassName}>{buttons}</div>
      </div>
    </dialog>
  );
}
