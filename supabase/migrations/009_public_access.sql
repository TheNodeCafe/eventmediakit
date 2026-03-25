-- Add password protection to events (null = public, set = password required)
ALTER TABLE events ADD COLUMN access_password text;

-- Remove magic link fields from participants (no longer needed)
ALTER TABLE participants DROP COLUMN IF EXISTS magic_token;
ALTER TABLE participants DROP COLUMN IF EXISTS token_expires_at;
ALTER TABLE participants DROP COLUMN IF EXISTS invited_at;
ALTER TABLE participants DROP COLUMN IF EXISTS first_accessed_at;

-- Participants are now anonymous visitors, tracked by email per event
-- status simplified: 'active' or 'completed'
ALTER TABLE participants DROP CONSTRAINT IF EXISTS participants_status_check;
ALTER TABLE participants ALTER COLUMN status SET DEFAULT 'active';
ALTER TABLE participants ADD CONSTRAINT participants_status_check
  CHECK (status IN ('active', 'completed'));

-- Drop the unique constraint on magic_token (column removed)
-- Allow public read on events by slug (for public event pages)
CREATE POLICY "Public can view active events by slug"
  ON events FOR SELECT
  USING (status = 'active');

-- Make participant_id nullable on generations (anonymous visitors)
ALTER TABLE generations ALTER COLUMN participant_id DROP NOT NULL;
