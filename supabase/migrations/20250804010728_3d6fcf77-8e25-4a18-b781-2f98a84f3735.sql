-- Ensure trigger function exists and is working properly
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  -- Insert profile with proper error handling
  INSERT INTO public.profiles (user_id, name, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NOW(),
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    name = COALESCE(NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    email = NEW.email,
    updated_at = NOW();
  
  -- Assign default role with conflict handling
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'analista')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger to ensure it's active
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();