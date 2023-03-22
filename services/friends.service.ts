import { Database } from '@/types/database.supabase';
import { DetailedProfileRelation } from '@/types/dbtypes';
import { SupabaseClient } from '@supabase/supabase-js';

// NOTE: RLS is enforced such that only records that contain the current user's id can be returned
export function getFriends(supabase: SupabaseClient<Database>) {
  return supabase
    .rpc('detailed_profile_relations')
    .filter('relation', 'eq', 'friend')
    .returns<DetailedProfileRelation>();
}

export function getFriendRequests(supabase: SupabaseClient<Database>) {
  return supabase
    .rpc('detailed_profile_relations')
    .filter('relation', 'eq', 'friend_requested')
    .returns<DetailedProfileRelation>();
}

export function getBlockedUsers(supabase: SupabaseClient<Database>) {
  return supabase
    .rpc('detailed_profile_relations')
    .filter('relation', 'eq', 'blocked')
    .returns<DetailedProfileRelation>();
}

export function getRelationships(supabase: SupabaseClient<Database>) {
  return supabase
    .rpc('detailed_profile_relations')
    .returns<DetailedProfileRelation>();
}
