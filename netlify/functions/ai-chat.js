const https = require("https");
const { ensureDisclosure, prepareMessages, sanitizeReply } = require("./lib/chat-config");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(statusCode, payload) {
  return {
    statusCode: statusCode,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  };
}

exports.handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return json(400, { error: "Invalid JSON body." });
  }

  // The browser may only supply user and assistant turns. The system prompt
  // is attached here, and any client system message is discarded.
  const prepared = prepareMessages(body && body.messages);
  if (prepared.error) {
    return json(400, { error: prepared.error });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json(200, {
      reply: "Our AI assistant is temporarily unavailable. Please try again later or browse our guides for help with senior benefits.",
    });
  }

  let apiResponse;
  try {
    const postData = JSON.stringify({
      model: "gpt-4.1-mini",
      messages: prepared.messages,
      temperature: 0.9,
      max_tokens: 1000,
    });

    const options = {
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(postData),
      },
      timeout: 8000,
    };

    apiResponse = await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => resolve({ status: res.statusCode, data }));
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timed out"));
      });

      req.on("error", (error) => reject(error));
      req.write(postData);
      req.end();
    });
  } catch (error) {
    return json(200, {
      reply: "Our AI assistant is temporarily unavailable. Please try again in a moment, or explore our state-by-state guides for information on senior benefits.",
    });
  }

  if (apiResponse.status < 200 || apiResponse.status >= 300) {
    return json(200, {
      reply: "Our AI assistant is temporarily unavailable. Please try again in a moment, or explore our state-by-state guides for information on senior benefits.",
    });
  }

  let parsed;
  try {
    parsed = JSON.parse(apiResponse.data);
  } catch (err) {
    return json(200, {
      reply: "Our AI assistant encountered an issue processing your request. Please try again or browse our guides for help.",
    });
  }

  const rawReply =
    parsed &&
    parsed.choices &&
    parsed.choices[0] &&
    parsed.choices[0].message &&
    parsed.choices[0].message.content
      ? parsed.choices[0].message.content
      : "I'm not sure how to respond to that right now, but you can try asking again or browse our senior benefits guides for help.";

  const reply = ensureDisclosure(sanitizeReply(rawReply));

  return json(200, { reply });
};
