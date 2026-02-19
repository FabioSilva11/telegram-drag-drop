import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    const nodeId = url.searchParams.get("nodeId");
    const flowId = url.searchParams.get("flowId");

    if (!nodeId || !flowId) {
      return new Response(JSON.stringify({ ok: false, error: "Missing nodeId or flowId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse incoming JSON body
    let body: Record<string, any> = {};
    try {
      body = await req.json();
    } catch {
      // If no JSON body, use empty object
    }

    const sb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the flow
    const { data: flow, error } = await sb
      .from("bot_flows")
      .select("*")
      .eq("id", flowId)
      .eq("is_active", true)
      .single();

    if (error || !flow) {
      return new Response(JSON.stringify({ ok: false, error: "Flow not found or inactive" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const nodes = flow.nodes as any[];
    const edges = flow.edges as any[];

    // Find the webhook node
    const webhookNode = nodes.find((n: any) => n.id === nodeId && n.type === "webhook");
    if (!webhookNode) {
      return new Response(JSON.stringify({ ok: false, error: "Webhook node not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prefix = webhookNode.data.webhookSaveVariable || "webhook";

    // Flatten the JSON into individual variables with prefix
    const vars: Record<string, any> = {};
    vars[`${prefix}_raw`] = JSON.stringify(body);

    function flattenJson(obj: any, parentKey: string) {
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = `${parentKey}.${key}`;
        if (value !== null && typeof value === "object" && !Array.isArray(value)) {
          flattenJson(value, fullKey);
        } else {
          vars[fullKey] = Array.isArray(value) ? JSON.stringify(value) : String(value);
        }
      }
    }

    flattenJson(body, prefix);

    console.log("Webhook received for flow:", flowId, "node:", nodeId, "vars:", JSON.stringify(vars));

    // Store the webhook data for the flow to pick up
    // We'll store it in a simple way - the telegram/whatsapp/discord engines can read this
    await sb.from("bot_sessions").upsert(
      {
        flow_id: flowId,
        telegram_chat_id: 0, // webhook trigger, no chat
        current_node_id: nodeId,
        variables: vars,
      },
      { onConflict: "flow_id,telegram_chat_id" }
    );

    return new Response(JSON.stringify({ ok: true, message: "Webhook received", variables: Object.keys(vars) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook receiver error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
