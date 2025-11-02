-- Update categories: Rename "Alimentação" to "Mercearia" and add "Restauração"

-- Step 1: Update existing "Alimentação" categories to "Mercearia" with new icon
UPDATE public.categories
SET
  name = 'Mercearia',
  icon = '🛒'
WHERE
  name = 'Alimentação'
  AND is_default = true;

-- Step 2: Add new "Restauração" category for all existing users who have default categories
INSERT INTO public.categories (user_id, name, icon, is_default)
SELECT DISTINCT
  user_id,
  'Restauração',
  '🍽️',
  true
FROM public.categories
WHERE is_default = true
  AND NOT EXISTS (
    SELECT 1
    FROM public.categories c2
    WHERE c2.user_id = categories.user_id
      AND c2.name = 'Restauração'
  );

-- Step 3: Update the create_default_categories function for new users
DROP FUNCTION IF EXISTS public.create_default_categories(UUID);

CREATE OR REPLACE FUNCTION public.create_default_categories(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, icon, is_default) VALUES
    (_user_id, 'Mercearia', '🛒', true),
    (_user_id, 'Transporte', '🚗', true),
    (_user_id, 'Entretenimento', '🎬', true),
    (_user_id, 'Saúde', '🏥', true),
    (_user_id, 'Habitação', '🏠', true),
    (_user_id, 'Compras', '🛍️', true),
    (_user_id, 'Educação', '📚', true),
    (_user_id, 'Outros', '💰', true),
    (_user_id, 'Restauração', '🍽️', true);
END;
$$;
