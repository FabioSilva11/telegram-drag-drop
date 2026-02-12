import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { nodes, edges, botId, action } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (!botId) {
      return new Response(
        JSON.stringify({ error: "botId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get bot record to fetch token
    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("*")
      .eq("id", botId)
      .maybeSingle();

    if (botError || !bot) {
      return new Response(
        JSON.stringify({ error: "Bot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const TELEGRAM_BOT_TOKEN = bot.telegram_token;

    if (action === "deactivate") {
      // Deactivate flows for this bot
      await supabase
        .from("bot_flows")
        .update({ is_active: false })
        .eq("bot_id", botId);

      await supabase
        .from("bots")
        .update({ is_active: false })
        .eq("id", botId);

      if (TELEGRAM_BOT_TOKEN) {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`);
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!TELEGRAM_BOT_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Bot token not configured. Add the Telegram token in the dashboard." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deactivate existing flows for this bot
    await supabase
      .from("bot_flows")
      .update({ is_active: false })
      .eq("bot_id", botId);

    // Save new flow
    const { data: flow, error: insertError } = await supabase
      .from("bot_flows")
      .insert({
        bot_name: bot.name,
        nodes,
        edges,
        is_active: true,
        user_id: bot.user_id,
        bot_id: botId,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error saving flow:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to save flow", details: insertError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Set Telegram webhook with botId for proper routing
    const webhookUrl = `${supabaseUrl}/functions/v1/telegram-webhook?botId=${botId}`;
    const setWebhookRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
        }),
      }
    );
    const webhookResult = await setWebhookRes.json();

    // Activate bot
    await supabase
      .from("bots")
      .update({ is_active: true })
      .eq("id", botId);

    // Get bot info
    const botInfoRes = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
    );
    const botInfo = await botInfoRes.json();

    return new Response(
      JSON.stringify({
        success: true,
        flow_id: flow.id,
        webhook: webhookResult,
        bot: botInfo.result,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
