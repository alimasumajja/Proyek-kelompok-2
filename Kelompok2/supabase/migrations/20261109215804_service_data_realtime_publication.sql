-- Publish operational tables so authenticated clients can refresh their RLS-visible data.
-- Row Level Security remains enabled on every table in this publication.
ALTER PUBLICATION supabase_realtime
  ADD TABLE
    public.services,
    public.service_members,
    public.service_notes,
    public.service_stage_history,
    public.service_activity_logs;
