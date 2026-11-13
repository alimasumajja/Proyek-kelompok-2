CREATE POLICY "profile_audit_logs_select_notaris"
ON public.profile_audit_logs
FOR SELECT TO authenticated
USING (private.is_notaris());
