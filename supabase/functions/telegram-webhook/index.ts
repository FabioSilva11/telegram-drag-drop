import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
    message: { chat: { id: number } };
    data: string;
  };
}

interface FlowNode {
  id: string;
  type: string;
  data: {
    type: string;
    label: string;
    content?: string;
    buttons?: { id: string; text: string }[];
    condition?: string;
    action?: string;
    delay?: number;
    delayUnit?: string;
    imageUrl?: string;
    caption?: string;
    promptText?: string;
    variableName?: string;
    latitude?: number;
    longitude?: number;
    locationTitle?: string;
    httpUrl?: string;
    httpMethod?: string;
    httpHeaders?: string;
    httpBody?: string;
  };
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

const TELEGRAM_API = "https://api.telegram.org/bot";

async function sendTelegramMessage(
  token: string,
  chatId: number,
  text: string,
  buttons?: { id: string; text: string }[]
) {
  const url = `${TELEGRAM_API}${token}/sendMessage`;
  const body: any = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  };

  if (buttons && buttons.length > 0) {
    body.reply_markup = {
      inline_keyboard: buttons.map((btn) => [
        { text: btn.text, callback_data: btn.id },
      ]),
    };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return res.json();
}

async function sendTelegramPhoto(
  token: string,
  chatId: number,
  photoUrl: string,
  caption?: string
) {
  const url = `${TELEGRAM_API}${token}/sendPhoto`;
  const body: any = {
    chat_id: chatId,
    photo: photoUrl,
  };
  if (caption) body.caption = caption;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function sendTelegramLocation(
  token: string,
  chatId: number,
  latitude: number,
  longitude: number
) {
  const url = `${TELEGRAM_API}${token}/sendLocation`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, latitude, longitude }),
  });
  return res.json();
}

async function answerCallbackQuery(token: string, callbackQueryId: string) {
  const url = `${TELEGRAM_API}${token}/answerCallbackQuery`;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  });
}

function findNextNodes(edges: FlowEdge[], currentNodeId: string, sourceHandle?: string): string[] {
  return edges
    .filter((e) => e.source === currentNodeId && (!sourceHandle || e.sourceHandle === sourceHandle))
    .map((e) => e.target);
}

function findNextNodesDefault(edges: FlowEdge[], currentNodeId: string): string[] {
  return edges
    .filter((e) => e.source === currentNodeId)
    .map((e) => e.target);
}

function findNodeById(nodes: FlowNode[], id: string): FlowNode | undefined {
  return nodes.find((n) => n.id === id);
}

function findStartNode(nodes: FlowNode[]): FlowNode | undefined {
  return nodes.find((n) => n.type === "start");
}

function replaceVariables(text: string, variables: Record<string, any>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return variables[key] !== undefined ? String(variables[key]) : `{{${key}}}`;
  });
}

function evaluateCondition(
  condition: string,
  userMessage: string,
  variables: Record<string, any>
): boolean {
  try {
    const ctx = { ...variables, "user.message": userMessage, message: userMessage };
    
    if (condition.includes("==")) {
      const [left, right] = condition.split("==").map((s) => s.trim());
      const leftVal = left === "user.message" || left === "message" ? userMessage : ctx[left] || left;
      const rightVal = right.replace(/['"]/g, "");
      return leftVal === rightVal;
    }
    if (condition.includes("!=")) {
      const [left, right] = condition.split("!=").map((s) => s.trim());
      const leftVal = left === "user.message" || left === "message" ? userMessage : ctx[left] || left;
      const rightVal = right.replace(/['"]/g, "");
      return leftVal !== rightVal;
    }
    if (condition.includes("contains")) {
      const match = condition.match(/(.+)\.contains\(["'](.+)["']\)/);
      if (match) {
        const leftVal = match[1].trim() === "user.message" ? userMessage : ctx[match[1].trim()] || "";
        return leftVal.includes(match[2]);
      }
    }
    return false;
  } catch {
    return false;
  }
}

async function continueFromNode(
  nodeId: string,
  nodes: FlowNode[],
  edges: FlowEdge[],
  token: string,
  chatId: number,
  userMessage: string,
  variables: Record<string, any>,
  supabase: any,
  flowId: string
): Promise<void> {
  const nextIds = findNextNodesDefault(edges, nodeId);
  for (const nextId of nextIds) {
    const nextNode = findNodeById(nodes, nextId);
    if (nextNode) {
      await processNode(nextNode, nodes, edges, token, chatId, userMessage, variables, supabase, flowId);
    }
  }
}

async function processNode(
  node: FlowNode,
  nodes: FlowNode[],
  edges: FlowEdge[],
  token: string,
  chatId: number,
  userMessage: string,
  variables: Record<string, any>,
  supabase: any,
  flowId: string
): Promise<void> {
  switch (node.type) {
    case "start": {
      await continueFromNode(node.id, nodes, edges, token, chatId, userMessage, variables, supabase, flowId);
      break;
    }

    case "message": {
      if (node.data.content) {
        const text = replaceVariables(node.data.content, variables);
        await sendTelegramMessage(token, chatId, text);
      }
      await continueFromNode(node.id, nodes, edges, token, chatId, userMessage, variables, supabase, flowId);
      break;
    }

    case "image": {
      if (node.data.imageUrl) {
        const caption = node.data.caption ? replaceVariables(node.data.caption, variables) : undefined;
        await sendTelegramPhoto(token, chatId, node.data.imageUrl, caption);
      }
      await continueFromNode(node.id, nodes, edges, token, chatId, userMessage, variables, supabase, flowId);
      break;
    }

    case "buttonReply": {
      if (node.data.buttons && node.data.buttons.length > 0) {
        const text = node.data.content
          ? replaceVariables(node.data.content, variables)
          : node.data.label || "Escolha uma opção:";
        await sendTelegramMessage(token, chatId, text, node.data.buttons);
        // Save session - waiting for button response
        await supabase
          .from("bot_sessions")
          .upsert(
            {
              flow_id: flowId,
              telegram_chat_id: chatId,
              current_node_id: node.id,
              variables,
            },
            { onConflict: "flow_id,telegram_chat_id" }
          );
      }
      break;
    }

    case "userInput": {
      // Send the prompt text
      if (node.data.promptText) {
        const text = replaceVariables(node.data.promptText, variables);
        await sendTelegramMessage(token, chatId, text);
      }
      // Save session - waiting for user text input
      await supabase
        .from("bot_sessions")
        .upsert(
          {
            flow_id: flowId,
            telegram_chat_id: chatId,
            current_node_id: node.id,
            variables,
          },
          { onConflict: "flow_id,telegram_chat_id" }
        );
      break;
    }

    case "condition": {
      const condition = node.data.condition || "";
      const result = evaluateCondition(condition, userMessage, variables);
      
      const outEdges = edges.filter((e) => e.source === node.id);
      const trueEdge = outEdges.find((e) => e.sourceHandle === "yes") || outEdges[0];
      const falseEdge = outEdges.find((e) => e.sourceHandle === "no") || outEdges[1];
      
      const nextEdge = result ? trueEdge : falseEdge;
      if (nextEdge) {
        const nextNode = findNodeById(nodes, nextEdge.target);
        if (nextNode) {
          await processNode(nextNode, nodes, edges, token, chatId, userMessage, variables, supabase, flowId);
        }
      }
      break;
    }

    case "location": {
      if (node.data.latitude && node.data.longitude) {
        await sendTelegramLocation(token, chatId, node.data.latitude, node.data.longitude);
      }
      await continueFromNode(node.id, nodes, edges, token, chatId, userMessage, variables, supabase, flowId);
      break;
    }

    case "httpRequest": {
      if (node.data.httpUrl) {
        try {
          const url = replaceVariables(node.data.httpUrl, variables);
          const method = node.data.httpMethod || "GET";
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          
          if (node.data.httpHeaders) {
            try {
              const customHeaders = JSON.parse(replaceVariables(node.data.httpHeaders, variables));
              Object.assign(headers, customHeaders);
            } catch {}
          }

          const fetchOptions: any = { method, headers };
          if ((method === "POST" || method === "PUT") && node.data.httpBody) {
            fetchOptions.body = replaceVariables(node.data.httpBody, variables);
          }

          const res = await fetch(url, fetchOptions);
          const responseData = await res.text();
          
          // Store response in variables
          variables.http_response = responseData;
          variables.http_status = res.status;
          try {
            variables.http_json = JSON.parse(responseData);
          } catch {}
          
          console.log(`HTTP ${method} ${url} → ${res.status}`);
        } catch (err) {
          console.error("HTTP request error:", err);
          variables.http_error = String(err);
        }
      }
      await continueFromNode(node.id, nodes, edges, token, chatId, userMessage, variables, supabase, flowId);
      break;
    }

    case "delay": {
      const delay = node.data.delay || 1;
      const unit = node.data.delayUnit || "seconds";
      let ms = delay * 1000;
      if (unit === "minutes") ms = delay * 60 * 1000;
      if (unit === "hours") ms = delay * 60 * 60 * 1000;
      ms = Math.min(ms, 25000);
      
      await new Promise((resolve) => setTimeout(resolve, ms));
      await continueFromNode(node.id, nodes, edges, token, chatId, userMessage, variables, supabase, flowId);
      break;
    }

    case "action": {
      console.log(`Action executed: ${node.data.action} for chat ${chatId}`);
      await continueFromNode(node.id, nodes, edges, token, chatId, userMessage, variables, supabase, flowId);
      break;
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    if (!TELEGRAM_BOT_TOKEN) {
      console.error("TELEGRAM_BOT_TOKEN not configured");
      return new Response(JSON.stringify({ error: "Bot token not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const update: TelegramUpdate = await req.json();
    console.log("Received Telegram update:", JSON.stringify(update));

    let chatId: number | undefined;
    let userMessage = "";
    let isCallbackQuery = false;
    let callbackData = "";

    if (update.callback_query) {
      chatId = update.callback_query.message.chat.id;
      callbackData = update.callback_query.data;
      userMessage = callbackData;
      isCallbackQuery = true;
      await answerCallbackQuery(TELEGRAM_BOT_TOKEN, update.callback_query.id);
    } else if (update.message?.text) {
      chatId = update.message.chat.id;
      userMessage = update.message.text;
    }

    if (!chatId) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get active flow
    const { data: flows, error: flowError } = await supabase
      .from("bot_flows")
      .select("*")
      .eq("is_active", true)
      .limit(1);

    if (flowError || !flows || flows.length === 0) {
      console.log("No active flow found");
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const flow = flows[0];
    const nodes: FlowNode[] = flow.nodes;
    const edges: FlowEdge[] = flow.edges;
    const flowId = flow.id;

    // Check for existing session
    const { data: sessions } = await supabase
      .from("bot_sessions")
      .select("*")
      .eq("flow_id", flowId)
      .eq("telegram_chat_id", chatId)
      .limit(1);

    const session = sessions?.[0];

    if (session?.current_node_id) {
      const currentNode = findNodeById(nodes, session.current_node_id);
      
      if (isCallbackQuery && currentNode?.type === "buttonReply") {
        // Handle button press - route to the specific button's output
        const btnHandle = `btn-${callbackData}`;
        const specificEdges = edges.filter(
          (e) => e.source === currentNode.id && e.sourceHandle === btnHandle
        );
        
        // If no specific handle match, try default output
        const edgesToFollow = specificEdges.length > 0
          ? specificEdges
          : edges.filter((e) => e.source === currentNode.id && e.sourceHandle === "default");

        const variables = { ...session.variables, last_button: callbackData };
        
        for (const edge of edgesToFollow) {
          const nextNode = findNodeById(nodes, edge.target);
          if (nextNode) {
            await processNode(nextNode, nodes, edges, TELEGRAM_BOT_TOKEN, chatId, callbackData, variables, supabase, flowId);
          }
        }

        // Clear session
        await supabase
          .from("bot_sessions")
          .delete()
          .eq("flow_id", flowId)
          .eq("telegram_chat_id", chatId);

      } else if (!isCallbackQuery && currentNode?.type === "userInput") {
        // Handle text input - store in variable and continue
        const varName = currentNode.data.variableName || "user_response";
        const variables = { ...session.variables, [varName]: userMessage };

        // Clear session first
        await supabase
          .from("bot_sessions")
          .delete()
          .eq("flow_id", flowId)
          .eq("telegram_chat_id", chatId);

        // Continue to next nodes
        await continueFromNode(currentNode.id, nodes, edges, TELEGRAM_BOT_TOKEN, chatId, userMessage, variables, supabase, flowId);
      }
    } else {
      // New conversation - check for start trigger
      const startNode = findStartNode(nodes);
      if (startNode) {
        const triggerCommand = startNode.data.content || "/start";
        
        if (userMessage === triggerCommand || userMessage === "/start") {
          // Clear any existing session
          await supabase
            .from("bot_sessions")
            .delete()
            .eq("flow_id", flowId)
            .eq("telegram_chat_id", chatId);

          await processNode(startNode, nodes, edges, TELEGRAM_BOT_TOKEN, chatId, userMessage, {}, supabase, flowId);
        }
      }
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
