-- Run this AFTER SUPABASE_SETUP.sql in your Supabase project SQL Editor.
-- Enables near-immediate cross-device updates for Scand Control Tower.
-- This does NOT make tables public. Existing RLS policies still apply.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'scand_workspace'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.scand_workspace;
  END IF;
END $$;
-- Confirm by running:
-- SELECT * FROM pg_publication_tables WHERE pubname='supabase_realtime' AND tablename='scand_workspace';
