import { motion, useAnimate, usePresence } from 'framer-motion';
import { useEffect } from 'react';

export default function ButtonDetail({
  initX = 0,
  initY = 0,
  x = 0,
  y = 0,
  isHovered = false,
  hoveredX = initX,
}: {
  initX?: number;
  initY?: number;
  x?: number;
  y?: number;
  isHovered?: boolean;
  hoveredX?: number;
}) {
  const [isPresent, safeToRemove] = usePresence();
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (isPresent) {
      const enterAnimation = async () => {
        animate(scope.current, { opacity: 1, x: x, y: y }, { duration: 3 });
      };
      enterAnimation();
    }
  }, [animate, isPresent, safeToRemove, scope, x, y]);

  useEffect(() => {
    if (isHovered) {
      animate(scope.current, { x: hoveredX }, { duration: 0.3 });
    } else {
      animate(scope.current, { x: x }, { duration: 0.3 });
    }
  }, [animate, hoveredX, isHovered, scope, x]);

  return (
    <motion.svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      viewBox="0 0 85.7 33.8"
      xmlSpace="preserve"
      className="w-6 h-6"
      ref={scope}
      initial={{ x: initX, y: initY, scale: 0.9, opacity: 0 }}
    >
      <path
        className="st2"
        fill="#d6dde1"
        stroke="#000000"
        strokeWidth={0.25}
        d="M18,18.9c3.4,6.3,12.8,0.2,12.8,0.2c0,0.4-2,3.5-1.5,5c1,2.8,11.2,6.1,11.2,2c0-2.3-8-5.9-7.4-7
   c0,0-1.1,0.2,5.1,0.4c0.6,0,3.1,3,5.2,3c1.7,0,5.7-1,6.3-5.5c-0.4-3.7-3.7-5.2-6.6-5.3c-1.7-0.1-3.8,2.2-4.6,2.8
   c-0.2,0.2-1.4,0.2-1.4,0.2s-4.2,0.3-4,0.2c2-1.9,4-3.3,5.6-4.4c1-0.7,3.1-3.2,0.6-4.2c-1.7-0.7-8.2,1.1-10,4.2
   c-1.1,1.9,2.2,5.3,1.5,4.5c0,0-9.6-6.1-12.5,0.1c0,0-0.8,0.7-2.1,0.9c-2.3,0.2-6.2,0.8-9.6,0.9c-3,0.1-5.6,0-6.5,0.1
   c-0.3,0.1,2.8,0,6.4,0.3c3.4,0.2,7.4,0.7,9.7,1C17.4,18.5,18,18.9,18,18.9z"
      />
      <path className="st2" d="M4.7,17.2" />

      <path
        className="st2"
        fill="#d6dde1"
        stroke="#000000"
        strokeWidth={0.25}
        d="M56.3,20.5c-0.1,9.4-9,7-9,4.4c-0.1-4.5,8.4-4.3,7.8-5c-1.3-1.5,0-5.5,0-5.5c0.2-0.5-8.2-0.3-8.2-4.1
   c0-4,8.8-6,9.3,3.2c2.3-2.6,9.7-2.6,11.4,1.6c0.5,1.2,18,2.1,18,2.1s-16.8,0.1-17.9,1.8C63.5,25.6,56.3,20.5,56.3,20.5z"
      />
      <path className="st2" d="M66.5,15.3" />
      <path className="st2" d="M81.1,17.1" />
    </motion.svg>
  );
}
