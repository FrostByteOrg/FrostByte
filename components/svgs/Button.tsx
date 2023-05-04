import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useAnimate, usePresence } from 'framer-motion';
import Clover from '@/components/svgs/Clover';
import ButtonDetail from './ButtonDetail';

export default function Button({
  fill1 = '#FFFFFF',
  fill2 = '#FFFFFF',
  stroke1Opacity = 0.6,
  stroke2Opacity = 1,
  text = '',
}: {
  fill1?: string;
  fill2?: string;
  stroke1Opacity?: number;
  stroke2Opacity?: number;
  text?: string;
}) {
  const [scope1, animate1] = useAnimate();
  const [scope2, animate2] = useAnimate();
  const [scopeText, animateText] = useAnimate();
  const [scopeParent, animateParent] = useAnimate();
  const [isPresent, safeToRemove] = usePresence();
  const [isHovered, setIsHovered] = useState(false);

  //NOTE: probably use usePresence in the modal and pass it as a prop in here, we wanna annimate and show this button only if that modal is up too (mainly because we need it to synch with the video). This may not work however, we may need to use a listener from the VideoPlayer for video start, once video starts it should trigger a callback and we can pass that in here as a prop and use that in the useEffect along with isPresent

  useEffect(() => {
    if (isPresent) {
      const enterAnimation = async () => {
        animate1(scope1.current, { opacity: 1 }, { duration: 3 });
        animate2(scope2.current, { opacity: 1 }, { duration: 3 });
        animateParent(
          scopeParent.current,
          { y: 0, x: 0, scale: 1 },
          { duration: 3 }
        );
        animateText(
          scopeText.current,
          { y: -50, x: 250, scale: 1, opacity: 1 },
          { duration: 3 }
        );
      };
      enterAnimation();
    } else {
      const exitAnimation = async () => {
        await animate1(scope1.current, { opacity: 0 }, { duration: 2 });
        await animate2(scope2.current, { opacity: 0 }, { duration: 2 });
        safeToRemove();
      };

      exitAnimation();
    }
  }, [
    animate1,
    animate2,
    animateParent,
    animateText,
    isPresent,
    safeToRemove,
    scope1,
    scope2,
    scopeParent,
    scopeText,
  ]);

  //TODO: to fix hover color issue (over text its not doing it right)... wrap the svg and text in a parent div and apply the event listeners/callbacks on that div

  return (
    <>
      <div className="relative z-50">
        <motion.svg
          ref={scopeParent}
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlnsXlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 612 61"
          width={612}
          height={61}
          onHoverStart={() => {
            animate1(scope1.current, { fill: 'hsla(198, 80%, 45%,0.6)' });
            animate2(scope2.current, { fill: 'hsla(198, 80%, 45%,0.1)' });
            setIsHovered(true);
          }}
          onHoverEnd={() => {
            animate1(scope1.current, { fill: 'hsla(198, 70%, 55%,0.15)' });
            animate2(scope2.current, { fill: 'hsla(198, 70%, 55%,0.015)' });
            setIsHovered(false);
          }}
          className=" relative"
          initial={{ x: 40, y: 40, scale: 0.8 }}
        >
          <motion.path
            className="st0 z-20"
            stroke="#6a838d"
            ref={scope1}
            initial={{ fill: 'hsla(198, 70%, 55%,0.15)', opacity: 0 }}
            strokeOpacity={stroke2Opacity}
            d="M602.5,60.5H9.5c0-5-4-9-9-9v-42c5,0,9-4,9-9h593c0,5,4,9,9,9v42C606.5,51.5,602.5,55.5,602.5,60.5z"
          />
          <motion.path
            className="st0 z-20"
            ref={scope2}
            initial={{ fill: 'hsla(198, 70%, 55%,0.015)', opacity: 0 }}
            stroke="#000000"
            strokeOpacity={stroke1Opacity}
            d="M594.8,54.2H18c0-5-4-9-9-9V15.8c5,0,9-4,9-9h576.7c0,5,4,9,9,9v29.4C598.8,45.2,594.8,49.3,594.8,54.2z"
          />
        </motion.svg>
        <motion.div
          ref={scopeText}
          initial={{ x: 290, y: 0, scale: 0.9, opacity: 0 }}
          className="absolute text-2xl tracking-widest "
        >
          {text}
        </motion.div>
        {isHovered ? (
          <div className="absolute z-10 ">
            <Clover initY={-40} y={-40} initX={0} x={-40} rotate={180} />
          </div>
        ) : null}
        {isHovered ? (
          <div className="absolute z-10 ">
            <Clover initY={-40} y={-40} initX={590} x={630} />
          </div>
        ) : null}
      </div>
      <div className="absolute z-10 ">
        <ButtonDetail
          initX={60}
          x={60}
          initY={-76}
          y={-76}
          isHovered={isHovered}
          hoveredX={110}
        />
      </div>
      <div className="absolute z-10 ">
        <ButtonDetail
          initX={500}
          x={500}
          initY={-16}
          y={-16}
          isHovered={isHovered}
          hoveredX={450}
        />
      </div>
    </>
  );
}
// absolute top-[50%] left-[50%] translate-y-[-50%] translate-x-[-50%]
// initY={-50} y={-50}
