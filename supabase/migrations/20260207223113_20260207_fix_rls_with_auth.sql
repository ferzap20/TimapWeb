/*
  # Fix RLS Policies with Proper Authentication

  1. Changes
    - Drop insecure RLS policies that only check IS NOT NULL
    - Create secure policies using auth.uid() for proper authorization
    - Update policies for matches table (UPDATE and DELETE operations)
    - Keep existing SELECT and INSERT policies unchanged
    - Ensure creator_id column uses authenticated user IDs

  2. Security
    - Policies now verify that the authenticated user is the actual creator
    - Uses auth.uid() to get the authenticated user's ID from JWT
    - Prevents unauthorized users from modifying or deleting others' matches
*/

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'matches'
    AND policyname = 'Creators can update their matches'
  ) THEN
    DROP POLICY "Creators can update their matches" ON matches;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'matches'
    AND policyname = 'Creators can delete their matches'
  ) THEN
    DROP POLICY "Creators can delete their matches" ON matches;
  END IF;
END $$;

CREATE POLICY "Creators can update their matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = creator_id)
  WITH CHECK (auth.uid()::text = creator_id);

CREATE POLICY "Creators can delete their matches"
  ON matches FOR DELETE
  TO authenticated
  USING (auth.uid()::text = creator_id);
