-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE variable_field_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE generations ENABLE ROW LEVEL SECURITY;

-- Helper function: check if user is member of an organization
CREATE OR REPLACE FUNCTION is_org_member(org_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = org_id
    AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- ORGANIZATIONS
-- ============================================
CREATE POLICY "Members can view their organizations"
  ON organizations FOR SELECT
  USING (is_org_member(id));

CREATE POLICY "Members can update their organizations"
  ON organizations FOR UPDATE
  USING (is_org_member(id));

CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- ORGANIZATION MEMBERS
-- ============================================
CREATE POLICY "Members can view org members"
  ON organization_members FOR SELECT
  USING (is_org_member(organization_id));

CREATE POLICY "Authenticated users can insert themselves as members"
  ON organization_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- EVENTS
-- ============================================
CREATE POLICY "Members can view org events"
  ON events FOR SELECT
  USING (is_org_member(organization_id));

CREATE POLICY "Members can create events"
  ON events FOR INSERT
  WITH CHECK (is_org_member(organization_id));

CREATE POLICY "Members can update events"
  ON events FOR UPDATE
  USING (is_org_member(organization_id));

CREATE POLICY "Members can delete events"
  ON events FOR DELETE
  USING (is_org_member(organization_id));

-- ============================================
-- PARTICIPANT CATEGORIES
-- ============================================
CREATE POLICY "Members can manage categories"
  ON participant_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = participant_categories.event_id
      AND is_org_member(events.organization_id)
    )
  );

-- ============================================
-- VARIABLE FIELD DEFINITIONS
-- ============================================
CREATE POLICY "Members can manage variable fields"
  ON variable_field_definitions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = variable_field_definitions.event_id
      AND is_org_member(events.organization_id)
    )
  );

-- ============================================
-- TEMPLATES
-- ============================================
CREATE POLICY "Members can manage templates"
  ON templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = templates.event_id
      AND is_org_member(events.organization_id)
    )
  );

-- ============================================
-- TEMPLATE CATEGORIES
-- ============================================
CREATE POLICY "Members can manage template categories"
  ON template_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM templates
      JOIN events ON events.id = templates.event_id
      WHERE templates.id = template_categories.template_id
      AND is_org_member(events.organization_id)
    )
  );

-- ============================================
-- PARTICIPANTS
-- ============================================
CREATE POLICY "Members can manage participants"
  ON participants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = participants.event_id
      AND is_org_member(events.organization_id)
    )
  );

-- Participant portal: read own data via magic token (using service role for this)

-- ============================================
-- GENERATIONS
-- ============================================
CREATE POLICY "Members can view generations"
  ON generations FOR SELECT
  USING (is_org_member(organization_id));

CREATE POLICY "Service role inserts generations"
  ON generations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role updates generations"
  ON generations FOR UPDATE
  USING (true);
