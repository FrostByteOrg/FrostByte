import { supabase } from '@/lib/supabaseClient';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server } from 'socket.io';

export default async function socketIoHandler(
  req: NextApiRequest,
  res: NextApiResponse | any
) {
  if (res.socket.server.io) {
    console.log('Socket is already attached');
    res.end();
    return;
  }
  console.log('Mounting the socket');
  const io = new Server(res.socket.server);

  res.socket.server.io = io;

  io.on('connect', (socket) => {
    console.log(`Someone connected to ${socket.id}}`);

    socket.on('join-room', ({ room, user }) => {
      const { rooms } = io.sockets.adapter;
      const thisRoom = rooms.get(room);

      console.log(`${user.id} in room ${room}`);

      if (thisRoom === undefined) {
        socket.join(room);
        socket.emit('room-created');
        console.log('first');
      } else if (thisRoom.size === 1) {
        socket.join(room);
        socket.emit('joined');
        console.log('second');
      } else {
        socket.emit('full');
        console.log('too many');
      }

      io.to(room).emit('newUserJoin', user.id);
    });

    socket.on('ready', (room) => {
      socket.broadcast.to(room).emit('ready');
    });

    socket.on('ice-candidate', (candidate: RTCIceCandidate, room: string) => {
      console.log(candidate);
      socket.broadcast.to(room).emit('ice-candidate', candidate);
    });

    socket.on('offer', (offer, room) => {
      socket.broadcast.to(room).emit('offer', offer);
    });

    socket.on('answer', (answer, room) => {
      socket.broadcast.to(room).emit('answer', answer);
    });

    socket.on('leave', (room) => {
      socket.leave(room);
      socket.broadcast.to(room).emit('leave');
    });
  });
  res.end();
}

export const config = {
  api: {
    bodyParser: false,
  },
};
