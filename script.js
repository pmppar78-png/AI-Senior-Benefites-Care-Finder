const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");

// User turns only. The system prompt lives in the Netlify function.
let userMessages = [];

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
  "aarp.org"
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

function linkify(text) {
  if (!text) return "";
  // First escape HTML entities in the text
  const escaped = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const urlRegex = /(https?:\/\/[^\s<>&]+)/g;
  return escaped.replace(urlRegex, (url) => {
    const safeUrl = url.replace(/&amp;/g, "&").replace(/"/g, "&quot;");
    // Extract a clean display name from the URL
    let displayName;
    let host = "";
    try {
      const parsed = new URL(safeUrl);
      host = parsed.hostname.replace(/^www\./, "");
      displayName = host;
      // Add path context if meaningful
      const pathParts = parsed.pathname.split('/').filter(Boolean);
      if (pathParts.length > 0 && pathParts[0] !== 'index.html') {
        displayName += '/' + pathParts.join('/');
      }
    } catch (e) {
      displayName = safeUrl;
    }
    const official = host && NON_SPONSORED_HOSTS.some((suffix) => host === suffix || host.endsWith("." + suffix));
    const rel = official ? "noopener noreferrer" : "noopener noreferrer sponsored";
    return `<a href="${safeUrl}" target="_blank" rel="${rel}">${displayName}</a>`;
  });
}

async function sendMessage(message) {
  appendMessage("user", message);
  userMessages.push({ role: "user", content: message });

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
      body: JSON.stringify({ messages: userMessages })
    });

    const data = await response.json();
    const reply = data.reply || "Sorry, I didn’t receive a response. Please try again in a moment.";

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
