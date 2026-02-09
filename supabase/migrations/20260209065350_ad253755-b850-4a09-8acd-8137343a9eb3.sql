
-- Table to store published bot flows
CREATE TABLE public.bot_flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_name TEXT NOT NULL DEFAULT 'Meu Bot',
  nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
  edges JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table to track conversation sessions per Telegram user
CREATE TABLE public.bot_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flow_id UUID NOT NULL REFERENCES public.bot_flows(id) ON DELETE CASCADE,
  telegram_chat_id BIGINT NOT NULL,
  current_node_id TEXT,
  variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(flow_id, telegram_chat_id)
);

-- Enable RLS
ALTER TABLE public.bot_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bot_sessions ENABLE ROW LEVEL SECURITY;

-- Public read for bot_flows (webhook needs to read without auth)
CREATE POLICY "Allow public read of active flows"
  ON public.bot_flows FOR SELECT
  USING (is_active = true);

-- Allow public insert/update for bot_flows (no auth yet)
CREATE POLICY "Allow public insert of flows"
  ON public.bot_flows FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update of flows"
  ON public.bot_flows FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete of flows"
  ON public.bot_flows FOR DELETE
  USING (true);

-- Public access for bot_sessions (webhook needs full access)
CREATE POLICY "Allow public select sessions"
  ON public.bot_sessions FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert sessions"
  ON public.bot_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update sessions"
  ON public.bot_sessions FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete sessions"
  ON public.bot_sessions FOR DELETE
  USING (true);

-- Indexes
CREATE INDEX idx_bot_flows_active ON public.bot_flows(is_active);
CREATE INDEX idx_bot_sessions_chat ON public.bot_sessions(flow_id, telegram_chat_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_bot_flows_updated_at
  BEFORE UPDATE ON public.bot_flows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bot_sessions_updated_at
  BEFORE UPDATE ON public.bot_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
