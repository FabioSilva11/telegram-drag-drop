import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FlowNode {
  id: string;
  type: string;
  data: Record<string, any>;
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

const DISCORD_API = "https://discord.com/api/v10";

async function discordCall(botToken: string, method: string, path: string, body?: any) {
  const opts: any = {
    method,
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bot ${botToken}`,
    },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${DISCORD_API}${path}`, opts);
  return res.json();
}

async function sendChannelMessage(botToken: string, channelId: string, content: string, components?: any[]) {
  const body: any = { content };
  if (components?.length) body.components = components;
  return discordCall(botToken, "POST", `/channels/${channelId}/messages`, body);
}

async function sendEmbed(botToken: string, channelId: string, embed: any, content?: string) {
  return discordCall(botToken, "POST", `/channels/${channelId}/messages`, {
    ...(content ? { content } : {}),
    embeds: [embed],
  });
}

function findNextNodes(edges: FlowEdge[], nodeId: string): string[] {
  return edges.filter((e) => e.source === nodeId).map((e) => e.target);
}
function findNode(nodes: FlowNode[], id: string) {
  return nodes.find((n) => n.id === id);
}
function findStart(nodes: FlowNode[]) {
  return nodes.find((n) => n.type === "start");
}
function replaceVars(text: string, vars: Record<string, any>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] !== undefined ? String(vars[k]) : `{{${k}}}`));
}
function evalCondition(cond: string, msg: string, vars: Record<string, any>): boolean {
  try {
    const ctx = { ...vars, "user.message": msg, message: msg };
    if (cond.includes("==")) {
      const [l, r] = cond.split("==").map((s) => s.trim());
      const lv = l === "user.message" || l === "message" ? msg : ctx[l] || l;
      return lv === r.replace(/['"]/g, "");
    }
    if (cond.includes("!=")) {
      const [l, r] = cond.split("!=").map((s) => s.trim());
      const lv = l === "user.message" || l === "message" ? msg : ctx[l] || l;
      return lv !== r.replace(/['"]/g, "");
    }
    if (cond.includes("contains")) {
      const m = cond.match(/(.+)\.contains\(["'](.+)["']\)/);
      if (m) {
        const lv = m[1].trim() === "user.message" ? msg : ctx[m[1].trim()] || "";
        return lv.includes(m[2]);
      }
    }
    return false;
  } catch { return false; }
}

async function logMessage(sb: any, botId: string, flowId: string, chatId: string, direction: string, text: string | null, nodeType: string | null) {
  await sb.from("bot_messages").insert({
    bot_id: botId,
    flow_id: flowId,
    telegram_chat_id: parseInt(chatId) || 0,
    direction,
    message_text: text || null,
    node_type: nodeType,
  });
}

// Collect all responses for deferred interaction reply
interface DiscordResponse {
  content?: string;
  embeds?: any[];
  components?: any[];
}

async function continueFrom(
  nodeId: string, nodes: FlowNode[], edges: FlowEdge[],
  botToken: string, channelId: string, msg: string,
  vars: Record<string, any>, sb: any, flowId: string, botId: string,
  responses: DiscordResponse[],
) {
  for (const nid of findNextNodes(edges, nodeId)) {
    const n = findNode(nodes, nid);
    if (n) await processNode(n, nodes, edges, botToken, channelId, msg, vars, sb, flowId, botId, responses);
  }
}

async function processNode(
  node: FlowNode, nodes: FlowNode[], edges: FlowEdge[],
  botToken: string, channelId: string, msg: string,
  vars: Record<string, any>, sb: any, flowId: string, botId: string,
  responses: DiscordResponse[],
): Promise<void> {
  const d = node.data;
  switch (node.type) {
    case "start":
      await continueFrom(node.id, nodes, edges, botToken, channelId, msg, vars, sb, flowId, botId, responses);
      break;
    case "message":
      if (d.content) {
        // For interactions we collect; for channel messages we send directly
        await sendChannelMessage(botToken, channelId, replaceVars(d.content, vars));
        await logMessage(sb, botId, flowId, channelId, "outgoing", d.content, "message");
      }
      await continueFrom(node.id, nodes, edges, botToken, channelId, msg, vars, sb, flowId, botId, responses);
      break;
    case "image":
      if (d.imageUrl) {
        await sendEmbed(botToken, channelId, {
          image: { url: d.imageUrl },
          ...(d.caption ? { description: replaceVars(d.caption, vars) } : {}),
        });
        await logMessage(sb, botId, flowId, channelId, "outgoing", d.caption || "image", "image");
      }
      await continueFrom(node.id, nodes, edges, botToken, channelId, msg, vars, sb, flowId, botId, responses);
      break;
    case "video":
      if (d.videoUrl) {
        await sendChannelMessage(botToken, channelId, `${d.caption ? replaceVars(d.caption, vars) + "\n" : ""}${d.videoUrl}`);
        await logMessage(sb, botId, flowId, channelId, "outgoing", d.caption || "video", "video");
      }
      await continueFrom(node.id, nodes, edges, botToken, channelId, msg, vars, sb, flowId, botId, responses);
      break;
    case "buttonReply":
      if (d.buttons?.length > 0) {
        const text = d.content ? replaceVars(d.content, vars) : d.label || "Escolha:";
        const components = [{
          type: 1, // ACTION_ROW
          components: d.buttons.slice(0, 5).map((b: any) => ({
            type: 2, // BUTTON
            style: 1, // PRIMARY
            label: b.text.slice(0, 80),
            custom_id: b.id,
          })),
        }];
        await sendChannelMessage(botToken, channelId, text, components);
        await logMessage(sb, botId, flowId, channelId, "outgoing", text, "buttonReply");
        await sb.from("bot_sessions").upsert(
          { flow_id: flowId, telegram_chat_id: parseInt(channelId) || 0, current_node_id: node.id, variables: vars },
          { onConflict: "flow_id,telegram_chat_id" },
        );
      }
      break;
    case "userInput":
      if (d.promptText) {
        await sendChannelMessage(botToken, channelId, replaceVars(d.promptText, vars));
        await logMessage(sb, botId, flowId, channelId, "outgoing", d.promptText, "userInput");
      }
      await sb.from("bot_sessions").upsert(
        { flow_id: flowId, telegram_chat_id: parseInt(channelId) || 0, current_node_id: node.id, variables: vars },
        { onConflict: "flow_id,telegram_chat_id" },
      );
      break;
    case "condition": {
      const result = evalCondition(d.condition || "", msg, vars);
      const outs = edges.filter((e) => e.source === node.id);
      const next = result
        ? outs.find((e) => e.sourceHandle === "yes") || outs[0]
        : outs.find((e) => e.sourceHandle === "no") || outs[1];
      if (next) {
        const nn = findNode(nodes, next.target);
        if (nn) await processNode(nn, nodes, edges, botToken, channelId, msg, vars, sb, flowId, botId, responses);
      }
      break;
    }
    case "location":
      if (d.latitude && d.longitude) {
        const mapUrl = `https://www.google.com/maps?q=${d.latitude},${d.longitude}`;
        await sendChannelMessage(botToken, channelId, `📍 ${d.locationTitle || "Localização"}: ${mapUrl}`);
        await logMessage(sb, botId, flowId, channelId, "outgoing", null, "location");
      }
      await continueFrom(node.id, nodes, edges, botToken, channelId, msg, vars, sb, flowId, botId, responses);
      break;
    case "httpRequest":
      if (d.httpUrl) {
        try {
          const url = replaceVars(d.httpUrl, vars);
          const method = d.httpMethod || "GET";
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (d.httpHeaders) {
            try { Object.assign(headers, JSON.parse(replaceVars(d.httpHeaders, vars))); } catch {}
          }
          const opts: any = { method, headers };
          if ((method === "POST" || method === "PUT") && d.httpBody) opts.body = replaceVars(d.httpBody, vars);
          const res = await fetch(url, opts);
          const rd = await res.text();
          vars.http_response = rd;
          vars.http_status = res.status;
          try { vars.http_json = JSON.parse(rd); } catch {}
        } catch (err) { vars.http_error = String(err); }
      }
      await continueFrom(node.id, nodes, edges, botToken, channelId, msg, vars, sb, flowId, botId, responses);
      break;
    case "delay": {
      const delay = d.delay || 1;
      const unit = d.delayUnit || "seconds";
      let ms = delay * 1000;
      if (unit === "minutes") ms = delay * 60 * 1000;
      if (unit === "hours") ms = delay * 60 * 60 * 1000;
      ms = Math.min(ms, 25000);
      await new Promise((r) => setTimeout(r, ms));
      await continueFrom(node.id, nodes, edges, botToken, channelId, msg, vars, sb, flowId, botId, responses);
      break;
    }
    default:
      await continueFrom(node.id, nodes, edges, botToken, channelId, msg, vars, sb, flowId, botId, responses);
      break;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const url = new URL(req.url);
    const botId = url.searchParams.get("botId");

    const body = await req.json();
    console.log("Discord webhook for bot:", botId, JSON.stringify(body));

    const interactionType = body?.type;

    // Type 1 = PING
    if (interactionType === 1) {
      return new Response(JSON.stringify({ type: 1 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Type 2 = APPLICATION_COMMAND, Type 3 = MESSAGE_COMPONENT (button)
    if (interactionType === 2 || interactionType === 3) {
      const channelId = body.channel_id;
      const userId = body.member?.user?.id || body.user?.id;

      let flowQuery = sb.from("bot_flows").select("*, bots!bot_flows_bot_id_fkey(id, discord_bot_token)").eq("is_active", true).eq("platform", "discord");
      if (botId) flowQuery = flowQuery.eq("bot_id", botId);
      const { data: flows } = await flowQuery;

      if (!flows?.length) {
        return new Response(JSON.stringify({ type: 4, data: { content: "Bot não configurado." } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Respond with DEFERRED first, then follow up with channel messages
      // Actually for simplicity, respond immediately and send follow-ups via channel
      const firstResponse: any = { type: 5 }; // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE

      // Process in background-like manner after responding
      const flow = flows[0];
      const bot = (flow as any).bots;
      const discordToken = bot?.discord_bot_token;
      const currentBotId = bot?.id || botId || flow.bot_id;

      if (!discordToken) {
        return new Response(JSON.stringify({ type: 4, data: { content: "Token do bot não configurado." } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const nodes: FlowNode[] = flow.nodes as any;
      const edges: FlowEdge[] = flow.edges as any;
      const flowId = flow.id;
      const responses: DiscordResponse[] = [];

      if (interactionType === 3) {
        // Button click
        const customId = body.data?.custom_id || "";
        const chatIdNum = parseInt(channelId) || 0;

        await logMessage(sb, currentBotId, flowId, channelId, "incoming", customId, null);

        const { data: sessions } = await sb.from("bot_sessions").select("*").eq("flow_id", flowId).eq("telegram_chat_id", chatIdNum).limit(1);
        const session = sessions?.[0];

        if (session?.current_node_id) {
          const cur = findNode(nodes, session.current_node_id);
          if (cur?.type === "buttonReply") {
            const handle = `btn-${customId}`;
            const se = edges.filter((e) => e.source === cur.id && e.sourceHandle === handle);
            const edgesToFollow = se.length > 0 ? se : edges.filter((e) => e.source === cur.id && e.sourceHandle === "default");
            const vars = { ...session.variables, last_button: customId };
            const clickedBtn = cur.data.buttons?.find((b: any) => String(b.id) === customId);
            if (clickedBtn) vars.last_button_text = clickedBtn.text;
            let nextNodeId: string | null = null;
            for (const e of edgesToFollow) {
              const nn = findNode(nodes, e.target);
              if (nn) {
                nextNodeId = nn.id;
                await processNode(nn, nodes, edges, discordToken, channelId, customId, vars, sb, flowId, currentBotId, responses);
              }
            }
            // Update to next node instead of null — preserves chaining
            await sb.from("bot_sessions").update({ current_node_id: nextNodeId, variables: vars }).eq("flow_id", flowId).eq("telegram_chat_id", chatIdNum);
          }
        }

        // Acknowledge the interaction
        return new Response(JSON.stringify({ type: 6 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Slash command (type 2)
      const commandName = body.data?.name || "";
      const commandContent = body.data?.options?.[0]?.value || commandName;

      await logMessage(sb, currentBotId, flowId, channelId, "incoming", commandContent, null);

      const chatIdNum = parseInt(channelId) || 0;
      const { data: sessions } = await sb.from("bot_sessions").select("*").eq("flow_id", flowId).eq("telegram_chat_id", chatIdNum).limit(1);
      const session = sessions?.[0];

      if (session?.current_node_id) {
        const cur = findNode(nodes, session.current_node_id);
        if (cur?.type === "userInput") {
          const vn = cur.data.variableName || "user_response";
          const vars = { ...session.variables, [vn]: commandContent };
          await sb.from("bot_sessions").delete().eq("flow_id", flowId).eq("telegram_chat_id", chatIdNum);
          await continueFrom(cur.id, nodes, edges, discordToken, channelId, commandContent, vars, sb, flowId, currentBotId, responses);
        }
      } else {
        const start = findStart(nodes);
        if (start) {
          await sb.from("bot_sessions").delete().eq("flow_id", flowId).eq("telegram_chat_id", chatIdNum);
          await processNode(start, nodes, edges, discordToken, channelId, commandContent, {}, sb, flowId, currentBotId, responses);
        }
      }

      // Acknowledge interaction (messages already sent via channel)
      return new Response(JSON.stringify({ type: 4, data: { content: "✅" } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Discord webhook error:", error);
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
