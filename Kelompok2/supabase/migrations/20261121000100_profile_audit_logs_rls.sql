-- 20261121000100_profile_audit_logs_rls.sql
-- Add RLS policy so only notaris (or admin) can read audit logs.

CREATE POLICY audit_logs_select_notaris
  ON public.profile_audit_logs
  FOR SELECT
  USING (private.is_notaris())
  WITH CHECK (private.is_notaris())
  TO authenticated;

