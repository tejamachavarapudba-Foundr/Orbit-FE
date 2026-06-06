-- Foundr: role-based onboarding + role-specific profile tables
-- Run against PostgreSQL (Supabase / NestJS Prisma target)

-- 1. Extend member_role enum with onboarding roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'member_role' AND e.enumlabel = 'advisor') THEN
    ALTER TYPE public.member_role ADD VALUE 'advisor';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'member_role' AND e.enumlabel = 'professional') THEN
    ALTER TYPE public.member_role ADD VALUE 'professional';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'member_role' AND e.enumlabel = 'service_provider') THEN
    ALTER TYPE public.member_role ADD VALUE 'service_provider';
  END IF;
END $$;

-- 2. Shared profile onboarding columns
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_goals text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS profile_completion integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS onboarding_step text;

-- Backfill legacy users as completed when they already have a meaningful profile
UPDATE public.profiles
SET onboarding_completed = true,
    profile_completion = GREATEST(profile_completion, 60)
WHERE onboarding_completed = false
  AND role IS NOT NULL
  AND role::text <> 'other'
  AND NULLIF(TRIM(full_name), '') IS NOT NULL
  AND NULLIF(TRIM(headline), '') IS NOT NULL
  AND NULLIF(TRIM(location), '') IS NOT NULL;

-- 3. Role-specific profile tables (1:1 with profiles)
CREATE TABLE IF NOT EXISTS public.founder_profiles (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  startup_name text NOT NULL DEFAULT '',
  startup_stage text NOT NULL DEFAULT '',
  industry text NOT NULL DEFAULT '',
  pitch text NOT NULL DEFAULT '',
  funding_needed text NOT NULL DEFAULT '',
  team_size text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  goals text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.investor_profiles (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  fund_name text NOT NULL DEFAULT '',
  investment_range text NOT NULL DEFAULT '',
  industries text[] NOT NULL DEFAULT '{}',
  portfolio text NOT NULL DEFAULT '',
  geography text NOT NULL DEFAULT '',
  goals text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.advisor_profiles (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  expertise text[] NOT NULL DEFAULT '{}',
  years_experience text NOT NULL DEFAULT '',
  industries text[] NOT NULL DEFAULT '{}',
  mentorship_areas text[] NOT NULL DEFAULT '{}',
  goals text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.professional_profiles (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  skills text[] NOT NULL DEFAULT '{}',
  experience_level text NOT NULL DEFAULT '',
  portfolio text NOT NULL DEFAULT '',
  resume text NOT NULL DEFAULT '',
  goals text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_provider_profiles (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  company text NOT NULL DEFAULT '',
  services text[] NOT NULL DEFAULT '{}',
  website text NOT NULL DEFAULT '',
  client_industries text[] NOT NULL DEFAULT '{}',
  goals text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 4. RLS (mirror profiles ownership)
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_provider_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users manage own founder profile"
  ON public.founder_profiles FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY IF NOT EXISTS "Users manage own investor profile"
  ON public.investor_profiles FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY IF NOT EXISTS "Users manage own advisor profile"
  ON public.advisor_profiles FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY IF NOT EXISTS "Users manage own professional profile"
  ON public.professional_profiles FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY IF NOT EXISTS "Users manage own service provider profile"
  ON public.service_provider_profiles FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- 5. Public read for discovery (authenticated users)
CREATE POLICY IF NOT EXISTS "Authenticated read founder profiles"
  ON public.founder_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated read investor profiles"
  ON public.investor_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated read advisor profiles"
  ON public.advisor_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated read professional profiles"
  ON public.professional_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY IF NOT EXISTS "Authenticated read service provider profiles"
  ON public.service_provider_profiles FOR SELECT TO authenticated USING (true);
