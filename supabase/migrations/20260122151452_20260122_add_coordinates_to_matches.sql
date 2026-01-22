/*
  # Add Coordinates Support to Matches

  1. New Columns
    - `lat` (decimal, nullable) - Latitude extracted from location or maps URL
    - `lng` (decimal, nullable) - Longitude extracted from location or maps URL

  2. Changes Made
    - Add latitude column to matches table with DEFAULT NULL
    - Add longitude column to matches table with DEFAULT NULL

  3. Notes
    - Coordinates are optional and support both plain text locations and extracted coordinates
    - When a location contains a maps URL, coordinates are parsed and stored
    - Existing matches without coordinates will have lat/lng as NULL
    - Distance filtering only applies to matches with both lat and lng populated
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'lat'
  ) THEN
    ALTER TABLE matches ADD COLUMN lat decimal(10, 8);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'lng'
  ) THEN
    ALTER TABLE matches ADD COLUMN lng decimal(11, 8);
  END IF;
END $$;