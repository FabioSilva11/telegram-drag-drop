
-- Add new fields to bots table for multi-platform support
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS group_chat_id text;
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS is_group_bot boolean NOT NULL DEFAULT false;
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id text;
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS whatsapp_access_token text;
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS whatsapp_business_account_id text;
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS discord_bot_token text;
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS discord_application_id text;
ALTER TABLE public.bots ADD COLUMN IF NOT EXISTS discord_guild_id text;
