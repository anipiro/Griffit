-- Create user type enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'user_type' AND n.nspname = 'public'
  ) THEN
    CREATE TYPE user_type AS ENUM ('parent', 'child');
  END IF;
END $$;

-- Create parents table
CREATE TABLE IF NOT EXISTS public.parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create children table
CREATE TABLE IF NOT EXISTS public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT NOT NULL,
  child_name TEXT NOT NULL,
  parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE,
  avatar_type TEXT DEFAULT 'penguin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create emotion logs table
CREATE TABLE IF NOT EXISTS public.emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  emotion_type TEXT NOT NULL,
  color_choice TEXT,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create choices table (for food, activities, etc.)
CREATE TABLE IF NOT EXISTS public.choice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  choice_type TEXT NOT NULL,
  choice_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create creative works table
CREATE TABLE IF NOT EXISTS public.creative_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  work_type TEXT NOT NULL,
  work_data JSONB,
  emotion_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create progress tracking table
CREATE TABLE IF NOT EXISTS public.progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create encouragement messages table
CREATE TABLE IF NOT EXISTS public.encouragement_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Ensure child profiles store an email for dashboard linking.
ALTER TABLE public.children
  ADD COLUMN IF NOT EXISTS email TEXT;

UPDATE public.children
SET email = COALESCE(email, '')
WHERE email IS NULL;

ALTER TABLE public.children
  ALTER COLUMN email SET NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encouragement_messages ENABLE ROW LEVEL SECURITY;

-- Allow API access for both public and signed-in users.
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO anon, authenticated;

-- Secure linking helpers so users can connect parent/child profiles by email after login.
CREATE OR REPLACE FUNCTION public.link_child_to_parent_by_email(target_child_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  parent_row public.parents%ROWTYPE;
  updated_rows integer;
BEGIN
  SELECT * INTO parent_row
  FROM public.parents
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only parents can link children';
  END IF;

  UPDATE public.children
  SET parent_id = parent_row.id
  WHERE lower(email) = lower(target_child_email);

  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  IF updated_rows = 0 THEN
    RAISE EXCEPTION 'Child email not found';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.link_parent_to_child_by_email(target_parent_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  child_row public.children%ROWTYPE;
  parent_row public.parents%ROWTYPE;
BEGIN
  SELECT * INTO child_row
  FROM public.children
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Only children can link parents';
  END IF;

  SELECT * INTO parent_row
  FROM public.parents
  WHERE lower(email) = lower(target_parent_email)
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Parent email not found';
  END IF;

  UPDATE public.children
  SET parent_id = parent_row.id
  WHERE id = child_row.id;
END;
$$;

-- RLS Policies for parents table
DROP POLICY IF EXISTS "Parents can view their own profile" ON public.parents;
DROP POLICY IF EXISTS "Parents can insert their own profile" ON public.parents;
DROP POLICY IF EXISTS "Parents can update their own profile" ON public.parents;
CREATE POLICY "Parents can view their own profile"
  ON public.parents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can insert their own profile"
  ON public.parents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Parents can update their own profile"
  ON public.parents FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for children table
DROP POLICY IF EXISTS "Children can view their own profile" ON public.children;
DROP POLICY IF EXISTS "Parents can view their children" ON public.children;
DROP POLICY IF EXISTS "Children can insert their own profile" ON public.children;
DROP POLICY IF EXISTS "Children can update their own profile" ON public.children;
CREATE POLICY "Children can view their own profile"
  ON public.children FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Parents can view their children"
  ON public.children FOR SELECT
  USING (parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid()));

CREATE POLICY "Children can insert their own profile"
  ON public.children FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Children can update their own profile"
  ON public.children FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for emotion logs
DROP POLICY IF EXISTS "Children can create emotion logs" ON public.emotion_logs;
DROP POLICY IF EXISTS "Children can view their own emotion logs" ON public.emotion_logs;
DROP POLICY IF EXISTS "Parents can view their children's emotion logs" ON public.emotion_logs;
CREATE POLICY "Children can create emotion logs"
  ON public.emotion_logs FOR INSERT
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

CREATE POLICY "Children can view their own emotion logs"
  ON public.emotion_logs FOR SELECT
  USING (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

CREATE POLICY "Parents can view their children's emotion logs"
  ON public.emotion_logs FOR SELECT
  USING (child_id IN (
    SELECT id FROM public.children 
    WHERE parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid())
  ));

-- RLS Policies for choice logs
DROP POLICY IF EXISTS "Children can create choice logs" ON public.choice_logs;
DROP POLICY IF EXISTS "Children can view their own choice logs" ON public.choice_logs;
DROP POLICY IF EXISTS "Parents can view their children's choice logs" ON public.choice_logs;
CREATE POLICY "Children can create choice logs"
  ON public.choice_logs FOR INSERT
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

CREATE POLICY "Children can view their own choice logs"
  ON public.choice_logs FOR SELECT
  USING (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

CREATE POLICY "Parents can view their children's choice logs"
  ON public.choice_logs FOR SELECT
  USING (child_id IN (
    SELECT id FROM public.children 
    WHERE parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid())
  ));

-- RLS Policies for creative works
DROP POLICY IF EXISTS "Children can create creative works" ON public.creative_works;
DROP POLICY IF EXISTS "Children can view their own creative works" ON public.creative_works;
DROP POLICY IF EXISTS "Parents can view their children's creative works" ON public.creative_works;
CREATE POLICY "Children can create creative works"
  ON public.creative_works FOR INSERT
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

CREATE POLICY "Children can view their own creative works"
  ON public.creative_works FOR SELECT
  USING (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

CREATE POLICY "Parents can view their children's creative works"
  ON public.creative_works FOR SELECT
  USING (child_id IN (
    SELECT id FROM public.children 
    WHERE parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid())
  ));

-- RLS Policies for progress entries
DROP POLICY IF EXISTS "Children can create progress entries" ON public.progress_entries;
DROP POLICY IF EXISTS "Children can view their own progress" ON public.progress_entries;
DROP POLICY IF EXISTS "Parents can view their children's progress" ON public.progress_entries;
CREATE POLICY "Children can create progress entries"
  ON public.progress_entries FOR INSERT
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

CREATE POLICY "Children can view their own progress"
  ON public.progress_entries FOR SELECT
  USING (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

CREATE POLICY "Parents can view their children's progress"
  ON public.progress_entries FOR SELECT
  USING (child_id IN (
    SELECT id FROM public.children 
    WHERE parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid())
  ));

-- RLS Policies for encouragement messages
DROP POLICY IF EXISTS "Parents can create encouragement messages" ON public.encouragement_messages;
DROP POLICY IF EXISTS "Children can view encouragement messages" ON public.encouragement_messages;
DROP POLICY IF EXISTS "Children can update own encouragement messages" ON public.encouragement_messages;
CREATE POLICY "Parents can create encouragement messages"
  ON public.encouragement_messages FOR INSERT
  WITH CHECK (
    parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid())
    AND child_id IN (
      SELECT c.id
      FROM public.children c
      JOIN public.parents p ON p.id = c.parent_id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Children can view encouragement messages"
  ON public.encouragement_messages FOR SELECT
  USING (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

CREATE POLICY "Children can update own encouragement messages"
  ON public.encouragement_messages FOR UPDATE
  USING (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()))
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_parents_updated_at ON public.parents;
DROP TRIGGER IF EXISTS update_children_updated_at ON public.children;
CREATE TRIGGER update_parents_updated_at
  BEFORE UPDATE ON public.parents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();