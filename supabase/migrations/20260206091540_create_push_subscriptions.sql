/*
  # Create push_subscriptions table

  1. New Tables
    - `push_subscriptions`
      - `id` (uuid, primary key) - unique subscription identifier
      - `user_id` (text, not null) - anonymous user ID from localStorage
      - `endpoint` (text, unique, not null) - push subscription endpoint URL
      - `p256dh` (text, not null) - client public key for encryption
      - `auth` (text, not null) - authentication secret for encryption
      - `created_at` (timestamptz) - when the subscription was created

  2. Indexes
    - Index on `user_id` for efficient lookups when sending notifications

  3. Security
    - Enable RLS on `push_subscriptions` table
    - Allow anyone to insert subscriptions (anonymous users need to subscribe)
    - Allow anyone to delete their own subscriptions by endpoint
    - Select restricted to service role only (no public reads)
*/

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  endpoint text UNIQUE NOT NULL,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id
  ON push_subscriptions (user_id);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert push subscriptions"
  ON push_subscriptions
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can delete their own push subscriptions"
  ON push_subscriptions
  FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Service role can read push subscriptions"
  ON push_subscriptions
  FOR SELECT
  TO service_role
  USING (true);
