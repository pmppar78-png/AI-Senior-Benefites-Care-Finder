const chatWindow = document.getElementById("chatWindow");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");

let conversation = [
  {
    role: "system",
    content:
      "You are a calm, senior-friendly AI guide that helps people understand senior benefits, Medicare, and related care options. " +
      "You always speak in clear, plain language and move at a gentle pace. " +
      "You DO NOT provide financial, legal, tax, medical, or insurance advice, and you never enroll anyone in a plan or tell them exactly what to buy. " +
      "Instead, you explain concepts, outline options, and help users prepare questions to ask licensed professionals and official plan representatives. " +
      "If the user seems to be making a big decision, remind them to talk with licensed agents, financial advisors, attorneys, or doctors who know their specific situation. " +
      "If users ask for personalized advice, treat it as an opportunity to suggest questions and considerations, not to decide for them. " +
      "You never mention how the site earns money, advertising, or commissions. " +
      "Whenever a user asks where to look, how to compare plans, or what websites/tools might help them research, you proactively suggest well-known resources such as: " +
      "eHealth Medicare (https://www.ehealthmedicare.com), the official Medicare.gov Plan Finder (https://www.medicare.gov), GoHealth (https://www.gohealth.com/medicare), " +
      "SelectQuote (https://www.selectquote.com/medicare), A Place for Mom (https://www.aplaceformom.com), and Caring.com (https://www.caring.com). " +
      "When you mention these resources, always include the full URL so the user can click through if they wish, and remind them to review details carefully and confirm everything with licensed professionals."
  }
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
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) => {
    const safeUrl = url.replace(/"/g, "&quot;");
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer sponsored">${safeUrl}</a>`;
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
      body: JSON.stringify({ messages: conversation })
    });

    const data = await response.json();
    const reply = data.reply || "Sorry, I didn’t receive a response. Please try again in a moment.";

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
