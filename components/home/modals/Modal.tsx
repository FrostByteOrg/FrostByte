import { useEffect, RefObject, useRef, useState } from 'react';
import styles from '@/styles/Modal.module.css';
import { KeyboardEventHandler } from 'react';
import { createPortal } from 'react-dom';
import ReactPlayer from 'react-player/file';
import { useSetModalOpen } from '@/lib/store';
import TitleDetail from '@/components/svgs/TitleDetail';
import { Roboto_Slab } from 'next/font/google';
import TitleDetailBottom from '@/components/svgs/TitleDetailBottom';
import { motion, useAnimate, usePresence } from 'framer-motion';

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
});

//TODO: pass params for x, y and scale to animate the content and title

export default function Modal({
  modalRef,
  showModal,
  title,
  children: content,
  buttons,
  onKeyDown = undefined,
  size,
  closeBtn = '',
  initTitleX = -50,
  initTitleY = 50,
  titleX = 0,
  titleY = 0,
  initContentX = -60,
  initContentY = 0,
  contentX = -35,
  contenty = 0,
}: {
  modalRef?: RefObject<HTMLDialogElement>;
  showModal: boolean;
  title: string;
  children: JSX.Element;
  buttons: JSX.Element;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement> | undefined;
  size: 'small' | 'big';
  closeBtn?: JSX.Element | '';
  initTitleX?: number;
  initTitleY?: number;
  titleX?: number;
  titleY?: number;
  initContentX?: number;
  initContentY?: number;
  contentX?: number;
  contenty?: number;
}) {
  const ref = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);
  const [firstRender, setFirstRender] = useState(showModal);

  const [scopeTitle, animateTitle] = useAnimate();
  const [scopeContent, animateContent] = useAnimate();
  const [isPresent, safeToRemove] = usePresence();

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (isPresent && isPlaying) {
      const enterAnimation = async () => {
        animateTitle(
          scopeTitle.current,
          { y: titleY, x: titleX, scale: 1, opacity: 1 },
          { duration: 3 }
        );
        setTimeout(() => {
          animateContent(
            scopeContent.current,
            { scale: 1, opacity: 1, x: contentX },
            { duration: 2.5 }
          );
        }, 1300);
      };
      enterAnimation();
    } else if (!isPresent) {
      const exitAnimation = async () => {
        // await animate1(scope1.current, { opacity: 0 }, { duration: 2 });
        // await animate2(scope2.current, { opacity: 0 }, { duration: 2 });
        safeToRemove();
      };

      exitAnimation();
    }
  }, [
    animateContent,
    animateTitle,
    isPlaying,
    isPresent,
    safeToRemove,
    scopeContent,
    scopeTitle,
  ]);

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
      setIsPlaying(false);
    }
  }, [setIsModalOpen, videoStatus]);

  if (
    videoStatus !== 'play' &&
    videoStatus !== 'pause' &&
    videoStatus !== 'playAfter'
  )
    return null;

  //TODO: Start adding button frostpunk styles?

  return mounted && ref.current
    ? createPortal(
        <>
          {size == 'big' ? (
            <>
              <ReactPlayer
                url="./mainFull.mp4"
                className={`${styles.bigModal} mix-blend-multiply fixed z-50 top-[46%] left-[54%] translate-y-[-50%] translate-x-[-50%]  w-full h-full opacity-95`}
                playing={
                  videoStatus == 'play' || videoStatus == 'playAfter'
                    ? true
                    : false
                }
                onProgress={({ playedSeconds }) => {
                  if (playedSeconds >= 2.6 && videoStatus !== 'playAfter')
                    setVideoStatus('pause');
                }}
                onEnded={() => setVideoStatus('ended')}
                onStart={() => setIsPlaying(true)}
              />
              <ReactPlayer
                url="./secondaryFull.mp4"
                className={`${styles.bigModalSecondary} mix-blend-multiply fixed z-50 top-[46%] left-[54%] translate-y-[-50%] translate-x-[-50%]  w-full h-full opacity-[0.9] `}
                playing={
                  videoStatus == 'play' || videoStatus == 'playAfter'
                    ? true
                    : false
                }
                onProgress={({ playedSeconds }) => {
                  if (playedSeconds >= 2.6 && videoStatus !== 'playAfter')
                    setVideoStatus('pause');
                }}
                onEnded={() => setVideoStatus('ended')}
              />
            </>
          ) : null}
          {size == 'small' ? (
            <ReactPlayer
              url="./smallFull.mp4"
              className={`${styles.smallModal} mix-blend-multiply fixed z-50 top-[46%] left-[54%] translate-y-[-50%] translate-x-[-52%]  w-full h-full  `}
              playing={
                videoStatus == 'play' || videoStatus == 'playAfter'
                  ? true
                  : false
              }
              onProgress={({ playedSeconds }) => {
                if (playedSeconds >= 2.6 && videoStatus !== 'playAfter')
                  setVideoStatus('pause');
              }}
              onEnded={() => setVideoStatus('ended')}
              onStart={() => setIsPlaying(true)}
            />
          ) : null}

          {isPlaying ? (
            <motion.div
              className={`${robotoSlab.className} fixed top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]  p-5 z-50 `}
              onKeyDown={onKeyDown}
              initial={{ x: -225, y: -320 }}
            >
              <div className="p-4  z-50 ">
                <motion.div
                  className="tite"
                  initial={{
                    x: initTitleX,
                    y: initTitleY,
                    scale: 0.8,
                    opacity: 0.5,
                  }}
                  ref={scopeTitle}
                >
                  <div>
                    <TitleDetail />
                  </div>
                  <div className="text-2xl font-bold tracking-wider flex justify-between items-center">
                    {title} {closeBtn}
                  </div>
                  <div>
                    <TitleDetailBottom />
                  </div>
                </motion.div>
                <motion.div
                  className="px-2 pt-4 pb-4 flex flex-col"
                  initial={{
                    x: initContentX,
                    y: initContentY,
                    opacity: 0,
                    scale: 0.85,
                  }}
                  ref={scopeContent}
                >
                  {content}
                </motion.div>

                {buttons}
              </div>
            </motion.div>
          ) : null}
        </>,
        ref.current
      )
    : null;
}
