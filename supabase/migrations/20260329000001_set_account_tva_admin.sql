-- Set Account@tva.com as admin
-- User ID: bfb57247-e96f-47ea-8c30-793b76d52cf7

DO $$
DECLARE
  v_user_id UUID := 'bfb57247-e96f-47ea-8c30-793b76d52cf7';
BEGIN
  -- Update if exists
  UPDATE public.user_roles 
  SET role = 'admin' 
  WHERE user_id = v_user_id;
  
  -- Insert if not exists
  IF NOT FOUND THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'admin');
  END IF;
END $$;
