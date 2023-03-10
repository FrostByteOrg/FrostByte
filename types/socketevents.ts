import { Channel, Message, Server, UnsavedMessage, User } from './dbtypes';

export interface SocketClientEvents {
  // User online status events
  userConnected: (userId: string) => void;
  userDisconnected: (userId: string) => void;

  // Message events
  messageCreated: (message: UnsavedMessage) => void;
  messageUpdated: (message: Message) => void;
  messageDeleted: (message: Message) => void;
}

export interface SocketServerEvents {
  // User online status events
  serverBroadcastUserConnected: (userId: string) => void;
  serverBroadcastUserDisconnected: (userId: string) => void;

  // Message events
  // NOTE: At this point, message is now saved, hence the Message type
  serverBroadcastMessageCreated: (message: Message) => void;
  serverBroadcastMessageUpdated: (message: Message) => void;
  serverBroadcastMessageDeleted: (message: Message) => void;

  // Server events
  // NOTE: We only fire update and delete events because creation starts with only one user, meaning nobody will receive it
  // As servers are invite only
  serverBroadcastServerUpdated: (server: Server) => void;
  serverBroadcastServerDeleted: (server: Server) => void;
  serverBroadcastUserJoin: (user: User, server: Server) => void;
  serverBroadcastUserLeave: (user: User, server: Server) => void;

  // Channel events
  // Since channels can be created while other users are in the server, we need to broadcast creation as well
  serverBroadcastChannelCreated: (channel: Channel) => void;
  serverBroadcastChannelUpdated: (channel: Channel) => void;
  serverBroadcastChannelDeleted: (channel: Channel) => void;

  // User events
  serverBroadcastUserUpdated: (user: User) => void;
}
