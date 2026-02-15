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
    console.log("Discord webhook for bot:", botId, JSON.stringify(body));

    // Discord interaction verification
    // Discord sends interactions via POST with type field
    const interactionType = body?.type;

    // Type 1 = PING (verification)
    if (interactionType === 1) {
      return new Response(JSON.stringify({ type: 1 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Type 2 = APPLICATION_COMMAND (slash command)
    // Type 3 = MESSAGE_COMPONENT (button click)
    if (interactionType === 2 || interactionType === 3) {
      const userId = body.member?.user?.id || body.user?.id;
      const channelId = body.channel_id;
      const commandName = body.data?.name;
      const messageContent = body.data?.options?.[0]?.value || commandName || "";

      console.log(`Discord interaction from ${userId} in ${channelId}: ${messageContent}`);

      // Get active flow for this bot
      let flowQuery = sb.from("bot_flows").select("*, bots!bot_flows_bot_id_fkey(telegram_token, id)").eq("is_active", true);
      if (botId) flowQuery = flowQuery.eq("bot_id", botId);
      const { data: flows } = await flowQuery;

      if (!flows?.length) {
        return new Response(JSON.stringify({ type: 4, data: { content: "Bot não configurado." } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // TODO: Implement Discord-specific message processing
      // Discord uses interaction responses (type 4 = CHANNEL_MESSAGE_WITH_SOURCE)
      
      return new Response(JSON.stringify({
        type: 4,
        data: { content: "Bot recebeu sua mensagem! (Em desenvolvimento)" }
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Discord webhook error:", error);
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
