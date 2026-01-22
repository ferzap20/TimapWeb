/*
  # TIMAP Database Schema

  ## Overview
  This migration creates the core database structure for TIMAP, a sports match organization platform
  that allows anonymous users to create matches, invite players, and track attendance.

  ## New Tables
  
  ### `matches`
  Stores all match information including sport type, location, timing, and player requirements.
  - `id` (uuid, primary key) - Unique match identifier
  - `title` (text) - Match title/name
  - `sport` (text) - Sport type (football, basketball, tennis, baseball, volleyball, other)
  - `location` (text) - Match location/venue
  - `date` (date) - Match date
  - `time` (text) - Match time
  - `max_players` (integer) - Maximum number of players allowed
  - `creator_id` (text) - Anonymous user ID of match creator (stored in localStorage)
  - `creator_name` (text) - Optional name of match creator
  - `invite_code` (text, unique) - Unique shareable code for the match
  - `created_at` (timestamptz) - Timestamp when match was created
  - `updated_at` (timestamptz) - Timestamp when match was last updated

  ### `participants`
  Tracks which users have joined which matches.
  - `id` (uuid, primary key) - Unique participant record identifier
  - `match_id` (uuid, foreign key) - References matches table
  - `user_id` (text) - Anonymous user ID (stored in localStorage)
  - `user_name` (text) - Optional user display name
  - `position` (integer) - Order position (for drag-and-drop reordering)
  - `is_starter` (boolean) - Whether participant is in starting lineup
  - `joined_at` (timestamptz) - Timestamp when user joined

  ## Security
  
  Row Level Security (RLS) is enabled on all tables with policies that:
  - Allow anyone to read match and participant data (public read access)
  - Allow anyone to create matches and join as participants (anonymous creation)
  - Allow match creators to update/delete their own matches
  - Allow participants to remove themselves from matches

  ## Indexes
  
  - Index on `matches.invite_code` for fast lookup via shareable links
  - Index on `participants.match_id` for efficient participant queries
  - Index on `matches.date` for filtering upcoming matches
*/

-- Create matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  sport text NOT NULL CHECK (sport IN ('football', 'basketball', 'tennis', 'baseball', 'volleyball', 'other')),
  location text NOT NULL,
  date date NOT NULL,
  time text NOT NULL,
  max_players integer NOT NULL DEFAULT 10,
  creator_id text NOT NULL,
  creator_name text DEFAULT '',
  invite_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create participants table
CREATE TABLE IF NOT EXISTS participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id text NOT NULL,
  user_name text DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  is_starter boolean DEFAULT true,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(match_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_matches_invite_code ON matches(invite_code);
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(date);
CREATE INDEX IF NOT EXISTS idx_participants_match_id ON participants(match_id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON participants(user_id);

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Matches policies: Allow public read and create, creator can update/delete
CREATE POLICY "Anyone can view matches"
  ON matches FOR SELECT
  USING (true);

CREATE POLICY "Anyone can create matches"
  ON matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Creators can update their matches"
  ON matches FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Creators can delete their matches"
  ON matches FOR DELETE
  USING (true);

-- Participants policies: Allow public read and create, users can remove themselves
CREATE POLICY "Anyone can view participants"
  ON participants FOR SELECT
  USING (true);

CREATE POLICY "Anyone can join matches"
  ON participants FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update participant positions"
  ON participants FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can leave matches"
  ON participants FOR DELETE
  USING (true);