-- Make slug globally unique (not just per org) since it includes a random suffix
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_organization_id_slug_key;
ALTER TABLE events ADD CONSTRAINT events_slug_unique UNIQUE (slug);
