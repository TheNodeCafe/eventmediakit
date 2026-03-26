-- Replace linkedin_banner with post_4x5 in format check
ALTER TABLE templates DROP CONSTRAINT IF EXISTS templates_format_check;
ALTER TABLE templates ADD CONSTRAINT templates_format_check
  CHECK (format IN ('square_1x1', 'story_9x16', 'landscape_16x9', 'post_4x5', 'linkedin_banner'));
