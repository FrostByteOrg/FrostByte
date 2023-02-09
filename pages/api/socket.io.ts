import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';
import { SocketClientEvents, SocketServerEvents } from '@/types/socketevents';
import { createMessage } from '@/services/message.service';
import { getAllChannelsForUser } from '@/services/channels.service';
import { NextApiResponseWithSocket } from '@/types/socketEndpoint';

export default function SocketIOHanler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (!res.socket.server.io) {
    console.log('Starting socket.io');

    const io = new Server<SocketClientEvents, SocketServerEvents>(res.socket.server, { path: '/api/socket.io' });

    io.on('connection', (socket) => {
      console.log('User connected');

      socket.on('messageCreated', async (message) => {
        console.table(message);
        const { data: savedMessage, error } = await createMessage(message);

        if (error) {
          console.error(error);
          return res.end();
        }

        console.table(savedMessage);

        socket
          .to(message.channel_id.toString())
          .emit('serverBroadcastMessageCreated', savedMessage);
      });

      // Online events
      socket.on('userConnected', async (userId) => {
        // We need to now add the user to every channel they have access to
        const { data: channels } = await getAllChannelsForUser(userId);

        if (channels) {
          for (const channel of channels) {
            socket.join(channel.channel_id.toString());
          };
        }

        console.log(`${userId} is now online`);
        socket.emit('serverBroadcastUserConnected', userId);
      });

      socket.on('userDisconnected', (userId) => {
        socket.emit('serverBroadcastUserDisconnected', userId);
      });
    });

    res.socket.server.io = io;
  }
  return res.end();
};

export const config = {
  api: {
    bodyParser: false
  }
};
