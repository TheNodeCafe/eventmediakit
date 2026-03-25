-- Fix: allow users to read their own memberships directly
-- The previous policy used is_org_member() which creates a circular dependency
DROP POLICY IF EXISTS "Members can view org members" ON organization_members;

CREATE POLICY "Users can view their own memberships"
  ON organization_members FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Members can view co-members"
  ON organization_members FOR SELECT
  USING (
    organization_id IN (
      SELECT om.organization_id FROM organization_members om
      WHERE om.user_id = auth.uid()
    )
  );
