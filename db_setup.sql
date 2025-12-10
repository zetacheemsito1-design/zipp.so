-- ============================================
-- ZIPP.SO DATABASE SETUP v3 (with ZYP Pages)
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist (CASCADE handles dependencies)
DROP TABLE IF EXISTS zyp_blocks CASCADE;
DROP TABLE IF EXISTS zyp_pages CASCADE;
DROP TABLE IF EXISTS link_clicks CASCADE;
DROP TABLE IF EXISTS links CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  avatar_url TEXT,
  links_count INT DEFAULT 0,
  max_links INT DEFAULT 10,
  max_zyp_blocks INT DEFAULT 5,  -- ZYP blocks limit
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public can view profiles by username" ON profiles FOR SELECT USING (username IS NOT NULL);

-- ============================================
-- LINKS TABLE
-- ============================================
CREATE TABLE links (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  destination_url TEXT NOT NULL,
  platform TEXT NOT NULL,
  action_type TEXT,
  target_url TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  clicks INT DEFAULT 0,
  conversions INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update links_count on profile
CREATE OR REPLACE FUNCTION update_links_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET links_count = links_count + 1 WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET links_count = links_count - 1 WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_link_change
  AFTER INSERT OR DELETE ON links
  FOR EACH ROW EXECUTE FUNCTION update_links_count();

-- Links RLS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active links" ON links FOR SELECT USING (is_active = true);
CREATE POLICY "Owners can insert links" ON links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update links" ON links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete links" ON links FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- LINK CLICKS TABLE
-- ============================================
CREATE TABLE link_clicks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  link_id UUID REFERENCES links ON DELETE CASCADE,
  converted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update click count
CREATE OR REPLACE FUNCTION update_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE links SET clicks = clicks + 1 WHERE id = NEW.link_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_click_insert
  AFTER INSERT ON link_clicks
  FOR EACH ROW EXECUTE FUNCTION update_click_count();

-- Update conversion count
CREATE OR REPLACE FUNCTION update_conversion_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.converted = true AND (OLD.converted = false OR OLD.converted IS NULL) THEN
    UPDATE links SET conversions = conversions + 1 WHERE id = NEW.link_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_conversion
  AFTER UPDATE ON link_clicks
  FOR EACH ROW EXECUTE FUNCTION update_conversion_count();

-- Link clicks RLS
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert clicks" ON link_clicks FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update clicks" ON link_clicks FOR UPDATE USING (true);
CREATE POLICY "Owners can view clicks" ON link_clicks FOR SELECT 
  USING (EXISTS (SELECT 1 FROM links WHERE links.id = link_clicks.link_id AND links.user_id = auth.uid()));

-- ============================================
-- ZYP PAGES TABLE
-- ============================================
CREATE TABLE zyp_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE UNIQUE,  -- One page per user
  username TEXT UNIQUE NOT NULL,  -- URL slug: /u/username
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  
  -- Theme settings
  theme TEXT DEFAULT 'default',  -- default, dark, midnight, sunset, forest
  bg_type TEXT DEFAULT 'solid',  -- solid, gradient, image
  bg_value TEXT DEFAULT '#ffffff',
  accent_color TEXT DEFAULT '#9bdbc1',
  text_color TEXT DEFAULT '#000000',
  font_family TEXT DEFAULT 'Inter',
  button_style TEXT DEFAULT 'rounded',  -- rounded, pill, square, outline
  custom_css TEXT,
  
  -- Social links as JSON array
  social_links JSONB DEFAULT '[]',
  
  -- Stats
  views INT DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ZYP Pages RLS
ALTER TABLE zyp_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view published pages" ON zyp_pages FOR SELECT USING (is_published = true);
CREATE POLICY "Owners can view own page" ON zyp_pages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Owners can insert own page" ON zyp_pages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owners can update own page" ON zyp_pages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Owners can delete own page" ON zyp_pages FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- ZYP BLOCKS TABLE
-- ============================================
CREATE TABLE zyp_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  page_id UUID REFERENCES zyp_pages ON DELETE CASCADE,
  type TEXT NOT NULL,  -- link, social, embed, image, text, divider
  title TEXT,
  url TEXT,
  icon TEXT,
  content JSONB DEFAULT '{}',  -- Flexible content based on type
  position INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ZYP Blocks RLS
ALTER TABLE zyp_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view visible blocks" ON zyp_blocks FOR SELECT 
  USING (is_visible = true AND EXISTS (SELECT 1 FROM zyp_pages WHERE zyp_pages.id = zyp_blocks.page_id AND zyp_pages.is_published = true));
CREATE POLICY "Owners can view own blocks" ON zyp_blocks FOR SELECT 
  USING (EXISTS (SELECT 1 FROM zyp_pages WHERE zyp_pages.id = zyp_blocks.page_id AND zyp_pages.user_id = auth.uid()));
CREATE POLICY "Owners can insert blocks" ON zyp_blocks FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM zyp_pages WHERE zyp_pages.id = zyp_blocks.page_id AND zyp_pages.user_id = auth.uid()));
CREATE POLICY "Owners can update blocks" ON zyp_blocks FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM zyp_pages WHERE zyp_pages.id = zyp_blocks.page_id AND zyp_pages.user_id = auth.uid()));
CREATE POLICY "Owners can delete blocks" ON zyp_blocks FOR DELETE 
  USING (EXISTS (SELECT 1 FROM zyp_pages WHERE zyp_pages.id = zyp_blocks.page_id AND zyp_pages.user_id = auth.uid()));

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_links_user_id ON links(user_id);
CREATE INDEX idx_links_active ON links(is_active);
CREATE INDEX idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX idx_link_clicks_created_at ON link_clicks(created_at);
CREATE INDEX idx_zyp_pages_username ON zyp_pages(username);
CREATE INDEX idx_zyp_pages_user_id ON zyp_pages(user_id);
CREATE INDEX idx_zyp_blocks_page_id ON zyp_blocks(page_id);
CREATE INDEX idx_zyp_blocks_position ON zyp_blocks(position);
