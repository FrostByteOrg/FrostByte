import { motion, useAnimate, usePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function Clover({
  initX = 0,
  initY = 0,
  x = 0,
  y = 0,
  rotate = 0,
}: {
  initX?: number;
  initY?: number;
  x?: number;
  y?: number;
  rotate?: number;
}) {
  const [isPresent, safeToRemove] = usePresence();
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (isPresent) {
      const enterAnimation = async () => {
        animate(scope.current, { opacity: 1, x: x, y: y }, { duration: 0.4 });
      };
      enterAnimation();
    }
  }, [animate, isPresent, safeToRemove, scope, x, y]);

  return (
    <motion.svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 28 33.8"
      xmlSpace="preserve"
      className="w-5 h-5"
      ref={scope}
      initial={{ x: initX, y: initY, scale: 0.9, opacity: 0, rotate: rotate }}
    >
      <motion.path
        className="st0"
        fill="#b2c1c7"
        stroke="#000000"
        strokeWidth={0.25}
        d="M3.4,14.2c-0.5-0.9-2.4-1.9-1.9-4.1C2.3,5.9,10.5,4,12,5c2,1.3,1,3.5,0.3,4.3c-1.2,1.4-4.3,2.9-6.3,4.7
		c-0.1,0.1,0,0,0.2,0l5,0l0,0h1.1c0,0,3.3-2.7,3.8-2.5c1.9,0.8,8.8,4.2,9.3,5.5c-3.3,2.7-8.3,4.9-9.3,5.3c-0.5,0.2-3.4-2.7-4-2.7
		c-6.3-0.2-6,0.1-6,0.1C5.4,20.9,13,23.7,13,26c0,3.9-5.7,3.4-7.9,2.2c-2.3-1.3-4-2.4-4.2-4.9c-0.1-1.3,1.6-2.8,2.3-3.6
		c0.1-0.1,1.1-1.4,1.2-2.7C4.4,15.6,3.4,14.2,3.4,14.2z"
      />
    </motion.svg>
  );
}
