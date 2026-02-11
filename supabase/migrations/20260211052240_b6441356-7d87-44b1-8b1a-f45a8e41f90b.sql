
-- Fix bots RLS: Drop restrictive policies and create proper permissive ones
-- The "Service can read" policies are unnecessary (service role bypasses RLS)
-- and the RESTRICTIVE type prevents users from seeing their own inactive bots

DROP POLICY IF EXISTS "Service can read active bots" ON public.bots;
DROP POLICY IF EXISTS "Users can view own bots" ON public.bots;
DROP POLICY IF EXISTS "Users can insert own bots" ON public.bots;
DROP POLICY IF EXISTS "Users can update own bots" ON public.bots;
DROP POLICY IF EXISTS "Users can delete own bots" ON public.bots;

CREATE POLICY "Users can view own bots" ON public.bots
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bots" ON public.bots
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bots" ON public.bots
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own bots" ON public.bots
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Fix bot_flows RLS similarly
DROP POLICY IF EXISTS "Service can read active flows" ON public.bot_flows;
DROP POLICY IF EXISTS "Users can view own flows" ON public.bot_flows;
DROP POLICY IF EXISTS "Users can insert own flows" ON public.bot_flows;
DROP POLICY IF EXISTS "Users can update own flows" ON public.bot_flows;
DROP POLICY IF EXISTS "Users can delete own flows" ON public.bot_flows;

CREATE POLICY "Users can view own flows" ON public.bot_flows
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flows" ON public.bot_flows
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flows" ON public.bot_flows
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flows" ON public.bot_flows
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
