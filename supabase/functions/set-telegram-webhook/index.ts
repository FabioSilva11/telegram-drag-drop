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
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!TELEGRAM_BOT_TOKEN) {
      return new Response(
        JSON.stringify({ error: "Bot token not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { nodes, edges, botName, action } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "deactivate") {
      // Deactivate all flows
      await supabase
        .from("bot_flows")
        .update({ is_active: false })
        .eq("is_active", true);

      // Remove webhook
      const deleteRes = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`
      );
      const deleteData = await deleteRes.json();

      return new Response(
        JSON.stringify({ success: true, webhook: deleteData }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Deactivate any existing active flows
    await supabase
      .from("bot_flows")
      .update({ is_active: false })
      .eq("is_active", true);

    // Save the new flow
    const { data: flow, error: insertError } = await supabase
      .from("bot_flows")
      .insert({
        bot_name: botName || "Meu Bot",
        nodes,
        edges,
        is_active: true,
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

    // Set Telegram webhook
    const webhookUrl = `${supabaseUrl}/functions/v1/telegram-webhook`;
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
    console.log("Webhook set result:", webhookResult);

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
