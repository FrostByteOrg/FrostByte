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
                    channel_id: number
                    created_at: string | null
                    description: string | null
                    name: string | null
                    server_id: number
                }
                Insert: {
                    channel_id?: number
                    created_at?: string | null
                    description?: string | null
                    name?: string | null
                    server_id: number
                }
                Update: {
                    channel_id?: number
                    created_at?: string | null
                    description?: string | null
                    name?: string | null
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
                    sent_time?: string
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
                    url_id: string
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
                    created_at: string | null
                    id: number
                    name: string
                    permissions: number
                    server_id: number
                }
                Insert: {
                    created_at?: string | null
                    id: number
                    name?: string
                    permissions: number
                    server_id: number
                }
                Update: {
                    created_at?: string | null
                    id?: number
                    name?: string
                    permissions?: number
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
