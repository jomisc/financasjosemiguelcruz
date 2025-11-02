-- Seed Data for Finanças+

-- Insert default profile
INSERT INTO public.profiles (first_name, last_name, currency_preference)
VALUES ('Utilizador', 'Principal', 'EUR')
ON CONFLICT DO NOTHING;

-- Insert default categories
INSERT INTO public.categories (name, icon, is_default) VALUES
  ('Mercearia', '🛒', true),
  ('Transporte', '🚗', true),
  ('Entretenimento', '🎬', true),
  ('Saúde', '🏥', true),
  ('Habitação', '🏠', true),
  ('Compras', '🛍️', true),
  ('Educação', '📚', true),
  ('Outros', '💰', true),
  ('Restauração', '🍽️', true)
ON CONFLICT DO NOTHING;
