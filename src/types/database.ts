/**
 * Database Type Definitions
 *
 * TypeScript interfaces for database tables and related types.
 * These types ensure type safety when working with Supabase queries.
 */

// Sport types supported by the application
export type SportType = 'football' | 'basketball' | 'tennis' | 'baseball' | 'volleyball' | 'other';

// Match record from database
export interface Match {
  id: string;
  title: string;
  sport: SportType;
  location: string;
  date: string;
  time: string;
  max_players: number;
  creator_id: string;
  creator_name: string;
  captain_name: string;
  price_per_person: number;
  invite_code: string;
  created_at: string;
  updated_at: string;
}

// Participant record from database
export interface Participant {
  id: string;
  match_id: string;
  user_id: string;
  user_name: string;
  position: number;
  is_starter: boolean;
  joined_at: string;
}

// Match with participant count (for list views)
export interface MatchWithCount extends Match {
  participant_count?: number;
  participants?: Participant[];
}

// Form data for creating a new match
export interface CreateMatchData {
  title: string;
  sport: SportType;
  location: string;
  date: string;
  time: string;
  max_players: number;
  captain_name?: string;
  price_per_person?: number;
}
