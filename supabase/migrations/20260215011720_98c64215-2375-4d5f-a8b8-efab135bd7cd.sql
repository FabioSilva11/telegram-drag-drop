
-- Add platform column to bots table
ALTER TABLE public.bots
ADD COLUMN platform text NOT NULL DEFAULT 'telegram';

-- Add platform column to bot_flows table  
ALTER TABLE public.bot_flows
ADD COLUMN platform text NOT NULL DEFAULT 'telegram';

-- Add index for platform filtering
CREATE INDEX idx_bots_platform ON public.bots (platform);
CREATE INDEX idx_bot_flows_platform ON public.bot_flows (platform);
