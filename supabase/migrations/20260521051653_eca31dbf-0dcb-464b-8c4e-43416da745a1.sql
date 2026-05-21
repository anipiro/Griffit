ALTER TABLE public.children
ADD COLUMN IF NOT EXISTS email TEXT;

UPDATE public.children
SET email = COALESCE(email, '')
WHERE email IS NULL;

ALTER TABLE public.children
ALTER COLUMN email SET NOT NULL;