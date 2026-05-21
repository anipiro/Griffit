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

ALTER TABLE public.encouragement_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Children can view their encouragement messages" ON public.encouragement_messages;
DROP POLICY IF EXISTS "Parents can create encouragement for linked children" ON public.encouragement_messages;
DROP POLICY IF EXISTS "Parents can view encouragement they sent" ON public.encouragement_messages;
DROP POLICY IF EXISTS "Children can mark encouragement as read" ON public.encouragement_messages;

CREATE POLICY "Children can view their encouragement messages"
  ON public.encouragement_messages
  FOR SELECT
  USING (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

CREATE POLICY "Parents can create encouragement for linked children"
  ON public.encouragement_messages
  FOR INSERT
  WITH CHECK (
    parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid())
    AND child_id IN (SELECT id FROM public.children WHERE parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid()))
  );

CREATE POLICY "Parents can view encouragement they sent"
  ON public.encouragement_messages
  FOR SELECT
  USING (parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid()));

CREATE POLICY "Children can mark encouragement as read"
  ON public.encouragement_messages
  FOR UPDATE
  USING (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()))
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Parents can create linked child progress entries" ON public.progress_entries;
CREATE POLICY "Parents can create linked child progress entries"
  ON public.progress_entries
  FOR INSERT
  WITH CHECK (child_id IN (SELECT id FROM public.children WHERE parent_id IN (SELECT id FROM public.parents WHERE user_id = auth.uid())));