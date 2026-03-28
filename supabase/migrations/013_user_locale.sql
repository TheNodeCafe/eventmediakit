-- Store user language preference
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS locale text DEFAULT 'en';
