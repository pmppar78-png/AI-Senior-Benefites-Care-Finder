const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");

// The system prompt lives in the Netlify function. This array is only the
// visible conversation, and the server ignores any system role.
let conversation = [];

const COMMERCIAL_HOSTS = {
  "aplaceformom.com": true,
  "caring.com": true,
  "seniorliving.org": true,
  "care.com": true,
  "homeinstead.com": true,
  "visitingangels.com": true,
  "goodrx.com": true,
  "legalzoom.com": true,
  "medicalguardian.com": true,
  "bayalarmmedical.com": true
};

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

function linkRel(hostname) {
  const host = String(hostname || "").toLowerCase().replace(/^www\./, "");
  if (COMMERCIAL_HOSTS[host]) return "noopener noreferrer sponsored";
  return "noopener noreferrer";
}

function linkify(text) {
  if (!text) return "";
  // First escape HTML entities in the text
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const urlRegex = /(https?:\/\/[^\s<>&]+)/g;
  return escaped.replace(urlRegex, (url) => {
    const safeUrl = url.replace(/&amp;/g, "&").replace(/"/g, "&quot;");
    // Extract a clean display name from the URL
    let displayName;
    let rel = "noopener noreferrer";
    try {
      const parsed = new URL(safeUrl);
      rel = linkRel(parsed.hostname);
      displayName = parsed.hostname.replace(/^www\./, '');
      // Add path context if meaningful
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0 && pathParts[0] !== 'index.html') {
        displayName += '/' + pathParts.join('/');
      }
    } catch (e) {
      displayName = safeUrl;
    }
    return `<a href="${safeUrl}" target="_blank" rel="${rel}">${displayName}</a>`;
  });
}

async function sendMessage(message) {
  appendMessage("user", message);
  conversation.push({ role: "user", content: message });

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
      body: JSON.stringify({
        messages: conversation.filter((entry) => entry.role === "user" || entry.role === "assistant")
      })
    });

    const data = await response.json();
    const reply = data.reply || data.error || "Sorry, I didn’t receive a response. Please try again in a moment.";

    conversation.push({ role: "assistant", content: reply });

    pendingBubble.innerHTML = linkify(reply);
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
