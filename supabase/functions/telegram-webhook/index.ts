import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TelegramUpdate {
  update_id: number;
  message?: {
    message_id: number;
    from: { id: number; first_name: string; username?: string };
    chat: { id: number; type: string };
    text?: string;
    date: number;
  };
  callback_query?: {
    id: string;
    from: { id: number; first_name: string };
    message: { chat: { id: number }; message_id: number };
    data: string;
  };
}

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

const TELEGRAM_API = "https://api.telegram.org/bot";

async function tgCall(token: string, method: string, body: any) {
  const res = await fetch(`${TELEGRAM_API}${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
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
  } catch {
    return false;
  }
}

// Log a message to bot_messages for analytics
async function logMessage(
  sb: any,
  botId: string,
  flowId: string,
  chatId: number,
  direction: string,
  text: string | null,
  nodeType: string | null,
) {
  await sb.from("bot_messages").insert({
    bot_id: botId,
    flow_id: flowId,
    telegram_chat_id: chatId,
    direction,
    message_text: text || null,
    node_type: nodeType,
  });
}


async function continueFrom(
  nodeId: string,
  nodes: FlowNode[],
  edges: FlowEdge[],
  token: string,
  chatId: number,
  msg: string,
  vars: Record<string, any>,
  sb: any,
  flowId: string,
  botId: string,
) {
  for (const nid of findNextNodes(edges, nodeId)) {
    const n = findNode(nodes, nid);
    if (n) await processNode(n, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
  }
}

async function processNode(
  node: FlowNode,
  nodes: FlowNode[],
  edges: FlowEdge[],
  token: string,
  chatId: number,
  msg: string,
  vars: Record<string, any>,
  sb: any,
  flowId: string,
  botId: string,
): Promise<void> {
  const d = node.data;
  switch (node.type) {
    case "start":
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "message":
      if (d.content) {
        const result = await tgCall(token, "sendMessage", {
          chat_id: chatId,
          text: replaceVars(d.content, vars),
          parse_mode: "HTML",
        });
        if (result.result?.message_id) vars.last_message_id = result.result.message_id;
        await logMessage(sb, botId, flowId, chatId, "outgoing", d.content, "message");
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "image":
      if (d.imageUrl) {
        await tgCall(token, "sendPhoto", {
          chat_id: chatId,
          photo: d.imageUrl,
          caption: d.caption ? replaceVars(d.caption, vars) : undefined,
        });
        await logMessage(sb, botId, flowId, chatId, "outgoing", d.caption || "image", "image");
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "video":
      if (d.videoUrl) {
        await tgCall(token, "sendVideo", {
          chat_id: chatId,
          video: d.videoUrl,
          caption: d.caption ? replaceVars(d.caption, vars) : undefined,
        });
        await logMessage(sb, botId, flowId, chatId, "outgoing", d.caption || "video", "video");
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "audio":
      if (d.audioUrl) {
        await tgCall(token, "sendAudio", {
          chat_id: chatId,
          audio: d.audioUrl,
          caption: d.caption ? replaceVars(d.caption, vars) : undefined,
        });
        await logMessage(sb, botId, flowId, chatId, "outgoing", null, "audio");
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "document":
      if (d.documentUrl) {
        await tgCall(token, "sendDocument", {
          chat_id: chatId,
          document: d.documentUrl,
          caption: d.caption ? replaceVars(d.caption, vars) : undefined,
        });
        await logMessage(sb, botId, flowId, chatId, "outgoing", null, "document");
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "animation":
      if (d.animationUrl) {
        await tgCall(token, "sendAnimation", {
          chat_id: chatId,
          animation: d.animationUrl,
          caption: d.caption ? replaceVars(d.caption, vars) : undefined,
        });
        await logMessage(sb, botId, flowId, chatId, "outgoing", null, "animation");
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "sticker":
      if (d.stickerFileId) {
        await tgCall(token, "sendSticker", { chat_id: chatId, sticker: d.stickerFileId });
        await logMessage(sb, botId, flowId, chatId, "outgoing", null, "sticker");
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "poll":
      if (d.pollQuestion && d.pollOptions?.length >= 2) {
        const body: any = {
          chat_id: chatId,
          question: replaceVars(d.pollQuestion, vars),
          options: d.pollOptions.map((o: string) => replaceVars(o, vars)),
          is_anonymous: d.pollIsAnonymous !== false,
          type: d.pollType || "regular",
        };
        if (d.pollType === "quiz" && d.pollCorrectOption !== undefined) body.correct_option_id = d.pollCorrectOption;
        await tgCall(token, "sendPoll", body);
        await logMessage(sb, botId, flowId, chatId, "outgoing", d.pollQuestion, "poll");
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "contact":
      if (d.contactPhone && d.contactFirstName) {
        await tgCall(token, "sendContact", {
          chat_id: chatId,
          phone_number: replaceVars(d.contactPhone, vars),
          first_name: replaceVars(d.contactFirstName, vars),
          last_name: d.contactLastName ? replaceVars(d.contactLastName, vars) : undefined,
        });
        await logMessage(sb, botId, flowId, chatId, "outgoing", null, "contact");
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "venue":
      if (d.latitude && d.longitude && d.locationTitle && d.venueAddress) {
        await tgCall(token, "sendVenue", {
          chat_id: chatId,
          latitude: d.latitude,
          longitude: d.longitude,
          title: replaceVars(d.locationTitle, vars),
          address: replaceVars(d.venueAddress, vars),
        });
        await logMessage(sb, botId, flowId, chatId, "outgoing", null, "venue");
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "dice":
      await tgCall(token, "sendDice", { chat_id: chatId, emoji: d.diceEmoji || "🎲" });
      await logMessage(sb, botId, flowId, chatId, "outgoing", null, "dice");
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "invoice":
      if (d.invoiceTitle && d.invoiceDescription && d.invoicePrice) {
        await tgCall(token, "sendInvoice", {
          chat_id: chatId,
          title: replaceVars(d.invoiceTitle, vars),
          description: replaceVars(d.invoiceDescription, vars),
          payload: `invoice_${node.id}`,
          provider_token: d.invoiceProviderToken || "",
          currency: d.invoiceCurrency || "BRL",
          prices: [{ label: d.invoiceTitle, amount: d.invoicePrice }],
        });
        await logMessage(sb, botId, flowId, chatId, "outgoing", d.invoiceTitle, "invoice");
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "editMessage":
      if (d.editText) {
        const msgId = d.editMessageId ? replaceVars(d.editMessageId, vars) : vars.last_message_id;
        if (msgId)
          await tgCall(token, "editMessageText", {
            chat_id: chatId,
            message_id: parseInt(msgId),
            text: replaceVars(d.editText, vars),
            parse_mode: "HTML",
          });
        await logMessage(sb, botId, flowId, chatId, "outgoing", d.editText, "editMessage");
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "deleteMessage":
      if (d.deleteMessageId || vars.last_message_id) {
        const msgId = d.deleteMessageId ? replaceVars(d.deleteMessageId, vars) : vars.last_message_id;
        if (msgId) await tgCall(token, "deleteMessage", { chat_id: chatId, message_id: parseInt(msgId) });
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "mediaGroup":
      if (d.mediaGroupItems?.length >= 2) {
        const media = d.mediaGroupItems.map((item: any) => ({
          type: item.type === "document" ? "document" : item.type === "video" ? "video" : "photo",
          media: item.url,
          caption: item.caption ? replaceVars(item.caption, vars) : undefined,
        }));
        await tgCall(token, "sendMediaGroup", { chat_id: chatId, media });
        await logMessage(sb, botId, flowId, chatId, "outgoing", null, "mediaGroup");
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "buttonReply":
      if (d.buttons?.length > 0) {
        const text = d.content ? replaceVars(d.content, vars) : d.label || "Escolha:";
        await tgCall(token, "sendMessage", {
          chat_id: chatId,
          text,
          reply_markup: { inline_keyboard: d.buttons.map((b: any) => [{ text: b.text, callback_data: b.id }]) },
        });
        await logMessage(sb, botId, flowId, chatId, "outgoing", text, "buttonReply");
        await sb
          .from("bot_sessions")
          .upsert(
            { flow_id: flowId, telegram_chat_id: chatId, current_node_id: node.id, variables: vars },
            { onConflict: "flow_id,telegram_chat_id" },
          );
      }
      break;
    case "userInput":
      if (d.promptText) {
        await tgCall(token, "sendMessage", { chat_id: chatId, text: replaceVars(d.promptText, vars) });
        await logMessage(sb, botId, flowId, chatId, "outgoing", d.promptText, "userInput");
      }
      await sb
        .from("bot_sessions")
        .upsert(
          { flow_id: flowId, telegram_chat_id: chatId, current_node_id: node.id, variables: vars },
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
        if (nn) await processNode(nn, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      }
      break;
    }
    case "location":
      if (d.latitude && d.longitude) {
        await tgCall(token, "sendLocation", { chat_id: chatId, latitude: d.latitude, longitude: d.longitude });
        await logMessage(sb, botId, flowId, chatId, "outgoing", null, "location");
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "httpRequest":
      if (d.httpUrl) {
        try {
          const url = replaceVars(d.httpUrl, vars);
          const method = d.httpMethod || "GET";
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (d.httpHeaders) {
            try {
              Object.assign(headers, JSON.parse(replaceVars(d.httpHeaders, vars)));
            } catch {}
          }
          const opts: any = { method, headers };
          if ((method === "POST" || method === "PUT") && d.httpBody) opts.body = replaceVars(d.httpBody, vars);
          const res = await fetch(url, opts);
          const rd = await res.text();
          vars.http_response = rd;
          vars.http_status = res.status;
          try {
            vars.http_json = JSON.parse(rd);
          } catch {}
        } catch (err) {
          vars.http_error = String(err);
        }
      }
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    case "delay": {
      const delay = d.delay || 1;
      const unit = d.delayUnit || "seconds";
      let ms = delay * 1000;
      if (unit === "minutes") ms = delay * 60 * 1000;
      if (unit === "hours") ms = delay * 60 * 60 * 1000;
      ms = Math.min(ms, 25000);
      await new Promise((r) => setTimeout(r, ms));
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
    }
    case "action":
      console.log(`Action: ${d.action} for chat ${chatId}`);
      await continueFrom(node.id, nodes, edges, token, chatId, msg, vars, sb, flowId, botId);
      break;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Extract botId from URL query parameter
    const url = new URL(req.url);
    const botId = url.searchParams.get("botId");

    const update: TelegramUpdate = await req.json();
    console.log("Telegram update for bot:", botId, JSON.stringify(update));

    let chatId: number | undefined;
    let msg = "";
    let isCb = false;
    let cbData = "";

    if (update.callback_query) {
      chatId = update.callback_query.message.chat.id;
      cbData = update.callback_query.data;
      msg = cbData;
      isCb = true;
    } else if (update.message?.text) {
      chatId = update.message.chat.id;
      msg = update.message.text;
    }

    if (!chatId)
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    // Build query - filter by specific bot if botId is provided
    let flowQuery = sb
      .from("bot_flows")
      .select("*, bots!bot_flows_bot_id_fkey(telegram_token, id)")
      .eq("is_active", true);
    if (botId) {
      flowQuery = flowQuery.eq("bot_id", botId);
    }

    const { data: flows } = await flowQuery;
    if (!flows?.length)
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });

    for (const flow of flows) {
      const bot = (flow as any).bots;
      const token = bot?.telegram_token;
      const currentBotId = bot?.id || botId || flow.bot_id;
      if (!token) continue;
      const nodes: FlowNode[] = flow.nodes as any;
      const edges: FlowEdge[] = flow.edges as any;
      const flowId = flow.id;

      // Log incoming message
      await logMessage(sb, currentBotId, flowId, chatId, "incoming", msg, null);

      if (isCb) await tgCall(token, "answerCallbackQuery", { callback_query_id: update.callback_query!.id });

      const { data: sessions } = await sb
        .from("bot_sessions")
        .select("*")
        .eq("flow_id", flowId)
        .eq("telegram_chat_id", chatId)
        .limit(1);
      const session = sessions?.[0];

      if (session?.current_node_id) {
        const cur = findNode(nodes, session.current_node_id);
        if (isCb && cur?.type === "buttonReply") {
          const handle = `btn-${cbData}`;
          const se = edges.filter((e) => e.source === cur.id && e.sourceHandle === handle);
          const edgesToFollow =
            se.length > 0 ? se : edges.filter((e) => e.source === cur.id && e.sourceHandle === "default");
          const vars = { ...session.variables, last_button: cbData };
          for (const e of edgesToFollow) {
            const nn = findNode(nodes, e.target);
            if (nn) await processNode(nn, nodes, edges, token, chatId, cbData, vars, sb, flowId, currentBotId);
          }
          await sb.from("bot_sessions").delete().eq("flow_id", flowId).eq("telegram_chat_id", chatId);
          break;
        } else if (!isCb && cur?.type === "userInput") {
          const vn = cur.data.variableName || "user_response";
          const vars = { ...session.variables, [vn]: msg };
          await sb.from("bot_sessions").delete().eq("flow_id", flowId).eq("telegram_chat_id", chatId);
          await continueFrom(cur.id, nodes, edges, token, chatId, msg, vars, sb, flowId, currentBotId);
          break;
        }
      } else {
        const start = findStart(nodes);
        if (start) {
          const trigger = start.data.content || "/start";
          if (msg === trigger || msg === "/start") {
            await sb.from("bot_sessions").delete().eq("flow_id", flowId).eq("telegram_chat_id", chatId);
            await processNode(start, nodes, edges, token, chatId, msg, {}, sb, flowId, currentBotId);
            break;
          }
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
