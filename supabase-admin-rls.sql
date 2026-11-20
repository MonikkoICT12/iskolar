-- ============================================================================
-- Palayan City LGU Scholarship System — Hardened Admin RLS & RBAC Setup
--
-- Security model:
-- 1. Individual scholar records (`public.scholars`, `public.scholar_grades`)
--    are NEVER readable or writable by `anon` or arbitrary signed-up users.
-- 2. Only explicit LGU administrators verified by `public.is_admin()`
--    (`app_metadata.role = 'admin'` OR active row in `public.admin_users`)
--    can SELECT / INSERT / UPDATE / DELETE scholar records.
-- 3. Public landing page (`/`) uses aggregate `SECURITY DEFINER` RPCs
--    (`public_dashboard_stats()`, `public_graduates_by_school()`) only.
--
-- IMPORTANT AFTER RUNNING THIS SCRIPT:
-- Register at least one admin account in `public.admin_users`, e.g.:
--   INSERT INTO public.admin_users (user_id, email)
--   SELECT id, email FROM auth.users WHERE LOWER(email) = LOWER('admin@palayancity.gov.ph')
--   ON CONFLICT (user_id) DO UPDATE SET is_active = true, email = EXCLUDED.email;
-- Also disable "Enable email signup" in Supabase Auth -> Providers -> Email.
-- ============================================================================

BEGIN;

-- 1. Explicit administrator allowlist (inaccessible directly from client API)
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.admin_users FROM public, anon, authenticated;

DROP POLICY IF EXISTS "No direct client access to admin_users" ON public.admin_users;
CREATE POLICY "No direct client access to admin_users"
  ON public.admin_users
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

-- 2. Hardened SECURITY DEFINER admin verification helper
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN
    RETURN false;
  END IF;

  -- Accept either trusted server-managed app_metadata claim or explicit allowlist
  IF COALESCE(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' THEN
    RETURN true;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users a
    WHERE a.user_id = uid
      AND a.is_active = true
  );
END;
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. Lock down legacy public.admins table and enumeration RPCs if present
DO $$
BEGIN
  IF to_regclass('public.admins') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON TABLE public.admins FROM public, anon, authenticated';
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view all admins" ON public.admins';
    EXECUTE 'DROP POLICY IF EXISTS "Deny client access to legacy admins" ON public.admins';
    EXECUTE 'CREATE POLICY "Deny client access to legacy admins" ON public.admins FOR ALL TO public USING (false) WITH CHECK (false)';
  END IF;

  IF to_regprocedure('public.check_school_id_exists(character varying)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.check_school_id_exists(character varying) FROM public, anon, authenticated';
  END IF;

  IF to_regprocedure('public.verify_scholar_credentials(character varying, character varying, character varying)') IS NOT NULL THEN
    EXECUTE 'REVOKE ALL ON FUNCTION public.verify_scholar_credentials(character varying, character varying, character varying) FROM public, anon, authenticated';
  END IF;
END $$;

-- 4. public.scholars: strict admin-only RLS (rejects anon and non-admin JWTs)
ALTER TABLE public.scholars ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.scholars FROM public, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.scholars TO authenticated;

-- Drop legacy or previously permissive policies (idempotent)
DROP POLICY IF EXISTS "Admins have full access to scholars" ON public.scholars;
DROP POLICY IF EXISTS "Scholars can view own record" ON public.scholars;
DROP POLICY IF EXISTS "Anonymous users cannot access scholars" ON public.scholars;
DROP POLICY IF EXISTS "Authenticated admins can select scholars" ON public.scholars;
DROP POLICY IF EXISTS "Authenticated admins can insert scholars" ON public.scholars;
DROP POLICY IF EXISTS "Authenticated admins can update scholars" ON public.scholars;
DROP POLICY IF EXISTS "Authenticated admins can delete scholars" ON public.scholars;

CREATE POLICY "Authenticated admins can select scholars"
  ON public.scholars
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Authenticated admins can insert scholars"
  ON public.scholars
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated admins can update scholars"
  ON public.scholars
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Authenticated admins can delete scholars"
  ON public.scholars
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 5. public.scholar_grades (if present): mirror strict admin-only policies
DO $$
BEGIN
  IF to_regclass('public.scholar_grades') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.scholar_grades ENABLE ROW LEVEL SECURITY';
    EXECUTE 'REVOKE ALL ON TABLE public.scholar_grades FROM public, anon';
    EXECUTE 'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.scholar_grades TO authenticated';

    EXECUTE 'DROP POLICY IF EXISTS "Admins have full access to scholar_grades" ON public.scholar_grades';
    EXECUTE 'DROP POLICY IF EXISTS "Anonymous users cannot access scholar_grades" ON public.scholar_grades';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated admins can select scholar_grades" ON public.scholar_grades';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated admins can insert scholar_grades" ON public.scholar_grades';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated admins can update scholar_grades" ON public.scholar_grades';
    EXECUTE 'DROP POLICY IF EXISTS "Authenticated admins can delete scholar_grades" ON public.scholar_grades';

    EXECUTE 'CREATE POLICY "Authenticated admins can select scholar_grades" ON public.scholar_grades FOR SELECT TO authenticated USING (public.is_admin())';
    EXECUTE 'CREATE POLICY "Authenticated admins can insert scholar_grades" ON public.scholar_grades FOR INSERT TO authenticated WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "Authenticated admins can update scholar_grades" ON public.scholar_grades FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin())';
    EXECUTE 'CREATE POLICY "Authenticated admins can delete scholar_grades" ON public.scholar_grades FOR DELETE TO authenticated USING (public.is_admin())';
  END IF;
END $$;

DO $$
DECLARE
  admin_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO admin_count FROM public.admin_users WHERE is_active = true;
  IF admin_count = 0 THEN
    RAISE NOTICE 'NOTICE: public.admin_users currently has 0 active rows. Insert your admin account from auth.users or set app_metadata.role = "admin" so admins can access the dashboard.';
  END IF;
END $$;

COMMIT;
