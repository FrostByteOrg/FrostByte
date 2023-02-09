import { useEffect, useRef } from 'react';

const useSocket = () => {
  const socketCreated = useRef(false);

  useEffect(() => {
    if (!socketCreated.current) {
      const socketIntializer = async () => {
        await fetch('/pages/api/socketio');
      };
      try {
        socketIntializer();
        socketCreated.current = true;
      } catch (error) {
        console.log(error);
      }
    }
  });
};

export default useSocket
