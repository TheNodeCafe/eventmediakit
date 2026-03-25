-- Participants
CREATE TABLE participants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES participant_categories(id) ON DELETE RESTRICT,
  email text NOT NULL,
  magic_token text UNIQUE NOT NULL DEFAULT gen_random_uuid()::text,
  token_expires_at timestamptz,
  status text DEFAULT 'invited' CHECK (status IN ('invited', 'link_opened', 'completed')),
  field_values jsonb DEFAULT '{}',
  gdpr_consent_at timestamptz,
  invited_at timestamptz,
  first_accessed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, email)
);

CREATE INDEX idx_participants_event ON participants(event_id);
CREATE INDEX idx_participants_token ON participants(magic_token);

CREATE TRIGGER participants_updated_at
  BEFORE UPDATE ON participants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
