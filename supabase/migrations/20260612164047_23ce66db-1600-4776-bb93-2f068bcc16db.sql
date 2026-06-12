
-- ===== Admin access control =====
CREATE TABLE public.admin_settings (
  id INT PRIMARY KEY DEFAULT 1,
  max_admins INT NOT NULL DEFAULT 2 CHECK (max_admins BETWEEN 1 AND 2),
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);
INSERT INTO public.admin_settings (id, max_admins) VALUES (1, 2);

GRANT SELECT ON public.admin_settings TO authenticated;
GRANT ALL ON public.admin_settings TO service_role;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated read admin settings" ON public.admin_settings FOR SELECT TO authenticated USING (true);

ALTER TABLE public.user_roles
  ADD COLUMN is_blocked BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN blocked_by UUID,
  ADD COLUMN blocked_at TIMESTAMPTZ;

-- Updated has_role: blocked admin returns false
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role AND is_blocked = false
  )
$$;

-- Updated handle_new_user trigger: enforce max_admins
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  current_admin_count INT;
  max_allowed INT;
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  SELECT COUNT(*) INTO current_admin_count FROM public.user_roles WHERE role = 'admin' AND is_blocked = false;
  SELECT max_admins INTO max_allowed FROM public.admin_settings WHERE id = 1;
  IF current_admin_count < COALESCE(max_allowed, 2) THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;

-- Ensure the auth trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RPC: block/unblock another admin
CREATE OR REPLACE FUNCTION public.admin_set_blocked(_target_user_id uuid, _blocked boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden: caller is not an active admin';
  END IF;
  IF _target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot block yourself';
  END IF;
  UPDATE public.user_roles
    SET is_blocked = _blocked,
        blocked_by = CASE WHEN _blocked THEN auth.uid() ELSE NULL END,
        blocked_at = CASE WHEN _blocked THEN now() ELSE NULL END
    WHERE user_id = _target_user_id AND role = 'admin';
END;
$$;

-- RPC: set max admins
CREATE OR REPLACE FUNCTION public.admin_set_max(_n int)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF _n NOT IN (1,2) THEN
    RAISE EXCEPTION 'max_admins must be 1 or 2';
  END IF;
  UPDATE public.admin_settings SET max_admins = _n, updated_by = auth.uid(), updated_at = now() WHERE id = 1;
END;
$$;

-- RPC: list admins (auth profile-safe view for admin dashboard)
CREATE OR REPLACE FUNCTION public.admin_list_admins()
RETURNS TABLE(user_id uuid, full_name text, email text, is_blocked boolean, blocked_by uuid, blocked_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY
    SELECT ur.user_id, p.full_name, u.email::text, ur.is_blocked, ur.blocked_by, ur.blocked_at
    FROM public.user_roles ur
    LEFT JOIN public.profiles p ON p.id = ur.user_id
    LEFT JOIN auth.users u ON u.id = ur.user_id
    WHERE ur.role = 'admin'
    ORDER BY ur.is_blocked ASC, p.full_name ASC;
END;
$$;

-- ===== Posts (blog + recipes) =====
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL DEFAULT 'post' CHECK (kind IN ('post','recipe')),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  cover_image_url TEXT,
  body_markdown TEXT,
  ingredients TEXT,
  instructions TEXT,
  prep_time_minutes INT,
  difficulty TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count INT NOT NULL DEFAULT 0,
  author_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX posts_kind_pub_idx ON public.posts (kind, published, published_at DESC);

GRANT SELECT ON public.posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read published" ON public.posts FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins read all" ON public.posts FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert" ON public.posts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update" ON public.posts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete" ON public.posts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Post likes =====
CREATE TABLE public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  liker_fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, liker_fingerprint)
);
CREATE INDEX post_likes_post_idx ON public.post_likes (post_id);

GRANT SELECT, INSERT, DELETE ON public.post_likes TO anon, authenticated;
GRANT ALL ON public.post_likes TO service_role;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone read likes" ON public.post_likes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone like" ON public.post_likes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone unlike own fingerprint" ON public.post_likes FOR DELETE TO anon, authenticated USING (true);
