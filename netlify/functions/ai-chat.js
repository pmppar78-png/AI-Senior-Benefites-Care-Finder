const https = require("https");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

exports.handler = async (event) => {
  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({
        reply: "Our AI assistant is temporarily unavailable. Please try again later or browse our guides for help with senior benefits.",
      }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch (err) {
    return {
      statusCode: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body." }),
    };
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];

  let apiResponse;
  try {
    const postData = JSON.stringify({
      model: "gpt-4.1-mini",
      messages,
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
    // Network error or timeout — return safe 200 fallback, never 5xx
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({
        reply: "Our AI assistant is temporarily unavailable. Please try again in a moment, or explore our state-by-state guides for information on senior benefits.",
      }),
    };
  }

  // If OpenAI returned an error, return a safe 200 with fallback message
  if (apiResponse.status < 200 || apiResponse.status >= 300) {
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({
        reply: "Our AI assistant is temporarily unavailable. Please try again in a moment, or explore our state-by-state guides for information on senior benefits.",
      }),
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(apiResponse.data);
  } catch (err) {
    return {
      statusCode: 200,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({
        reply: "Our AI assistant encountered an issue processing your request. Please try again or browse our guides for help.",
      }),
    };
  }

  const reply =
    parsed &&
    parsed.choices &&
    parsed.choices[0] &&
    parsed.choices[0].message &&
    parsed.choices[0].message.content
      ? parsed.choices[0].message.content
      : "I'm not sure how to respond to that right now, but you can try asking again or browse our senior benefits guides for help.";

  return {
    statusCode: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    body: JSON.stringify({ reply }),
  };
};
