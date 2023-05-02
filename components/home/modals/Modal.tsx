import { useEffect, RefObject, useRef, useState } from 'react';
import styles from '@/styles/Modal.module.css';
import { KeyboardEventHandler } from 'react';
import { createPortal } from 'react-dom';
import ReactPlayer from 'react-player/file';
import { useSetModalOpen } from '@/lib/store';

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
  const [firstRender, setFirstRender] = useState(showModal);

  const setIsModalOpen = useSetModalOpen();

  const [videoStatus, setVideoStatus] = useState<
    'play' | 'pause' | 'playAfter' | 'ended' | 'not started'
  >('not started');

  useEffect(() => {
    ref.current = document.querySelector<HTMLElement>('#modalPortal');
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showModal && firstRender) {
      setVideoStatus('play');
      setIsModalOpen(true);
    }

    if (showModal && !firstRender) {
      setFirstRender(true);
    }

    if (!showModal && firstRender) {
      setVideoStatus('playAfter');
    }
  }, [firstRender, setIsModalOpen, showModal]);

  useEffect(() => {
    if (videoStatus == 'ended') {
      setIsModalOpen(false);
    }
  }, [setIsModalOpen, videoStatus]);

  if (
    videoStatus !== 'play' &&
    videoStatus !== 'pause' &&
    videoStatus !== 'playAfter'
  )
    return null;

  //TODO: Start adding button frostpunk styles? Make smaller modal work (add graphic for it)

  return mounted && ref.current
    ? createPortal(
        <>
          {/* <ReactPlayer
            ref={ref2}
            url="./mainFull.mp4"
            className={`${styles.bigModal} mix-blend-multiply fixed z-50 top-[46%] left-[54%] translate-y-[-50%] translate-x-[-50%]  w-full h-full opacity-95`}
            playing={
              videoStatus == 'play' || videoStatus == 'playAfter' ? true : false
            }
            onProgress={({ playedSeconds }) => {
              if (playedSeconds >= 2.6 && videoStatus !== 'playAfter')
                setVideoStatus('pause');
            }}
            onEnded={() => setVideoStatus('ended')}
          />
          <ReactPlayer
            url="./secondaryFull.mp4"
            className={`${styles.bigModalSecondary} mix-blend-multiply fixed z-50 top-[46%] left-[54%] translate-y-[-50%] translate-x-[-50%]  w-full h-full opacity-[0.9] `}
            playing={
              videoStatus == 'play' || videoStatus == 'playAfter' ? true : false
            }
            onProgress={({ playedSeconds }) => {
              if (playedSeconds >= 2.6 && videoStatus !== 'playAfter')
                setVideoStatus('pause');
            }}
            onEnded={() => setVideoStatus('ended')}
          /> */}
          <ReactPlayer
            url="./smallFull.mp4"
            className={`${styles.smallModal} mix-blend-multiply fixed z-50 top-[46%] left-[54%] translate-y-[-50%] translate-x-[-50%]  w-full h-full  `}
            playing={
              videoStatus == 'play' || videoStatus == 'playAfter' ? true : false
            }
            onProgress={({ playedSeconds }) => {
              if (playedSeconds >= 2.6 && videoStatus !== 'playAfter')
                setVideoStatus('pause');
            }}
            onEnded={() => setVideoStatus('ended')}
          />

          <div
            className="rounded-lg fixed top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]  p-5 z-50 "
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
