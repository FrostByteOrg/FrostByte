import { Database } from './database.supabase';

export type Message = Database['public']['Tables']['messages']['Row'];
export type Channel = Database['public']['Tables']['channels']['Row'];
export type Server = Database['public']['Tables']['servers']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Invite = Database['public']['Tables']['server_invites']['Row'];
export type ServerUser = Database['public']['Tables']['server_users']['Row'];
export type ServerUserRole = Database['public']['Tables']['server_user_roles']['Row'];
export type ChannelPermissions = Database['public']['Tables']['channel_permissions']['Row'];
export type Role = Database['public']['Tables']['server_roles']['Row'];
export type ServerBan = Database['public']['Tables']['server_bans']['Row'];
export type ProfileRelation = Database['public']['Tables']['profile_relations']['Row'];
export type DetailedProfileRelation = Omit<ProfileRelation, 'user1' | 'user2'> & { target_profile: Profile, initiator_profile_id: string };
export type ProfileRelationshipType = Database['public']['Enums']['relationship'];
export type ServerBanWithProfile = ServerBan & { profiles: Profile };

// Custom type modifications for client side
export type UnsavedMessage = Omit<Message, 'id' | 'created_at' | 'sent_time' | 'is_edited' | 'is_pinned' | 'edited_time' | 'author_id'>;
export type MessageWithServerProfile = Omit<Message, 'profile_id' | 'author_id'> & { profile: Profile, author: ServerUser, roles: Role[], };
export type ServersForUser =  { server_id: number } & { servers: Server };
export type ServerUserProfile = Profile & { server_user: ServerUser | null, roles: (Role & {server_user_role_id: number})[] | null; };
export type ServerInvite = Invite & { servers: Server };
export type DMChannelWithRecipient = { channel_id: number, server_id: number, recipient: Profile };

export interface IStringIndexable {
  [key: string]: any
}
