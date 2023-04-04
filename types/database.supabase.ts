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
      profile_relations: {
        Row: {
          created_at: string | null
          id: number
          relationship: Database['public']['Enums']['relationship']
          user1: string
          user2: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          relationship: Database['public']['Enums']['relationship']
          user1: string
          user2: string
        }
        Update: {
          created_at?: string | null
          id?: number
          relationship?: Database['public']['Enums']['relationship']
          user1?: string
          user2?: string
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
          channel_id: number
          created_at: string | null
          expires_at: string | null
          id: number
          server_id: number
          url_id: string
          uses_remaining: number | null
        }
        Insert: {
          channel_id: number
          created_at?: string | null
          expires_at?: string | null
          id?: number
          server_id: number
          url_id?: string
          uses_remaining?: number | null
        }
        Update: {
          channel_id?: number
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
          is_dm: boolean
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_dm?: boolean
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          image_url?: string | null
          is_dm?: boolean
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
      accept_friend_request: {
        Args: {
          t_p_id: string
        }
        Returns: {
          created_at: string | null
          id: number
          relationship: Database['public']['Enums']['relationship']
          user1: string
          user2: string
        }[]
      }
      create_dm: {
        Args: {
          t_p_id: string
        }
        Returns: {
          channel_id: number
          server_id: number
          recipient: Json
        }[]
      }
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
      decrement_role_position: {
        Args: {
          role_id: number
        }
        Returns: undefined
      }
      detailed_profile_relations: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: number
          target_profile: Json
          initiator_profile_id: string
          relationship: Database['public']['Enums']['relationship']
          created_at: string
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
      get_detailed_profile_relation: {
        Args: {
          pr_id: number
        }
        Returns: {
          id: number
          target_profile: Json
          initiator_profile_id: string
          relationship: Database['public']['Enums']['relationship']
          created_at: string
        }[]
      }
      get_dm_channel_and_target_profile_by_server_id: {
        Args: {
          s_id: number
        }
        Returns: {
          channel_id: number
          recipient: Json
        }[]
      }
      get_dm_channels_and_target_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          channel_id: number
          server_id: number
          recipient: Json
        }[]
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
          content: string
          author: Json
          profile: Json
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
          content: string
          author: Json
          profile: Json
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
      get_profile_relationship_by_target_profile_id: {
        Args: {
          t_p_id: string
        }
        Returns: {
          created_at: string | null
          id: number
          relationship: Database['public']['Enums']['relationship']
          user1: string
          user2: string
        }[]
      }
      get_roles_for_servers: {
        Args: Record<PropertyKey, never>
        Returns: {
          color: string | null
          created_at: string | null
          id: number
          is_system: boolean
          name: string
          permissions: number
          position: number
          server_id: number
        }[]
      }
      get_roles_for_user_in_server: {
        Args: {
          p_id: string
          s_id: number
        }
        Returns: {
          color: string | null
          created_at: string | null
          id: number
          is_system: boolean
          name: string
          permissions: number
          position: number
          server_id: number
        }[]
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
          server_user: Json
          roles: Json
        }[]
      }
      get_server_profiles_for_all_users_in_server: {
        Args: {
          s_id: number
        }
        Returns: {
          id: string
          updated_at: string
          username: string
          full_name: string
          avatar_url: string
          website: string
          email: string
          server_user: Json
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
          is_dm: boolean
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
      increment_role_position: {
        Args: {
          role_id: number
        }
        Returns: undefined
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
      relationship: 'friend_requested' | 'friends' | 'blocked'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
