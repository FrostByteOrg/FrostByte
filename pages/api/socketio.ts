import { Server } from 'socket.io';
import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/lib/supabaseClient';

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
          .then((cursor) => {
            if (cursor.error) {
              console.error(
                `Error adding ${user.username} to server ${serverId}: ${cursor.error}`
              );
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
          .select(
            `
            *,
            server_users (
              nickname
            ),
            channels (
              name
            )
          `
          )
          .single()
          .then((cursor) => {
            if (cursor.error) {
              console.error(cursor.error);
              return;
            }

            io.to(message.channelId.toString()).emit(
              'serverBroadcastsUserSentMessage',
              cursor.data
            );
            // TODO: Sort out the relationship on this, we should only be returning a single channel/server_user object from the query
            console.log(
              `[${
                (cursor.data.server_users! as { nickname: string | null }[])[0]
                  .nickname
              } @ ${(cursor.data.channels as { name: string | null }).name}]: ${
                cursor.data.content
              }`
            );
          });
      });

      socket.on('userLeft', (user, serverId) => {
        supabase
          .from('server_users')
          .delete()
          .eq('server_id', serverId)
          .eq('profile_id', user.id)
          .select(
            `
            *,
            servers (
              *
            )
          `
          )
          .single()
          .then((cursor) => {
            if (cursor.error) {
              console.error(cursor.error);
              return;
            }

            console.log(
              `User ${user.username} left ${
                (
                  cursor.data.servers as {
                    created_at: string | null;
                    id: number;
                    name: string;
                  }[]
                )[0].name
              }`
            );
            socket.leave(cursor.data.server_id.toString());
            socket
              .to(cursor.data.server_id.toString())
              .emit('serverBroadcastsUserLeave', user, cursor.data.servers);
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

      // Socket Events for handling webrtc signaling

      //Signal event triggered to let others know you're ready to stream
      socket.on('ready', (channelId) => {
        socket.broadcast.to(channelId).emit('ready');
        //TODO: expand this from 1 : 1
      });

      /*
      ICE is an exchange protocol, the READY user sends this to the user accepting offer
      its where the connection exchange finds a good route
      */
      socket.on('ice', (candidate: RTCIceCandidate, channelId: string) => {
        console.log(candidate);
        socket.broadcast.to(channelId).emit('ice', candidate);
      });

      //Offer from user who is ready to stream sent to peer
      socket.on('connection-offer', (userOffer, channelId) => {
        socket.broadcast.to(channelId).emit('offer', userOffer);
      });

      //Event emitted when peer accepts connection-offer
      socket.on('answer', (answer, channelId) => {
        socket.broadcast.to(channelId).emit('answer', answer);
      });

      //Event to emit when connection closes when the stream shuts off
      socket.on('close-connection', (channelId) => {
        socket.broadcast.to(channelId).emit('close-connection');
      });
    });
  }
};

export default socketIoHandler;

export const config = {
  api: {
    bodyParser: false,
  },
};
