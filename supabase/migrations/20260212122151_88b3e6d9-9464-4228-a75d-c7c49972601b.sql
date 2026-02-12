
-- Table to log every bot message for analytics and daily limit enforcement
CREATE TABLE public.bot_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bot_id UUID NOT NULL,
  flow_id UUID NOT NULL,
  telegram_chat_id BIGINT NOT NULL,
  direction TEXT NOT NULL DEFAULT 'incoming', -- 'incoming' or 'outgoing'
  message_text TEXT,
  node_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for daily message count queries (plan limits)
CREATE INDEX idx_bot_messages_bot_date ON public.bot_messages (bot_id, created_at);
-- Index for analytics queries
CREATE INDEX idx_bot_messages_flow ON public.bot_messages (flow_id, created_at);

-- Enable RLS
ALTER TABLE public.bot_messages ENABLE ROW LEVEL SECURITY;

-- Service role (edge functions) can do anything via service key
-- Authenticated users can read their own bot messages for analytics
CREATE POLICY "Users can view own bot messages"
  ON public.bot_messages FOR SELECT
  USING (
    bot_id IN (SELECT id FROM public.bots WHERE user_id = auth.uid())
  );

-- Public insert for edge function (uses service role key)
CREATE POLICY "Service can insert messages"
  ON public.bot_messages FOR INSERT
  WITH CHECK (true);
