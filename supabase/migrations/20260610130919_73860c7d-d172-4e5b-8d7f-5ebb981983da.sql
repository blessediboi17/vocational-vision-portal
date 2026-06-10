
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- Auto-create profile + first user becomes admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name) VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'sparkles',
  category TEXT NOT NULL DEFAULT 'service',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT ALL ON public.services TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage services" ON public.services FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

INSERT INTO public.services (title, description, icon, category, sort_order) VALUES
('Culinary Classes', 'Hands-on cooking instruction covering Liberian and international cuisine, knife skills, and kitchen management.', 'chef-hat', 'training', 1),
('Baking & Pastry', 'Master breads, pastries, and desserts. From sourdough to French viennoiserie.', 'croissant', 'training', 2),
('Cake Design & Decoration', 'Buttercream, fondant, sculpting, and modern cake artistry for celebrations.', 'cake', 'training', 3),
('Wedding Cakes', 'Custom multi-tier wedding cakes — elegant, traditional, or contemporary.', 'heart', 'service', 4),
('Wedding & Event Planning', 'Full-service planning from concept to execution. Vendors, timeline, decor, and day-of coordination.', 'calendar-heart', 'service', 5),
('Interior & Event Decoration', 'Venue styling, draping, floral, and tablescape design for any occasion.', 'flower', 'service', 6),
('Catering Equipment Rental', 'Chafing dishes, glassware, linens, chairs, and tables — full setup and breakdown.', 'utensils', 'service', 7),
('Corporate & Conference Catering', 'Reliable catering for conferences, seminars, and corporate events.', 'briefcase', 'service', 8);

-- Gallery
CREATE TABLE public.gallery_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  caption TEXT,
  image_url TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gallery_images TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_images TO authenticated;
GRANT ALL ON public.gallery_images TO service_role;
ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read gallery" ON public.gallery_images FOR SELECT USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin manage gallery" ON public.gallery_images FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Contact submissions
CREATE TABLE public.contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  interest TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_submissions TO authenticated;
GRANT ALL ON public.contact_submissions TO service_role;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone submit contact" ON public.contact_submissions FOR INSERT WITH CHECK (
  length(full_name) BETWEEN 1 AND 100
  AND length(email) BETWEEN 3 AND 255
  AND length(message) BETWEEN 1 AND 2000
);
CREATE POLICY "Admin read submissions" ON public.contact_submissions FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update submissions" ON public.contact_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete submissions" ON public.contact_submissions FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Site settings (singleton)
CREATE TABLE public.site_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  admin_email TEXT,
  business_phone TEXT DEFAULT '+231 77 560 5016',
  business_address TEXT DEFAULT 'Kpelle Town Junction, Liberia',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admin update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin insert settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
INSERT INTO public.site_settings (id) VALUES (1);
