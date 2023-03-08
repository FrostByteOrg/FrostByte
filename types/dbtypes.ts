import { MessagesWithUsersResponseSuccess } from '@/services/message.service';
import { GetServerForUserResponseSuccess, GetServersForUserResponseError, GetServersForUserResponseSuccess } from '@/services/server.service';
import { Database } from './database.supabase';

export type Message = Database['public']['Tables']['messages']['Row'];
export type Channel = Database['public']['Tables']['channels']['Row'];
export type Server = Database['public']['Tables']['servers']['Row'];
export type User = Database['public']['Tables']['profiles']['Row'];
export type Invite = Database['public']['Tables']['server_invites']['Row'];
export type ServerUser = Database['public']['Tables']['server_users']['Row'];

// Custom type modifications for client side
export type UnsavedMessage = Omit<Message, 'id' | 'created_at' | 'sent_time' | 'is_edited' | 'is_pinned' | 'edited_time' | 'author_id'>;
export type ChatMessageWithUser = MessagesWithUsersResponseSuccess & {server_users: { nickname: string }} | IStringIndexable;
export type ServersForUser =  GetServersForUserResponseSuccess | IStringIndexable;
export type ServerForUser = GetServerForUserResponseSuccess | IStringIndexable;

export interface IStringIndexable {
  [key: string]: any
}
