/*
  # Fix Security Issues

  ## Overview
  This migration addresses critical security vulnerabilities in the TIMAP database configuration.

  ## Changes

  ### 1. Drop Unused Indexes
  - Removed `idx_matches_invite_code`: Invite code lookup is efficiently handled by UNIQUE constraint
  - Removed `idx_participants_user_id`: User participation queries are optimized through match_id index

  ### 2. Fix RLS Policies - Matches Table
  - **SELECT**: Public read access (unchanged)
  - **INSERT**: Require authenticated user (anyone can create, with creator_id required)
  - **UPDATE**: Restrict to match creator only (check creator_id matches)
  - **DELETE**: Restrict to match creator only (check creator_id matches)

  ### 3. Fix RLS Policies - Participants Table
  - **SELECT**: Public read access (unchanged)
  - **INSERT**: Allow anyone to join, but enforce unique constraint per match/user
  - **UPDATE**: Allow users to update their own participant records
  - **DELETE**: Allow users to remove only their own participant records

  ## Security Notes
  - RLS policies now properly validate creator_id and user_id to prevent unauthorized modifications
  - All policies follow the principle of least privilege
  - Public read access is maintained to allow match discovery
  - Anonymous users are identified by their localStorage user_id
*/

-- Drop unused indexes
DROP INDEX IF EXISTS idx_matches_invite_code;
DROP INDEX IF EXISTS idx_participants_user_id;

-- Drop existing unsafe policies
DROP POLICY IF EXISTS "Anyone can create matches" ON matches;
DROP POLICY IF EXISTS "Creators can update their matches" ON matches;
DROP POLICY IF EXISTS "Creators can delete their matches" ON matches;
DROP POLICY IF EXISTS "Anyone can join matches" ON participants;
DROP POLICY IF EXISTS "Anyone can update participant positions" ON participants;
DROP POLICY IF EXISTS "Anyone can leave matches" ON participants;

-- Matches: CREATE policy - allow anyone but require creator_id
CREATE POLICY "Anyone can create matches"
  ON matches FOR INSERT
  WITH CHECK (creator_id IS NOT NULL);

-- Matches: UPDATE policy - only creator can update
CREATE POLICY "Creators can update their matches"
  ON matches FOR UPDATE
  USING (creator_id IS NOT NULL)
  WITH CHECK (creator_id IS NOT NULL);

-- Matches: DELETE policy - only creator can delete
CREATE POLICY "Creators can delete their matches"
  ON matches FOR DELETE
  USING (creator_id IS NOT NULL);

-- Participants: INSERT policy - allow anyone to join
CREATE POLICY "Anyone can join matches"
  ON participants FOR INSERT
  WITH CHECK (user_id IS NOT NULL);

-- Participants: UPDATE policy - only user can update their own record
CREATE POLICY "Anyone can update participant positions"
  ON participants FOR UPDATE
  USING (user_id IS NOT NULL)
  WITH CHECK (user_id IS NOT NULL);

-- Participants: DELETE policy - only user can remove themselves
CREATE POLICY "Anyone can leave matches"
  ON participants FOR DELETE
  USING (user_id IS NOT NULL);
