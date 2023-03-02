import path from 'path';
import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useSocket = () => {
  const socketCreated = useRef(false);

  useEffect(() => {
    if (!socketCreated.current) {
      const socketIntializer = async () => {
        await fetch('/api/socketio');
      };
      try {
        socketIntializer();
        socketCreated.current = true;
      } catch (error) {
        console.log(error);
      }
    }

    return () => {
      socketCreated.current = false;
    };
  }, []);
};

export default useSocket;
