-- Fix security warning: set search_path for create_default_categories function
DROP FUNCTION IF EXISTS public.create_default_categories(UUID);

CREATE OR REPLACE FUNCTION public.create_default_categories(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, icon, is_default) VALUES
    (_user_id, 'Alimentação', '🍔', true),
    (_user_id, 'Transporte', '🚗', true),
    (_user_id, 'Entretenimento', '🎬', true),
    (_user_id, 'Saúde', '🏥', true),
    (_user_id, 'Habitação', '🏠', true),
    (_user_id, 'Compras', '🛍️', true),
    (_user_id, 'Educação', '📚', true),
    (_user_id, 'Outros', '💰', true);
END;
$$;