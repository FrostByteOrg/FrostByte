import { IStringIndexable } from '@/lib/Store';
import { MessagesWithUsersResponseError, MessagesWithUsersResponseSuccess } from '@/services/message.service';
import { Database } from './database.supabase';

export type Message = Database['public']['Tables']['messages']['Row'];
export type Channel = Database['public']['Tables']['channels']['Row'];
export type Server = Database['public']['Tables']['servers']['Row'];
export type User = Database['public']['Tables']['profiles']['Row'];

// Custom type modifications for client side
export type UnsavedMessage = Omit<Message, 'id' | 'created_at' | 'sent_time' | 'is_edited' | 'is_pinned' | 'edited_time' | 'author_id'>;

// TODO: Split the error and data types here
export type ChatMessagesWithUser = MessagesWithUsersResponseSuccess | IStringIndexable;
