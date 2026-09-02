-- profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- scans
CREATE TABLE public.scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  case_id TEXT,
  evidence_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  media_kind TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  sha256 TEXT NOT NULL,
  storage_path TEXT,
  status TEXT NOT NULL DEFAULT 'queued',
  stage TEXT,
  error_message TEXT,
  verdict TEXT,
  confidence NUMERIC,
  risk_level TEXT,
  is_demo BOOLEAN NOT NULL DEFAULT false,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE INDEX scans_user_created_idx ON public.scans (user_id, created_at DESC);
CREATE INDEX scans_sha_idx ON public.scans (user_id, sha256);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scans TO authenticated;
GRANT ALL ON public.scans TO service_role;
ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own scans" ON public.scans FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- generic child tables
CREATE TABLE public.detection_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  provider TEXT NOT NULL,
  media_type TEXT,
  status TEXT NOT NULL DEFAULT 'ok',
  ai_generated_score NUMERIC,
  not_ai_generated_score NUMERIC,
  deepfake_score NUMERIC,
  source_name TEXT,
  source_confidence NUMERIC,
  message TEXT,
  raw_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.forensic_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  media_kind TEXT,
  metadata JSONB,
  indicators JSONB,
  technical JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.provenance_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  provider TEXT NOT NULL,
  state TEXT NOT NULL,
  issuer TEXT,
  creator TEXT,
  creation_tool TEXT,
  creation_time TEXT,
  ai_indicated BOOLEAN,
  history JSONB,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.media_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  track TEXT NOT NULL,
  start_seconds NUMERIC NOT NULL,
  end_seconds NUMERIC,
  label TEXT NOT NULL,
  confidence NUMERIC,
  detector TEXT,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  category TEXT NOT NULL,
  status TEXT NOT NULL,
  title TEXT NOT NULL,
  explanation TEXT,
  certainty TEXT NOT NULL DEFAULT 'inferred',
  confidence NUMERIC,
  source TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.chain_of_custody_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  event TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ok',
  provider TEXT,
  detail TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  format TEXT NOT NULL DEFAULT 'json',
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.media_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scan_id UUID NOT NULL REFERENCES public.scans ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  kind TEXT NOT NULL,
  algorithm TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.detection_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.forensic_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.provenance_results TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_segments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_items TO authenticated;
GRANT SELECT, INSERT ON public.chain_of_custody_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.media_fingerprints TO authenticated;
GRANT ALL ON public.detection_results, public.forensic_results, public.provenance_results,
  public.media_segments, public.evidence_items, public.chain_of_custody_events,
  public.reports, public.media_fingerprints TO service_role;

ALTER TABLE public.detection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forensic_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provenance_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chain_of_custody_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own detection_results" ON public.detection_results FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own forensic_results" ON public.forensic_results FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own provenance_results" ON public.provenance_results FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own media_segments" ON public.media_segments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own evidence_items" ON public.evidence_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "read own custody events" ON public.chain_of_custody_events FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "append own custody events" ON public.chain_of_custody_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own reports" ON public.reports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own fingerprints" ON public.media_fingerprints FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- storage policies: files stored under <user_id>/...
CREATE POLICY "read own evidence" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "upload own evidence" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "delete own evidence" ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'evidence' AND auth.uid()::text = (storage.foldername(name))[1]);