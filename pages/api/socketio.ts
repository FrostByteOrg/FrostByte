import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import { Database } from 'lib/database.types';

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const socketIoHandler = (req: NextApiRequest, res: NextApiResponse) => {
  // TODO: See about these null issues. How often are they occurring and how fixable is this
  // @ts-expect-error temp for testing purposes. SEE: TODO above
  if (!res.socket.server.io) {
    console.log('Starting socket.io');

    // @ts-expect-error Like the above expect, based on TODO
    const io = new Server(res.socket.server);

    io.on('connection', (socket) => {
      socket.on('userJoined', (user, serverId) => {
        supabase
          .from('servers')
          .select('*')
          .eq('id', serverId)
          .single()
          .then(cursor => {
            if (cursor.error) {
              console.error(`Error adding ${user.username} to server ${serverId}: ${cursor.error}`);
              return;
            }

            console.log(`User ${user.username} joined ${cursor.data.name}`);
            // TODO: Build out a System channel/default channel to announce user joins. Discord defaults this to #general
            // socket.join(channel.id.toString());
            // socket.to(channel.id.toString()).emit('serverBroadcastsUserJoin', user, channel);
          });
      });

      socket.on('userSendsMessage', (message) => {
        supabase
          .from('messages')
          .insert({
            content: message.content,
            sent_time: message.timeSent,
            author_id: message.author_id,
            channel_id: message.channelId,
          })
          .select(`
            *,
            server_users (
              nickname
            ),
            channels (
              name
            )
          `)
          .single()
          .then((cursor) => {
            if (cursor.error) {
              console.error(cursor.error);
              return;
            }

            io.to(message.channelId.toString()).emit('serverBroadcastsUserSentMessage', cursor);
            // TODO: Sort out the relationship on this, we should only be returning a single channel/server_user object from the query
            console.log(`[${cursor.data.server_users[0].nickname} @ ${cursor.data.channels[0].name}]: ${cursor.data.content}`);
          });
      });

      socket.on('userLeft', (user, serverId) => {
        supabase
          .from('server_users')
          .delete()
          .eq('server_id', serverId)
          .eq('profile_id', user.id)
          .select(`
            *,
            servers (
              *
            )
          `)
          .single()
          .then((cursor) => {
            if (cursor.error) {
              console.error(cursor.error);
              return;
            }

            console.log(`User ${user.username} left ${cursor.data.servers!.name}`);
            socket.leave(cursor.data.server_id.toString());
            socket.to(cursor.data.server_id.toString()).emit('serverBroadcastsUserLeave', user, cursor.data.servers);
          });
      });

      socket.on('userConnected', (userId) => {
        supabase
          .from('profiles')
          .select('username')
          .then((cursor) => {
            if (cursor.error) {
              console.error(cursor.error);
              return;
            }

            console.log(`User ${cursor} is online.`);
          });

        socket.emit('serverBroadcastsUserConnected', userId);
      });

      socket.on('userDisconnected', (userId) => {
        supabase
          .from('profiles')
          .select('username')
          .then((cursor) => {
            if (cursor.error) {
              console.error(cursor.error);
              return;
            }

            console.log(`User ${cursor} is offline.`);
          });

        socket.emit('serverBroadcastsUserDisconnected', userId);
      });
    });
  }
};

export default socketIoHandler;

export const config = {
  api: {
    bodyParser: false
  }
};
