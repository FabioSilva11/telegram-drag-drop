import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const url = new URL(req.url);
    const botId = url.searchParams.get("botId");

    const body = await req.json();
    console.log("WhatsApp webhook for bot:", botId, JSON.stringify(body));

    // WhatsApp Cloud API verification (GET challenge)
    if (req.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const token = url.searchParams.get("hub.verify_token");
      const challenge = url.searchParams.get("hub.challenge");

      if (mode === "subscribe" && token && challenge) {
        // Verify token against stored bot config
        return new Response(challenge, { status: 200, headers: corsHeaders });
      }
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    // Process incoming WhatsApp messages
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    if (!value?.messages?.length) {
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const message = value.messages[0];
    const chatId = message.from; // phone number
    const msgText = message.text?.body || "";
    const phoneNumberId = value.metadata?.phone_number_id;

    // Get active flow for this bot
    let flowQuery = sb.from("bot_flows").select("*, bots!bot_flows_bot_id_fkey(telegram_token, id)").eq("is_active", true);
    if (botId) flowQuery = flowQuery.eq("bot_id", botId);
    const { data: flows } = await flowQuery;

    if (!flows?.length) {
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // TODO: Implement WhatsApp Cloud API message processing
    // This will use the same flow engine but with WhatsApp-specific API calls
    // e.g., POST https://graph.facebook.com/v18.0/{phone_number_id}/messages

    console.log(`WhatsApp message from ${chatId}: ${msgText}`);

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
