/*
  # Add Privacy Support to Matches

  1. New Columns
    - `is_private` (boolean, default false) - Determines if match shows in search results

  2. Changes Made
    - Add is_private column to matches table with DEFAULT false

  3. Security & Notes
    - Private matches are hidden from search results but accessible via direct link
    - All existing matches default to public (false)
    - Match creators can only share private matches via direct link/invite code
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'is_private'
  ) THEN
    ALTER TABLE matches ADD COLUMN is_private boolean DEFAULT false;
  END IF;
END $$;