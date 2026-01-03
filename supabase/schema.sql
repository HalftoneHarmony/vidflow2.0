-- =============================================
-- VidFlow Manager 2.0 - Database Schema
-- Created by: Agent 2 (Vulcan - The Forge Master)
-- Date: 2026-01-04
-- =============================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 2. PROFILES (Users table linked to auth.users)
-- =============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'USER' CHECK (role IN ('ADMIN', 'EDITOR', 'USER')),
  phone TEXT,
  commission_rate INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. EVENTS (Competition/Event information)
-- =============================================
CREATE TABLE public.events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. PACKAGES (Product packages)
-- =============================================
CREATE TABLE public.packages (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES public.events(id),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  description TEXT,
  composition JSONB NOT NULL DEFAULT '[]',
  specs JSONB,
  is_sold_out BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 5. SHOWCASE_ITEMS (Media for package comparison)
-- =============================================
CREATE TABLE public.showcase_items (
  id SERIAL PRIMARY KEY,
  package_id INTEGER REFERENCES public.packages(id),
  type TEXT CHECK (type IN ('VIDEO', 'IMAGE')),
  media_url TEXT NOT NULL,
  thumbnail_url TEXT,
  is_best_cut BOOLEAN DEFAULT false
);

-- Enable RLS
ALTER TABLE public.showcase_items ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. ORDERS (Payment records)
-- =============================================
CREATE TABLE public.orders (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  event_id INTEGER REFERENCES public.events(id),
  package_id INTEGER REFERENCES public.packages(id),
  payment_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  status TEXT DEFAULT 'PAID' CHECK (status IN ('PENDING', 'PAID', 'REFUNDED')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 7. PIPELINE_CARDS (Work pipeline kanban)
-- =============================================
CREATE TABLE public.pipeline_cards (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES public.orders(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'WAITING' CHECK (stage IN ('WAITING', 'SHOOTING', 'EDITING', 'READY', 'DELIVERED')),
  assignee_id UUID REFERENCES public.profiles(id),
  stage_entered_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pipeline_cards ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 8. DELIVERABLES (Output checklist)
-- =============================================
CREATE TABLE public.deliverables (
  id SERIAL PRIMARY KEY,
  card_id INTEGER REFERENCES public.pipeline_cards(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  external_link_url TEXT,
  link_status TEXT DEFAULT 'UNCHECKED' CHECK (link_status IN ('UNCHECKED', 'VALID', 'INVALID')),
  link_last_checked_at TIMESTAMPTZ,
  is_downloaded BOOLEAN DEFAULT false,
  first_downloaded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.deliverables ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 9. EXPENSES (Cost tracking for profit calculation)
-- =============================================
CREATE TABLE public.expenses (
  id SERIAL PRIMARY KEY,
  event_id INTEGER REFERENCES public.events(id),
  category TEXT NOT NULL CHECK (category IN ('LABOR', 'FOOD', 'TRAVEL', 'EQUIPMENT', 'ETC')),
  description TEXT,
  amount INTEGER NOT NULL,
  is_auto_generated BOOLEAN DEFAULT false,
  related_worker_id UUID REFERENCES public.profiles(id),
  expensed_at DATE DEFAULT CURRENT_DATE
);

-- Enable RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 10. RLS POLICIES
-- =============================================

-- Profiles: Users can read their own profile, admins can read all
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Events: Public read, admin write
CREATE POLICY "Anyone can view active events" ON public.events
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage events" ON public.events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Packages: Public read, admin write
CREATE POLICY "Anyone can view packages" ON public.packages
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage packages" ON public.packages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Showcase Items: Public read
CREATE POLICY "Anyone can view showcase items" ON public.showcase_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage showcase items" ON public.showcase_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Orders: Users see own orders, admins see all
CREATE POLICY "Users can view own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" ON public.orders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- Pipeline Cards: Admins and editors can view/manage
CREATE POLICY "Staff can view pipeline cards" ON public.pipeline_cards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'EDITOR'))
  );

CREATE POLICY "Staff can manage pipeline cards" ON public.pipeline_cards
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'EDITOR'))
  );

-- Deliverables: Users can view own, staff can manage
CREATE POLICY "Users can view own deliverables" ON public.deliverables
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.pipeline_cards pc
      JOIN public.orders o ON pc.order_id = o.id
      WHERE pc.id = deliverables.card_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage deliverables" ON public.deliverables
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'EDITOR'))
  );

-- Expenses: Admins only
CREATE POLICY "Admins can manage expenses" ON public.expenses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- =============================================
-- 11. TRIGGERS (Business Logic Automation)
-- =============================================

-- Auto-update stage_entered_at when stage changes
CREATE OR REPLACE FUNCTION update_stage_entered_at()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    NEW.stage_entered_at = NOW();
  END IF;
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stage_entered_at
  BEFORE UPDATE ON public.pipeline_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_stage_entered_at();

-- =============================================
-- ✅ SCHEMA CREATION COMPLETE
-- =============================================
