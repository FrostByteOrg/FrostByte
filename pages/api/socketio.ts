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
          .then(server => {
            if (server.error) {
              console.error(`Error adding ${user.username} to server ${serverId}: ${server.error}`);
              return;
            }

            console.log(`User ${user.username} joined ${server.data.name}`);
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
          .then((savedMessage) => {
            if (savedMessage.error) {
              console.error(savedMessage.error);
              return;
            }

            io.to(message.channelId.toString()).emit('serverBroadcastsUserSentMessage', savedMessage);
            // TODO: Sort out the relationship on this, we should only be returning a single channel/server_user object from the query
            console.log(`[${savedMessage.data.server_users[0].nickname} @ ${savedMessage.data.channels[0].name}]: ${savedMessage.data.content}`);
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
          .then((server_user) => {
            if (server_user.error) {
              console.error(server_user.error);
              return;
            }

            console.log(`User ${user.username} left ${server_user.data.servers!.name}`);
            socket.leave(server_user.data.server_id.toString());
            socket.to(server_user.data.server_id.toString()).emit('serverBroadcastsUserLeave', user, server_user.data.servers);
          });
      });

      socket.on('userConnected', (userId) => {
        supabase
          .from('profiles')
          .select('username')
          .then((username) => {
            if (username.error) {
              console.error(username.error);
              return;
            }

            console.log(`User ${username} is online.`);
          });

        socket.emit('serverBroadcastsUserConnected', userId);
      });

      socket.on('userDisconnected', (userId) => {
        supabase
          .from('profiles')
          .select('username')
          .then((username) => {
            if (username.error) {
              console.error(username.error);
              return;
            }

            console.log(`User ${username} is offline.`);
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
