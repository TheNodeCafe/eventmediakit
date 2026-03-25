-- Participant categories
CREATE TABLE participant_categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, slug)
);

CREATE INDEX idx_categories_event ON participant_categories(event_id);
