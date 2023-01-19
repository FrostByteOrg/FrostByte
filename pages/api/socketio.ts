import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from "@supabase/supabase-js";
import { Database } from "lib/database.types";

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const socketIoHandler = (req: NextApiRequest, res: NextApiResponse) => {
    // TODO: See about these null issues. How often are they occurring and how fixable is this
    if (!res.socket.server.io) {
        console.log("Starting socket.io");

        const io = new Server(res.socket.server);

        io.on("connection", (socket) => {
            socket.on("userJoined", (user, serverId) => {
                supabase.from("servers")
                    .select("*")
                    .eq("id", serverId)
                    .single()
                    .then(server => {
                        if (server.error) {
                            console.log(`Error adding ${user.username} to server ${serverId}: ${server.error}`);
                            return;
                        }

                        console.log(`User ${user.username} joined ${server.data.name}`);
                        // TODO: Build out a System channel/default channel to announce user joins. Discord defaults this to #general
                        // socket.join(channel.id.toString());
                        // socket.to(channel.id.toString()).emit("serverBroadcastsUserJoin", user, channel);
                    });
            });

            socket.on("userSendsMessage", (message) => {
                supabase.from("messages")
                    .insert({
                        channel: message.channelId,

                    })
                prisma.message.create({
                    data: {
                        content: message.content,
                        isEdited: message.isEdited,
                        timeSent: message.timeSent,
                        authorId: message.authorId,
                        channelId: message.channelId
                    },
                    include: { channel: true, author: true }
                })
                    .then((savedMessage) => {
                        io.to(message.channelId.toString()).emit("serverBroadcastsUserSentMessage", savedMessage);
                        console.log(`[${savedMessage.author.username} @ ${savedMessage.channel.name}]: ${savedMessage.content}`);
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            });

            socket.on("userLeft", (user, channelId) => {
                prisma.channel.findUniqueOrThrow({ where: { id: channelId }})
                    .then((channel) => {
                        console.log(`User ${user.username} left ${channel.name}`);
                        socket.leave(channel.id.toString());
                        socket.to(channel.id.toString()).emit("serverBroadcastsUserLeave", user, channel);
                    })
                    .catch((err) => {
                        console.error(err);
                    });
            });

            socket.on("userConnected", (userId) => {
                prisma.user.findUniqueOrThrow({ where: { id: userId }})
                    .then((user) => {
                        console.log(`User ${user.username} is online.`);
                    });

                socket.emit("serverBroadcastsUserConnected", userId);
            });

            socket.on("userDisconnected", (userId) => {
                prisma.user.findUniqueOrThrow({ where: { id: userId }})
                    .then((user) => {
                        console.log(`User ${user.username} is offline.`);
                    });

                socket.emit("serverBroadcastsUserDisconnected", userId);
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
