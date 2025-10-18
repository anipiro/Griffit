-- Create user type enum
CREATE TYPE user_type AS ENUM ('parent', 'child');

-- Create parents table
CREATE TABLE public.parents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create children table
CREATE TABLE public.children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  child_name TEXT NOT NULL,
  parent_id UUID REFERENCES public.parents(id) ON DELETE CASCADE,
  avatar_type TEXT DEFAULT 'penguin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create emotion logs table
CREATE TABLE public.emotion_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  emotion_type TEXT NOT NULL,
  color_choice TEXT,
  intensity INTEGER CHECK (intensity >= 1 AND intensity <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create choices table (for food, activities, etc.)
CREATE TABLE public.choice_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  choice_type TEXT NOT NULL,
  choice_value TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create creative works table
CREATE TABLE public.creative_works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  work_type TEXT NOT NULL,
  work_data JSONB,
  emotion_context TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create progress tracking table
CREATE TABLE public.progress_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES public.children(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.children ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emotion_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.choice_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for parents table
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_parents_updated_at
  BEFORE UPDATE ON public.parents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON public.children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();