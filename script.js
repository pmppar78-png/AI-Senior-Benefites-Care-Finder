const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");

// Conversation history (user and assistant turns). The system prompt lives in
// the Netlify function, which drops any other role.
let chatHistory = [];

const NON_SPONSORED_HOSTS = [
  "medicare.gov",
  "medicaid.gov",
  "va.gov",
  "ssa.gov",
  "usa.gov",
  "shiphelp.org",
  "naela.org",
  "dav.org",
  "benefitscheckup.org",
  "211.org",
  "rxassist.org",
  "needymeds.org",
  "acl.gov",
  "aarp.org",
  "usda.gov"
];

function appendMessage(role, text) {
  if (!chatWindow) return;
  const row = document.createElement("div");
  row.className = "message-row " + (role === "user" ? "user" : "assistant");

  const bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.innerHTML = linkify(text);

  row.appendChild(bubble);
  chatWindow.appendChild(row);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

const reEsc = (x) => String(x).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// When the reply already names the link right before it ("Home Instead (https://...)" or
// "Home Instead: https://..."), keep one copy of the name: the link itself.
function collapseNamedLinks(text, labels) {
  if (!labels) return text;
  let out = text;
  for (const [url, label] of Object.entries(labels)) {
    const u = reEsc(url.replace(/\/$/, "")) + "\\/?";
    out = out.replace(new RegExp(reEsc(label) + "\\s*\\(\\s*(" + u + ")\\s*\\)", "g"), "$1");
    out = out.replace(new RegExp(reEsc(label) + "\\s*[:\\u2013\\u2014-]\\s*(" + u + ")", "g"), "$1");
    out = out.replace(new RegExp(reEsc(label) + "\\s+(" + u + ")", "g"), "$1");
  }
  return out;
}

function linkify(text, labels) {
  if (!text) return "";
  text = collapseNamedLinks(text, labels);
  // First escape HTML entities in the text
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const urlRegex = /(https?:\/\/[^\s<>&]+)/g;
  return escaped.replace(urlRegex, (match) => {
    // Keep trailing punctuation and an unbalanced closing bracket out of the link.
    let url = match;
    let trail = "";
    for (;;) {
      const last = url.slice(-1);
      if (/[.,;:!?'"]/.test(last)) {
        trail = last + trail;
        url = url.slice(0, -1);
      } else if (last === ")" && (url.match(/\(/g) || []).length < (url.match(/\)/g) || []).length) {
        trail = last + trail;
        url = url.slice(0, -1);
      } else if (last === "]" ) {
        trail = last + trail;
        url = url.slice(0, -1);
      } else {
        break;
      }
    }
    const safeUrl = url.replace(/&amp;/g, "&").replace(/"/g, "&quot;");
    // Extract a clean display name from the URL
    // Readable link text: the organization or page name the server sends for approved links,
    // otherwise the site's name (host). The full address stays in href and in the tooltip.
    let displayName;
    let host = "";
    const rawUrl = url.replace(/&amp;/g, "&");
    const label = labels && (labels[rawUrl] || labels[rawUrl.replace(/\/$/, "")] || labels[rawUrl + "/"]);
    try {
      const parsed = new URL(safeUrl);
      host = parsed.hostname.replace(/^www\./, "");
      displayName = label || host;
    } catch (e) {
      displayName = label || safeUrl;
    }
    displayName = String(displayName).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const official = host && (host.endsWith(".gov") || NON_SPONSORED_HOSTS.some((suffix) => host === suffix || host.endsWith("." + suffix)));
    const rel = official ? "noopener noreferrer" : "noopener noreferrer sponsored";
    return `<a href="${safeUrl}" target="_blank" rel="${rel}" title="${safeUrl}">${displayName}</a>` + trail;
  });
}

async function sendMessage(message) {
  appendMessage("user", message);
  chatHistory.push({ role: "user", content: message });

  const pendingRow = document.createElement("div");
  pendingRow.className = "message-row assistant";
  const pendingBubble = document.createElement("div");
  pendingBubble.className = "message-bubble";
  pendingBubble.textContent = "Thinking…";
  pendingRow.appendChild(pendingBubble);
  chatWindow.appendChild(pendingRow);
  chatWindow.scrollTop = chatWindow.scrollHeight;

  try {
    const response = await fetch("/.netlify/functions/ai-chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages: chatHistory.slice(-16) })
    });

    const data = await response.json();
    const reply = data.reply || "Sorry, I didn’t receive a response. Please try again in a moment.";

    pendingBubble.innerHTML = linkify(reply, data.links);
    if (data.reply) chatHistory.push({ role: "assistant", content: data.reply });
  } catch (err) {
    pendingBubble.textContent =
      "I ran into a technical issue reaching the AI service. Please try again in a moment.";
    console.error(err);
  } finally {
    chatWindow.scrollTop = chatWindow.scrollHeight;
  }
}

if (chatForm && userInput) {
  chatForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;
    userInput.value = "";
    sendMessage(text);
  });

  userInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      chatForm.dispatchEvent(new Event("submit"));
    }
  });
}
