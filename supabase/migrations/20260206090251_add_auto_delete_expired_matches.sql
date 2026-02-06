/*
  # Auto-Delete Expired Matches

  1. Extensions
    - Enable `pg_cron` for scheduled background jobs

  2. New Functions
    - `delete_expired_matches(cutoff_date DATE)` - Deletes all matches with a date
      strictly before the provided cutoff. Uses SECURITY DEFINER to bypass RLS.
      Participants are removed automatically via ON DELETE CASCADE.

  3. Scheduled Jobs
    - Daily cron job at 3:00 AM UTC deletes matches older than 3 days
      (conservative buffer to avoid premature deletion across timezones)

  4. Notes
    - The primary cleanup mechanism is client-side, which computes the cutoff
      using the user's local timezone with a 1-day grace period
    - The pg_cron job is a safety net for when no user visits the app
*/

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

GRANT USAGE ON SCHEMA cron TO postgres;

CREATE OR REPLACE FUNCTION public.delete_expired_matches(cutoff_date DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM matches WHERE date < cutoff_date;
END;
$$;

SELECT cron.schedule(
  'delete-expired-matches',
  '0 3 * * *',
  $$SELECT public.delete_expired_matches(CURRENT_DATE - 3)$$
);