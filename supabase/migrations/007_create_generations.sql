-- Generations (rendered visual downloads)
CREATE TABLE generations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_id uuid NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  file_url text,
  file_format text DEFAULT 'png' CHECK (file_format IN ('png', 'jpeg')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX idx_generations_participant ON generations(participant_id);
CREATE INDEX idx_generations_org ON generations(organization_id);
CREATE INDEX idx_generations_status ON generations(status);
