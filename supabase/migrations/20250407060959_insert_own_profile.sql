-- After auth.users is created -> insert into public.auth
CREATE POLICY "Users can insert their own profile" 
ON public.users
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);