/*
  # Add Captain and Price Fields to Matches

  ## Changes
  
  ### Modified Tables
  - `matches` table additions:
    - `captain_name` (text) - Name of the match captain (creator)
    - `price_per_person` (integer) - Optional price per person in currency units (cents)

  ## Notes
  - These fields are optional and non-breaking
  - Captain name is used to display captain badge in players list
  - Price is stored in smallest currency units (cents) to avoid float precision issues
  - Price of 0 means free/not specified
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'captain_name'
  ) THEN
    ALTER TABLE matches ADD COLUMN captain_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'matches' AND column_name = 'price_per_person'
  ) THEN
    ALTER TABLE matches ADD COLUMN price_per_person integer DEFAULT 0;
  END IF;
END $$;
