-- Add date_of_birth column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS date_of_birth date;

-- Add age_verified flag to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS age_verified boolean DEFAULT false;

-- Create function to check if user meets minimum age requirement
CREATE OR REPLACE FUNCTION public.meets_age_requirement(_user_id uuid, _minimum_age integer DEFAULT 18)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = _user_id
      AND date_of_birth IS NOT NULL
      AND age_verified = true
      AND (EXTRACT(YEAR FROM age(CURRENT_DATE, date_of_birth)) >= _minimum_age)
  )
$$;

-- Create function to calculate user age
CREATE OR REPLACE FUNCTION public.get_user_age(_user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXTRACT(YEAR FROM age(CURRENT_DATE, date_of_birth))::integer
  FROM public.profiles
  WHERE id = _user_id
    AND date_of_birth IS NOT NULL
$$;

-- Create function to verify user age (for admin use)
CREATE OR REPLACE FUNCTION public.verify_user_age(_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET age_verified = true
  WHERE id = _user_id
    AND date_of_birth IS NOT NULL
    AND (EXTRACT(YEAR FROM age(CURRENT_DATE, date_of_birth)) >= 13);
  
  RETURN FOUND;
END;
$$;

-- Add RLS policy to restrict story creation to verified users (18+)
CREATE POLICY "Age verified users can create stories"
ON public.stories
FOR INSERT
TO authenticated
WITH CHECK (
  public.meets_age_requirement(auth.uid(), 18)
);

-- Add RLS policy to restrict chat room creation to verified users (13+)
CREATE POLICY "Age verified users can create chat rooms"
ON public.chat_rooms
FOR INSERT
TO authenticated
WITH CHECK (
  public.meets_age_requirement(auth.uid(), 13)
);