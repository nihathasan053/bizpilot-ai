const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");

const menuBtn = document.getElementById("menuBtn");
const newChatBtn = document.getElementById("newChatBtn");
const newMobileBtn = document.getElementById("newMobileBtn");

const composer = document.getElementById("composer");
const input = document.getElementById("messageInput");
const chat = document.getElementById("chat");
const welcome = document.getElementById("welcome");

const suggestions = document.querySelectorAll(".suggestion");
const historyItems = document.querySelectorAll(".history-item");


/* =========================
   MOBILE SIDEBAR
========================= */

function openMenu() {
  sidebar.classList.add("open");
  overlay.classList.add("show");
}

function closeMenu() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

if (menuBtn) {
  menuBtn.addEventListener("click", openMenu);
}

if (overlay) {
  overlay.addEventListener("click", closeMenu);
}


/* =========================
   NEW CHAT
========================= */

function newChat() {

  chat.innerHTML = "";

  chat.appendChild(welcome);

  welcome.style.display = "";

  input.value = "";

  input.style.height = "auto";

  input.focus();

  closeMenu();
}


if (newChatBtn) {
  newChatBtn.addEventListener("click", newChat);
}

if (newMobileBtn) {
  newMobileBtn.addEventListener("click", newChat);
}


/* =========================
   ADD USER MESSAGE
========================= */

function addMessage(text) {

  if (welcome.parentElement) {
    welcome.style.display = "none";
  }

  const row = document.createElement("div");

  row.className = "message user";

  const bubble = document.createElement("div");

  bubble.className = "message-bubble";

  bubble.textContent = text;

  row.appendChild(bubble);

  chat.appendChild(row);

  chat.scrollTop = chat.scrollHeight;
}


/* =========================
   ADD AI MESSAGE
========================= */

function addAssistantMessage(text) {

  const row = document.createElement("div");

  row.className = "message assistant";

  const bubble = document.createElement("div");

  bubble.className = "message-bubble";

  bubble.textContent = text;

  row.appendChild(bubble);

  chat.appendChild(row);

  chat.scrollTop = chat.scrollHeight;
}


/* =========================
   SEND MESSAGE
========================= */

function sendMessage(text) {

  const cleanText = text.trim();

  if (!cleanText) {
    return;
  }

  addMessage(cleanText);

  input.value = "";

  input.style.height = "auto";


  /*
     Temporary AI response.

     পরে এখানে আসল BizPilot AI backend/API
     যুক্ত করা হবে।
  */

  setTimeout(function () {

    addAssistantMessage(
      "আমি আপনার প্রশ্নটি বুঝেছি। BizPilot AI-এর আসল AI response এখনো সংযুক্ত করা হয়নি। পরের ধাপে আমরা আপনার AI backend এখানে যুক্ত করব।"
    );

  }, 500);
}


/* =========================
   FORM SUBMIT
========================= */

if (composer) {

  composer.addEventListener("submit", function (event) {

    event.preventDefault();

    sendMessage(input.value);

  });

}


/* =========================
   ENTER = SEND
   SHIFT + ENTER = NEW LINE
========================= */

if (input) {

  input.addEventListener("keydown", function (event) {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage(input.value);

    }

  });


  /* Auto resize */

  input.addEventListener("input", function () {

    input.style.height = "auto";

    input.style.height =
      Math.min(input.scrollHeight, 160) + "px";

  });

}


/* =========================
   SUGGESTION BUTTONS
========================= */

suggestions.forEach(function (button) {

  button.addEventListener("click", function () {

    input.value = button.textContent.trim();

    input.focus();

    input.dispatchEvent(
      new Event("input")
    );

  });

});


/* =========================
   CHAT HISTORY
========================= */

historyItems.forEach(function (item) {

  item.addEventListener("click", function () {

    historyItems.forEach(function (historyItem) {

      historyItem.classList.remove("active");

    });

    item.classList.add("active");

    closeMenu();

  });

});
