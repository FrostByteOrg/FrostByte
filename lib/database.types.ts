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
      channels: {
        Row: {
          created_at: string | null
          id: number
          name: string | null
          server: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name?: string | null
          server?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string | null
          server?: number | null
        }
      }
      invites: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: number
          server: number
          url_id: string
          uses_remaining: number | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: number
          server: number
          url_id: string
          uses_remaining?: number | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: number
          server?: number
          url_id?: string
          uses_remaining?: number | null
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
      }
      server_roles: {
        Row: {
          created_at: string | null
          id: number
          name: string
          permissions: number
        }
        Insert: {
          created_at?: string | null
          id: number
          name?: string
          permissions: number
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          permissions?: number
        }
      }
      server_users: {
        Row: {
          id: number
          joined_at: string | null
          nickname: string | null
          server: number | null
          user: string | null
        }
        Insert: {
          id?: number
          joined_at?: string | null
          nickname?: string | null
          server?: number | null
          user?: string | null
        }
        Update: {
          id?: number
          joined_at?: string | null
          nickname?: string | null
          server?: number | null
          user?: string | null
        }
      }
      servers: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id: number
          name?: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

