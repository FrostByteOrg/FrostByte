export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      channel_permissions: {
        Row: {
          channel_id: number
          created_at: string
          id: number
          permissions: number
          role_id: number
        }
        Insert: {
          channel_id: number
          created_at?: string
          id?: number
          permissions?: number
          role_id: number
        }
        Update: {
          channel_id?: number
          created_at?: string
          id?: number
          permissions?: number
          role_id?: number
        }
      }
      channels: {
        Row: {
          channel_id: number
          created_at: string | null
          description: string | null
          is_media: boolean
          name: string
          server_id: number
        }
        Insert: {
          channel_id?: number
          created_at?: string | null
          description?: string | null
          is_media?: boolean
          name: string
          server_id: number
        }
        Update: {
          channel_id?: number
          created_at?: string | null
          description?: string | null
          is_media?: boolean
          name?: string
          server_id?: number
        }
      }
      direct_message_channels: {
        Row: {
          created_at: string
          id: number
          owner_id: string
          recepient_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          owner_id: string
          recepient_id: string
        }
        Update: {
          created_at?: string
          id?: number
          owner_id?: string
          recepient_id?: string
        }
      }
      direct_messages: {
        Row: {
          author_id: string
          content: string
          direct_message_id: number
          edited_time: string | null
          id: number
          is_edited: boolean
          is_pinned: boolean
          sent_time: string
        }
        Insert: {
          author_id: string
          content: string
          direct_message_id: number
          edited_time?: string | null
          id?: number
          is_edited?: boolean
          is_pinned?: boolean
          sent_time?: string
        }
        Update: {
          author_id?: string
          content?: string
          direct_message_id?: number
          edited_time?: string | null
          id?: number
          is_edited?: boolean
          is_pinned?: boolean
          sent_time?: string
        }
      }
      messages: {
        Row: {
          author_id: number
          channel_id: number
          content: string
          edited_time: string | null
          id: number
          is_edited: boolean
          is_pinned: boolean
          profile_id: string
          sent_time: string
        }
        Insert: {
          author_id: number
          channel_id: number
          content: string
          edited_time?: string | null
          id?: number
          is_edited?: boolean
          is_pinned?: boolean
          profile_id: string
          sent_time?: string
        }
        Update: {
          author_id?: number
          channel_id?: number
          content?: string
          edited_time?: string | null
          id?: number
          is_edited?: boolean
          is_pinned?: boolean
          profile_id?: string
          sent_time?: string
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
          username: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
          username: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string
          website?: string | null
        }
      }
      server_bans: {
        Row: {
          created_at: string
          id: number
          profile_id: string
          reason: string
          server_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          profile_id: string
          reason?: string
          server_id: number
        }
        Update: {
          created_at?: string
          id?: number
          profile_id?: string
          reason?: string
          server_id?: number
        }
      }
      server_invites: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: number
          server_id: number
          url_id: string
          uses_remaining: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: number
          server_id: number
          url_id?: string
          uses_remaining?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: number
          server_id?: number
          url_id?: string
          uses_remaining?: number | null
        }
      }
      server_roles: {
        Row: {
          color: string | null
          created_at: string | null
          id: number
          is_system: boolean
          name: string
          permissions: number
          position: number
          server_id: number
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: number
          is_system?: boolean
          name?: string
          permissions?: number
          position: number
          server_id: number
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: number
          is_system?: boolean
          name?: string
          permissions?: number
          position?: number
          server_id?: number
        }
      }
      server_user_roles: {
        Row: {
          id: number
          role_id: number
          server_user_id: number
        }
        Insert: {
          id?: number
          role_id: number
          server_user_id: number
        }
        Update: {
          id?: number
          role_id?: number
          server_user_id?: number
        }
      }
      server_users: {
        Row: {
          id: number
          joined_at: string | null
          nickname: string | null
          profile_id: string
          server_id: number
        }
        Insert: {
          id?: number
          joined_at?: string | null
          nickname?: string | null
          profile_id: string
          server_id: number
        }
        Update: {
          id?: number
          joined_at?: string | null
          nickname?: string | null
          profile_id?: string
          server_id?: number
        }
      }
      servers: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          image_url: string | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          name?: string
        }
      }
      user_plugins: {
        Row: {
          id: number
          is_enabled: boolean
          profile_id: string
          settings_data: Json
          source_url: string
        }
        Insert: {
          id?: number
          is_enabled?: boolean
          profile_id: string
          settings_data?: Json
          source_url: string
        }
        Update: {
          id?: number
          is_enabled?: boolean
          profile_id?: string
          settings_data?: Json
          source_url?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      createmessage: {
        Args: {
          c_id: number
          p_id: string
          content: string
        }
        Returns: {
          author_id: number
          channel_id: number
          content: string
          edited_time: string | null
          id: number
          is_edited: boolean
          is_pinned: boolean
          profile_id: string
          sent_time: string
        }[]
      }
      get_all_channels_for_user: {
        Args: {
          p_id: string
        }
        Returns: {
          channel_id: number
        }[]
      }
      get_channel_permission_flags: {
        Args: {
          c_id: number
        }
        Returns: number
      }
      get_highest_role_position_for_user: {
        Args: {
          p_id: string
          s_id: number
        }
        Returns: number
      }
      get_message_with_server_profile: {
        Args: {
          m_id: number
        }
        Returns: {
          id: number
          sent_time: string
          is_edited: boolean
          is_pinned: boolean
          edited_time: string
          channel_id: number
          author_id: number
          content: string
          profile_id: string
          profiles: Json
          nickname: string
          roles: Json
        }[]
      }
      get_messages_in_channel_with_server_profile: {
        Args: {
          c_id: number
        }
        Returns: {
          id: number
          sent_time: string
          is_edited: boolean
          is_pinned: boolean
          edited_time: string
          channel_id: number
          author_id: number
          content: string
          profile_id: string
          profiles: Json
          nickname: string
          roles: Json
        }[]
      }
      get_owner_id_of_server_from_message: {
        Args: {
          m_id: number
        }
        Returns: string
      }
      get_permission_flags_for_server_user: {
        Args: {
          s_id: number
          p_id: string
        }
        Returns: number
      }
      get_roles_for_user_in_server: {
        Args: {
          p_id: string
          s_id: number
        }
        Returns: undefined
      }
      get_server_id_of_message: {
        Args: {
          m_id: number
        }
        Returns: number
      }
      get_server_profile_for_user: {
        Args: {
          s_id: number
          p_id: string
        }
        Returns: {
          id: string
          updated_at: string
          username: string
          full_name: string
          avatar_url: string
          website: string
          email: string
          nickname: string
          roles: Json
        }[]
      }
      get_servers_for_user: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          description: string | null
          id: number
          image_url: string | null
          name: string
        }[]
      }
      get_users_in_server: {
        Args: {
          s_id: number
        }
        Returns: {
          avatar_url: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
          username: string
          website: string | null
        }[]
      }
      is_user_in_server: {
        Args: {
          p_id: string
          s_id: number
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
