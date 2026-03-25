-- Templates
CREATE TABLE templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  format text NOT NULL CHECK (format IN ('square_1x1', 'story_9x16', 'landscape_16x9', 'linkedin_banner')),
  width int NOT NULL,
  height int NOT NULL,
  canvas_json jsonb NOT NULL DEFAULT '{}',
  thumbnail_url text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_templates_event ON templates(event_id);

CREATE TRIGGER templates_updated_at
  BEFORE UPDATE ON templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Join table: templates <-> categories
CREATE TABLE template_categories (
  template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES participant_categories(id) ON DELETE CASCADE,
  PRIMARY KEY (template_id, category_id)
);
