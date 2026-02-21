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

const WA_API = "https://graph.facebook.com/v21.0";

async function waCall(phoneNumberId: string, accessToken: string, body: any) {
  const res = await fetch(`${WA_API}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function waSendText(phoneNumberId: string, token: string, to: string, text: string) {
  return waCall(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to,
    type: "text",
    text: { body: text },
  });
}

async function waSendImage(phoneNumberId: string, token: string, to: string, imageUrl: string, caption?: string) {
  return waCall(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to,
    type: "image",
    image: { link: imageUrl, ...(caption ? { caption } : {}) },
  });
}

async function waSendDocument(phoneNumberId: string, token: string, to: string, docUrl: string, caption?: string, filename?: string) {
  return waCall(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to,
    type: "document",
    document: { link: docUrl, ...(caption ? { caption } : {}), ...(filename ? { filename } : {}) },
  });
}

async function waSendVideo(phoneNumberId: string, token: string, to: string, videoUrl: string, caption?: string) {
  return waCall(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to,
    type: "video",
    video: { link: videoUrl, ...(caption ? { caption } : {}) },
  });
}

async function waSendAudio(phoneNumberId: string, token: string, to: string, audioUrl: string) {
  return waCall(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to,
    type: "audio",
    audio: { link: audioUrl },
  });
}

async function waSendButtons(phoneNumberId: string, token: string, to: string, bodyText: string, buttons: { id: string; text: string }[]) {
  return waCall(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to,
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: bodyText },
      action: {
        buttons: buttons.slice(0, 3).map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.text.slice(0, 20) },
        })),
      },
    },
  });
}

async function waSendLocation(phoneNumberId: string, token: string, to: string, lat: number, lng: number, name?: string, address?: string) {
  return waCall(phoneNumberId, token, {
    messaging_product: "whatsapp",
    to,
    type: "location",
    location: { latitude: lat, longitude: lng, ...(name ? { name } : {}), ...(address ? { address } : {}) },
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

async function continueFrom(
  nodeId: string, nodes: FlowNode[], edges: FlowEdge[],
  phoneNumberId: string, token: string, to: string, msg: string,
  vars: Record<string, any>, sb: any, flowId: string, botId: string,
) {
  for (const nid of findNextNodes(edges, nodeId)) {
    const n = findNode(nodes, nid);
    if (n) await processNode(n, nodes, edges, phoneNumberId, token, to, msg, vars, sb, flowId, botId);
  }
}

async function processNode(
  node: FlowNode, nodes: FlowNode[], edges: FlowEdge[],
  phoneNumberId: string, token: string, to: string, msg: string,
  vars: Record<string, any>, sb: any, flowId: string, botId: string,
): Promise<void> {
  const d = node.data;
  switch (node.type) {
    case "start":
      await continueFrom(node.id, nodes, edges, phoneNumberId, token, to, msg, vars, sb, flowId, botId);
      break;
    case "message":
      if (d.content) {
        await waSendText(phoneNumberId, token, to, replaceVars(d.content, vars));
        await logMessage(sb, botId, flowId, to, "outgoing", d.content, "message");
      }
      await continueFrom(node.id, nodes, edges, phoneNumberId, token, to, msg, vars, sb, flowId, botId);
      break;
    case "image":
      if (d.imageUrl) {
        await waSendImage(phoneNumberId, token, to, d.imageUrl, d.caption ? replaceVars(d.caption, vars) : undefined);
        await logMessage(sb, botId, flowId, to, "outgoing", d.caption || "image", "image");
      }
      await continueFrom(node.id, nodes, edges, phoneNumberId, token, to, msg, vars, sb, flowId, botId);
      break;
    case "video":
      if (d.videoUrl) {
        await waSendVideo(phoneNumberId, token, to, d.videoUrl, d.caption ? replaceVars(d.caption, vars) : undefined);
        await logMessage(sb, botId, flowId, to, "outgoing", d.caption || "video", "video");
      }
      await continueFrom(node.id, nodes, edges, phoneNumberId, token, to, msg, vars, sb, flowId, botId);
      break;
    case "audio":
      if (d.audioUrl) {
        await waSendAudio(phoneNumberId, token, to, d.audioUrl);
        await logMessage(sb, botId, flowId, to, "outgoing", null, "audio");
      }
      await continueFrom(node.id, nodes, edges, phoneNumberId, token, to, msg, vars, sb, flowId, botId);
      break;
    case "document":
      if (d.documentUrl) {
        await waSendDocument(phoneNumberId, token, to, d.documentUrl, d.caption ? replaceVars(d.caption, vars) : undefined);
        await logMessage(sb, botId, flowId, to, "outgoing", null, "document");
      }
      await continueFrom(node.id, nodes, edges, phoneNumberId, token, to, msg, vars, sb, flowId, botId);
      break;
    case "location":
      if (d.latitude && d.longitude) {
        await waSendLocation(phoneNumberId, token, to, d.latitude, d.longitude, d.locationTitle, d.venueAddress);
        await logMessage(sb, botId, flowId, to, "outgoing", null, "location");
      }
      await continueFrom(node.id, nodes, edges, phoneNumberId, token, to, msg, vars, sb, flowId, botId);
      break;
    case "buttonReply":
      if (d.buttons?.length > 0) {
        const text = d.content ? replaceVars(d.content, vars) : d.label || "Escolha:";
        await waSendButtons(phoneNumberId, token, to, text, d.buttons.slice(0, 3));
        await logMessage(sb, botId, flowId, to, "outgoing", text, "buttonReply");
        await sb.from("bot_sessions").upsert(
          { flow_id: flowId, telegram_chat_id: parseInt(to) || 0, current_node_id: node.id, variables: vars },
          { onConflict: "flow_id,telegram_chat_id" },
        );
      }
      break;
    case "userInput":
      if (d.promptText) {
        await waSendText(phoneNumberId, token, to, replaceVars(d.promptText, vars));
        await logMessage(sb, botId, flowId, to, "outgoing", d.promptText, "userInput");
      }
      await sb.from("bot_sessions").upsert(
        { flow_id: flowId, telegram_chat_id: parseInt(to) || 0, current_node_id: node.id, variables: vars },
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
        if (nn) await processNode(nn, nodes, edges, phoneNumberId, token, to, msg, vars, sb, flowId, botId);
      }
      break;
    }
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
      await continueFrom(node.id, nodes, edges, phoneNumberId, token, to, msg, vars, sb, flowId, botId);
      break;
    case "delay": {
      const delay = d.delay || 1;
      const unit = d.delayUnit || "seconds";
      let ms = delay * 1000;
      if (unit === "minutes") ms = delay * 60 * 1000;
      if (unit === "hours") ms = delay * 60 * 60 * 1000;
      ms = Math.min(ms, 25000);
      await new Promise((r) => setTimeout(r, ms));
      await continueFrom(node.id, nodes, edges, phoneNumberId, token, to, msg, vars, sb, flowId, botId);
      break;
    }
    case "action":
      console.log(`WA Action: ${d.action} for ${to}`);
      await continueFrom(node.id, nodes, edges, phoneNumberId, token, to, msg, vars, sb, flowId, botId);
      break;
    default:
      // Unsupported node types for WA - skip and continue
      await continueFrom(node.id, nodes, edges, phoneNumberId, token, to, msg, vars, sb, flowId, botId);
      break;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const url = new URL(req.url);
    const botId = url.searchParams.get("botId");

    // WhatsApp Cloud API GET verification
    if (req.method === "GET") {
      const mode = url.searchParams.get("hub.mode");
      const challenge = url.searchParams.get("hub.challenge");
      if (mode === "subscribe" && challenge) {
        return new Response(challenge, { status: 200, headers: corsHeaders });
      }
      return new Response("Forbidden", { status: 403, headers: corsHeaders });
    }

    const body = await req.json();
    console.log("WhatsApp webhook for bot:", botId, JSON.stringify(body));

    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Only process actual messages (not status updates)
    if (!value?.messages?.length) {
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const message = value.messages[0];
    const from = message.from; // sender phone number
    const msgText = message.text?.body || "";
    const msgType = message.type;

    // Handle interactive reply (button clicks)
    let isButtonReply = false;
    let buttonReplyId = "";
    if (msgType === "interactive") {
      const interactive = message.interactive;
      if (interactive?.type === "button_reply") {
        isButtonReply = true;
        buttonReplyId = interactive.button_reply?.id || "";
      }
    }

    const msgContent = isButtonReply ? buttonReplyId : msgText;

    // Get active flow for this bot - fetch WA credentials
    let flowQuery = sb.from("bot_flows").select("*, bots!bot_flows_bot_id_fkey(id, whatsapp_phone_number_id, whatsapp_access_token)").eq("is_active", true).eq("platform", "whatsapp");
    if (botId) flowQuery = flowQuery.eq("bot_id", botId);
    const { data: flows } = await flowQuery;

    if (!flows?.length) {
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    for (const flow of flows) {
      const bot = (flow as any).bots;
      const phoneNumberId = bot?.whatsapp_phone_number_id;
      const accessToken = bot?.whatsapp_access_token;
      const currentBotId = bot?.id || botId || flow.bot_id;

      if (!phoneNumberId || !accessToken) continue;

      const nodes: FlowNode[] = flow.nodes as any;
      const edges: FlowEdge[] = flow.edges as any;
      const flowId = flow.id;

      await logMessage(sb, currentBotId, flowId, from, "incoming", msgContent, null);

      const chatIdNum = parseInt(from) || 0;
      const { data: sessions } = await sb.from("bot_sessions").select("*").eq("flow_id", flowId).eq("telegram_chat_id", chatIdNum).limit(1);
      const session = sessions?.[0];

      if (session?.current_node_id) {
        const cur = findNode(nodes, session.current_node_id);
        if (isButtonReply && cur?.type === "buttonReply") {
          const handle = `btn-${buttonReplyId}`;
          const se = edges.filter((e) => e.source === cur.id && e.sourceHandle === handle);
          const edgesToFollow = se.length > 0 ? se : edges.filter((e) => e.source === cur.id && e.sourceHandle === "default");
          const vars = { ...session.variables, last_button: buttonReplyId };
          // Captura texto do botão
          const clickedBtn = cur.data.buttons?.find((b: any) => String(b.id) === buttonReplyId);
          if (clickedBtn) vars.last_button_text = clickedBtn.text;
          let nextNodeId: string | null = null;
          for (const e of edgesToFollow) {
            const nn = findNode(nodes, e.target);
            if (nn) {
              nextNodeId = nn.id;
              await processNode(nn, nodes, edges, phoneNumberId, accessToken, from, buttonReplyId, vars, sb, flowId, currentBotId);
            }
          }
          // Update to next node instead of null — preserves chaining
          await sb.from("bot_sessions").update({ current_node_id: nextNodeId, variables: vars }).eq("flow_id", flowId).eq("telegram_chat_id", chatIdNum);
        } else if (!isButtonReply && cur?.type === "userInput") {
          const vn = cur.data.variableName || "user_response";
          const vars = { ...session.variables, [vn]: msgContent };
          await sb.from("bot_sessions").update({ current_node_id: null, variables: vars }).eq("flow_id", flowId).eq("telegram_chat_id", chatIdNum);
          await continueFrom(cur.id, nodes, edges, phoneNumberId, accessToken, from, msgContent, vars, sb, flowId, currentBotId);
        }
      } else {
        const start = findStart(nodes);
        if (start) {
          const trigger = start.data.content || "/start";
          if (msgContent === trigger || msgContent.toLowerCase() === "oi" || msgContent.toLowerCase() === "olá" || msgContent.toLowerCase() === "menu" || msgContent.toLowerCase() === "inicio") {
            await sb.from("bot_sessions").update({ current_node_id: null, variables: {} }).eq("flow_id", flowId).eq("telegram_chat_id", chatIdNum);
            await processNode(start, nodes, edges, phoneNumberId, accessToken, from, msgContent, {}, sb, flowId, currentBotId);
          }
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
