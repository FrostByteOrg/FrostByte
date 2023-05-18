import { useEffect, RefObject, useRef, useState } from 'react';
import styles from '@/styles/Modal.module.css';
import { KeyboardEventHandler } from 'react';
import { createPortal } from 'react-dom';
import ReactPlayer from 'react-player/file';
import { useSetButtonsEnabled, useSetModalOpen } from '@/lib/store';
import TitleDetail from '@/components/svgs/TitleDetail';
import { Roboto_Slab } from 'next/font/google';
import TitleDetailBottom from '@/components/svgs/TitleDetailBottom';
import { motion, useAnimate, usePresence } from 'framer-motion';
import { useMediaQuery } from 'react-responsive';

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
});

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
  contentY = 0,
  titleScale = 1,
  initTitleScale = 0.8,
  initTitleOpacity = 0.5,
  initTitleTextX = 0,
  initTitleTextY = 0,
  titleTextX = 0,
  titleTextY = 0,
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
  contentY?: number;
  titleScale?: number;
  initTitleScale?: number;
  initTitleOpacity?: number;
  initTitleTextX?: number;
  initTitleTextY?: number;
  titleTextX?: number;
  titleTextY?: number;
}) {
  //TODO: Fix vertical sizing/responsiveness on big modal
  //TODO: Fix server settings modal
  //TODO: See if all is good on mobile

  const ref = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);
  const [firstRender, setFirstRender] = useState(showModal);

  const [scopeModal, animateModal] = useAnimate();
  const [scopeTitle, animateTitle] = useAnimate();
  const [scopeTitleText, animateTitleText] = useAnimate();
  const [scopeContent, animateContent] = useAnimate();
  const [isPresent, safeToRemove] = usePresence();

  const [isPlaying, setIsPlaying] = useState(false);

  const checkSmallScreen = useMediaQuery({ query: '(max-width: 1280px)' });
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const setButtonsEnabled = useSetButtonsEnabled();

  useEffect(() => {
    setIsSmallScreen(checkSmallScreen);
  }, [checkSmallScreen, setIsSmallScreen]);

  useEffect(() => {
    if (isPresent && isPlaying) {
      const enterAnimation = async () => {
        if (size == 'small') {
          setTimeout(() => {
            animateTitle(
              scopeTitle.current,
              {
                y: isSmallScreen && size == 'small' ? 100 : titleY,
                x: titleX,
                scale: isSmallScreen && size == 'small' ? 0.75 : titleScale,
                opacity: 1,
              },
              { duration: 3 }
            );
            animateTitleText(
              scopeTitleText.current,
              { y: titleTextY, x: titleTextX },
              { duration: 3 }
            );
            setTimeout(() => {
              animateContent(
                scopeContent.current,
                {
                  scale: 1,
                  opacity: 1,
                  x: contentX,
                  y: isSmallScreen && size == 'small' ? 90 : contentY,
                },
                { duration: 2.5 }
              );
            }, 1300);
          }, 500);
        } else {
          animateTitle(
            scopeTitle.current,
            {
              y: titleY,
              x: titleX,
              scale: titleScale,
              opacity: 1,
            },
            { duration: 3 }
          );
          animateTitleText(
            scopeTitleText.current,
            { y: titleTextY, x: titleTextX },
            { duration: 3 }
          );
          setTimeout(() => {
            animateContent(
              scopeContent.current,
              {
                scale: 1,
                opacity: 1,
                x: contentX,
                y: contentY,
              },
              { duration: 2.5 }
            );
          }, 1300);
        }
      };
      enterAnimation();
    } else if (!isPresent) {
      const exitAnimation = async () => {
        safeToRemove();
      };

      exitAnimation();
    }
  }, [
    animateContent,
    animateTitle,
    animateTitleText,
    contentX,
    contentY,
    isPlaying,
    isPresent,
    isSmallScreen,
    safeToRemove,
    scopeContent,
    scopeTitle,
    scopeTitleText,
    size,
    titleScale,
    titleTextX,
    titleTextY,
    titleX,
    titleY,
  ]);

  const setIsModalOpen = useSetModalOpen();

  const [videoStatus, setVideoStatus] = useState<
    'play' | 'pause' | 'playAfter' | 'ended' | 'not started'
  >('not started');

  useEffect(() => {
    ref.current = document.querySelector<HTMLElement>('#modalPortal');
    setMounted(true);
  }, []);

  //The useEffect below is used to capture the different states of the Modal (Closed, Opened, Paused etc.)
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
      setTimeout(() => {
        animateModal(
          scopeModal.current,
          {
            scale: isSmallScreen && size == 'small' ? 0.1 : 0.2,
            opacity: 0.5,
            x: -300,
          },
          { duration: isSmallScreen && size == 'small' ? 5 : 4 }
        );
      }, 500);
    }
  }, [
    animateContent,
    animateModal,
    contentX,
    contentY,
    firstRender,
    isSmallScreen,
    scopeContent,
    scopeModal,
    setIsModalOpen,
    showModal,
    size,
  ]);

  useEffect(() => {
    if (videoStatus == 'ended') {
      setIsModalOpen(false);
      setIsPlaying(false);
    }
    if (videoStatus == 'pause') {
      setButtonsEnabled(true);
    }
  }, [setButtonsEnabled, setIsModalOpen, videoStatus]);

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
          <div className="overflow-y-scroll">
            {size == 'big' ? (
              <>
                <ReactPlayer
                  url="./mainFull.mp4"
                  className={`${styles.bigModal} mix-blend-multiply fixed z-30 top-[46%] left-[54%] translate-y-[-50%] translate-x-[-50%]  w-full h-full opacity-95`}
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
                  className={`${styles.bigModalSecondary} mix-blend-multiply fixed z-30 top-[46%] left-[54%] translate-y-[-50%] translate-x-[-50%]  w-full h-full opacity-[0.9] `}
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
                className={`${styles.smallModal} mix-blend-multiply fixed z-30 top-[46%] left-[54%] translate-y-[-50%] translate-x-[-52%]  w-full h-full  `}
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
                className={`${robotoSlab.className} absolute top-[50%] left-[50%]  p-5 z-50  `}
                onKeyDown={onKeyDown}
                ref={scopeModal}
                initial={{ x: -150, y: -330 }}
              >
                <div className="p-4 z-50 ">
                  <motion.div
                    className="title"
                    initial={{
                      x: initTitleX,
                      y: initTitleY,
                      scale: initTitleScale,
                      opacity: initTitleOpacity,
                    }}
                    ref={scopeTitle}
                  >
                    <div className="">
                      <TitleDetail />
                    </div>
                    <motion.div
                      className="text-2xl font-bold tracking-wider flex justify-between items-center"
                      ref={scopeTitleText}
                      initial={{
                        x: initTitleTextX,
                        y: initTitleTextY,
                      }}
                    >
                      {title} {closeBtn}
                    </motion.div>
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
          </div>
        </>,
        ref.current
      )
    : null;
}
