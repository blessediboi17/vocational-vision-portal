DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
CREATE POLICY "Admins read settings" ON public.site_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
REVOKE SELECT ON public.site_settings FROM anon;
GRANT SELECT ON public.site_settings TO authenticated;