import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const NODE_TYPES = [
  "start", "message", "image", "video", "audio", "document", "animation", "sticker",
  "buttonReply", "userInput", "condition", "poll", "contact", "venue", "location",
  "dice", "invoice", "editMessage", "deleteMessage", "mediaGroup", "action", "httpRequest", "delay"
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const systemPrompt = `You are a Telegram bot flow generator. Given a user description, generate a flow as JSON with "nodes" and "edges" arrays.

Available node types: ${NODE_TYPES.join(", ")}

Node structure:
{ "id": "unique_id", "type": "nodeType", "position": {"x": number, "y": number}, "data": { "type": "nodeType", "label": "Display Name", ...typeSpecificFields } }

Edge structure:
{ "id": "edge_id", "source": "source_node_id", "target": "target_node_id", "sourceHandle": "optional_handle" }

Type-specific data fields:
- start: { content: "/start" }
- message: { content: "text" }
- image: { imageUrl: "url", caption: "text" }
- video: { videoUrl: "url", caption: "text" }
- audio: { audioUrl: "url", caption: "text" }
- document: { documentUrl: "url", documentFilename: "name", caption: "text" }
- animation: { animationUrl: "url", caption: "text" }
- sticker: { stickerFileId: "file_id" }
- buttonReply: { content: "question text", buttons: [{id: "1", text: "Option"}] } (edges use sourceHandle "btn-{id}" for each button)
- userInput: { promptText: "question", variableName: "var_name" }
- condition: { condition: 'user.message == "value"' } (edges use sourceHandle "yes" or "no")
- poll: { pollQuestion: "question", pollOptions: ["opt1","opt2"], pollIsAnonymous: true, pollType: "regular" }
- contact: { contactPhone: "+1234", contactFirstName: "Name" }
- venue: { latitude: 0, longitude: 0, locationTitle: "Name", venueAddress: "Address" }
- location: { latitude: 0, longitude: 0, locationTitle: "Name" }
- dice: { diceEmoji: "🎲" }
- invoice: { invoiceTitle: "Title", invoiceDescription: "Desc", invoiceCurrency: "BRL", invoicePrice: 1000 }
- editMessage: { editMessageId: "{{last_message_id}}", editText: "new text" }
- deleteMessage: { deleteMessageId: "{{last_message_id}}" }
- mediaGroup: { mediaGroupItems: [{type:"photo",url:"url",caption:"text"}] }
- action: { action: "send_api_request" }
- httpRequest: { httpUrl: "url", httpMethod: "GET" }
- delay: { delay: 5, delayUnit: "seconds" }

IMPORTANT:
- Always start with a "start" node at position {x:400,y:80}
- Space nodes vertically by ~150px and horizontally by ~300px
- Connect nodes with edges
- Use descriptive labels in Portuguese
- Return ONLY valid JSON, no markdown or explanation
- Every node needs "type" in data matching the node type`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Gere um fluxo de bot Telegram para: ${prompt}` },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Payment required." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Extract JSON from response
    let flowJson;
    try {
      // Try direct parse
      flowJson = JSON.parse(content);
    } catch {
      // Try extracting from markdown code block
      const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) flowJson = JSON.parse(match[1]);
      else throw new Error("Could not parse AI response as JSON");
    }

    return new Response(JSON.stringify(flowJson), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-flow error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
