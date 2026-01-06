-- Fix Showcase Items RLS Policy
-- Use security definer function to avoid recursion and ensure admin access

-- 1. Ensure check_is_admin exists (Security Definer)
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop existing policies on showcase_items to be clean
DROP POLICY IF EXISTS "Anyone can view showcase items" ON public.showcase_items;
DROP POLICY IF EXISTS "Admins can manage showcase items" ON public.showcase_items;

-- 3. Re-create policies

-- READ: Public access
CREATE POLICY "Anyone can view showcase items" ON public.showcase_items
  FOR SELECT USING (true);

-- WRITE: Admin only (using non-recursive function)
CREATE POLICY "Admins can manage showcase items" ON public.showcase_items
  FOR ALL
  TO authenticated
  USING (public.check_is_admin());

-- 4. Enable RLS on showcase_items (just in case)
ALTER TABLE public.showcase_items ENABLE ROW LEVEL SECURITY;
