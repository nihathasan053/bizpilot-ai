/**
 * BizPilot AI
 * Complete frontend application logic
 * Preserves Cloudflare Worker endpoint
 */

const WORKER_ENDPOINT =
  "https://bizpilot-ai.nihathasan053.workers.dev";

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  /* =========================
     GLOBAL STATE
  ========================= */

  const state = {
    language: localStorage.getItem("preferredLanguage") || "English",
    queryCount: Number(localStorage.getItem("bizpilot_query_count") || 0)
  };

  /* =========================
     HELPERS
  ========================= */

  function $(selector) {
    return document.querySelector(selector);
  }

  function $$(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setText(element, text) {
    if (element) element.textContent = text;
  }

  function saveState() {
    localStorage.setItem(
      "preferredLanguage",
      state.language
    );

    localStorage.setItem(
      "bizpilot_query_count",
      String(state.queryCount)
    );
  }

  function findElement(selectors) {
    for (const selector of selectors) {
      const element = $(selector);
      if (element) return element;
    }
    return null;
  }

  /* =========================
     INITIALIZE
  ========================= */

  initializeNavigation();
  initializeLanguage();
  initializeBusinessPlan();
  initializeGenericTools();
  initializeSettings();
  updateUsageDisplay();

  /* =========================
     NAVIGATION
  ========================= */

  function initializeNavigation() {
    const navItems = $$(
      "[data-tab], .nav-item, .sidebar-item, .menu-item"
    );

    navItems.forEach((item) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();

        const target =
          item.dataset.tab ||
          item.dataset.target ||
          item.getAttribute("href")?.replace("#", "");

        if (!target) return;

        switchTab(target);

        navItems.forEach((nav) =>
          nav.classList.remove("active")
        );

        item.classList.add("active");
      });
    });
  }

  function switchTab(target) {
    const normalized = String(target)
      .toLowerCase()
      .replace(/\s+/g, "-");

    const sections = $$(
      ".tab-content, .page-section, .content-section, [data-section]"
    );

    let found = false;

    sections.forEach((section) => {
      const id = String(section.id || "")
        .toLowerCase();

      const dataSection = String(
        section.dataset.section || ""
      ).toLowerCase();

      const matches =
        id === normalized ||
        dataSection === normalized ||
        id === normalized.replace("-tab", "");

      if (matches) {
        section.style.display = "";
        section.classList.add("active");
        found = true;
      } else {
        section.style.display = "none";
        section.classList.remove("active");
      }
    });

    if (!found) {
      const direct =
        document.getElementById(target) ||
        document.getElementById(normalized);

      if (direct) {
        direct.style.display = "";
        direct.classList.add("active");
      }
    }
  }

  /* =========================
     LANGUAGE
  ========================= */

  function initializeLanguage() {
    const selectors = $$(
      "#languageSelect, #language-selector, select[name='language']"
    );

    selectors.forEach((select) => {
      select.value = state.language;

      select.addEventListener("change", () => {
        state.language = select.value;
        saveState();

        selectors.forEach((other) => {
          other.value = state.language;
        });
      });
    });
  }

  /* =========================
     BUSINESS PLAN GENERATOR
  ========================= */

  function initializeBusinessPlan() {
    const input = findElement([
      "#businessIdea",
      "#business-idea",
      "#businessInput",
      "#ideaInput",
      "textarea[placeholder*='business']",
      "textarea"
    ]);

    const button = findElement([
      "#generateBusinessPlan",
      "#generate-business-plan",
      "#generatePlan",
      ".generate-business-plan",
      "button"
    ]);

    if (!input || !button) return;

    /*
     * Only attach to the correct generator button.
     * Avoid hijacking unrelated buttons.
     */
    let generateButton = button;

    const candidates = $$("button");

    const specific = candidates.find((btn) => {
      const text = btn.textContent.toLowerCase();

      return (
        text.includes("generate business plan") ||
        text.includes("generate plan")
      );
    });

    if (specific) {
      generateButton = specific;
    }

    generateButton.addEventListener("click", async (event) => {
      event.preventDefault();

      const idea = input.value.trim();

      if (!idea) {
        showGeneratorMessage(
          "Please enter a business idea first.",
          "error"
        );
        input.focus();
        return;
      }

      await generateBusinessPlan(idea);
    });
  }

  async function generateBusinessPlan(idea) {
    const resultBox = findElement([
      "#businessPlanResult",
      "#business-plan-result",
      "#generatedBusinessPlan",
      "#generated-business-plan",
      ".business-plan-result",
      ".generated-result",
      ".result-box"
    ]);

    const button = findElement([
      "#generateBusinessPlan",
      "#generate-business-plan",
      "#generatePlan"
    ]);

    if (button) {
      button.disabled = true;
      button.textContent = "Generating...";
    }

    if (resultBox) {
      resultBox.style.display = "";
      resultBox.textContent =
        "Generating your business plan...";
    }

    try {
      /*
       * Try the existing Worker API first.
       */
      const response = await fetch(WORKER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "business_plan",
          type: "business_plan",
          prompt: idea,
          businessIdea: idea,
          query: idea,
          language: state.language
        })
      });

      const rawText = await response.text();

      let data = null;

      try {
        data = JSON.parse(rawText);
      } catch {
        data = {
          text: rawText
        };
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          `API error: ${response.status}`
        );
      }

      const generatedText = extractGeneratedText(data);

      if (!generatedText) {
        throw new Error(
          "The AI API returned an empty response."
        );
      }

      state.queryCount += 1;
      saveState();
      updateUsageDisplay();

      displayBusinessPlan(
        resultBox,
        generatedText,
        idea
      );
    } catch (error) {
      console.error("BizPilot AI error:", error);

      /*
       * Important:
       * Never leave the user with only the original
       * placeholder. Show a useful error message.
       */
      if (resultBox) {
        resultBox.innerHTML = `
          <div class="bp-error">
            <h3>Unable to generate the AI plan</h3>
            <p>${escapeHTML(error.message)}</p>
            <p>
              Check that the Cloudflare Worker is running
              and that its AI/API key has available credits.
            </p>
          </div>
        `;
      }
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = "Generate Business Plan";
      }
    }
  }

  function extractGeneratedText(data) {
    if (!data) return "";

    const possibleValues = [
      data.text,
      data.output,
      data.response,
      data.result,
      data.content,
      data.answer,
      data.message,
      data.generatedText,
      data.plan,
      data.businessPlan,
      data.data?.text,
      data.data?.output,
      data.data?.response,
      data.data?.content,
      data.data?.answer,
      data.choices?.[0]?.message?.content,
      data.choices?.[0]?.text
    ];

    for (const value of possibleValues) {
      if (
        typeof value === "string" &&
        value.trim()
      ) {
        return value.trim();
      }
    }

    return "";
  }

  function displayBusinessPlan(
    resultBox,
    text,
    idea
  ) {
    if (!resultBox) {
      console.warn(
        "Business plan result element not found."
      );
      return;
    }

    const formatted = formatAIText(text);

    resultBox.innerHTML = `
      <div class="bp-result">
        <div class="bp-result-header">
          <h2>Generated Business Plan</h2>
          <p>
            Business idea:
            <strong>${escapeHTML(idea)}</strong>
          </p>
        </div>

        <div class="bp-result-body">
          ${formatted}
        </div>
      </div>
    `;

    resultBox.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }

  function showGeneratorMessage(message, type) {
    const resultBox = findElement([
      "#businessPlanResult",
      "#business-plan-result",
      "#generatedBusinessPlan",
      "#generated-business-plan",
      ".business-plan-result",
      ".generated-result",
      ".result-box"
    ]);

    if (!resultBox) return;

    resultBox.innerHTML = `
      <div class="bp-message ${escapeHTML(type)}">
        ${escapeHTML(message)}
      </div>
    `;
  }

  function formatAIText(text) {
    const safe = escapeHTML(text);

    return safe
      .split(/\n{2,}/)
      .map((paragraph) => {
        const trimmed = paragraph.trim();

        if (!trimmed) return "";

        if (/^#{1,3}\s/.test(trimmed)) {
          const title = trimmed.replace(/^#{1,3}\s/, "");
          return `<h3>${title}</h3>`;
        }

        if (/^[-*]\s/.test(trimmed)) {
          const items = trimmed
            .split("\n")
            .map((line) =>
              line.replace(/^[-*]\s/, "").trim()
            )
            .filter(Boolean)
            .map((item) => `<li>${item}</li>`)
            .join("");

          return `<ul>${items}</ul>`;
        }

        return `<p>${trimmed.replace(/\n/g, "<br>")}</p>`;
      })
      .join("");
  }

  /* =========================
     GENERIC AI TOOLS
  ========================= */

  function initializeGenericTools() {
    $$("button").forEach((button) => {
      if (button.dataset.bizpilotBound === "true") {
        return;
      }

      const text = button.textContent
        .trim()
        .toLowerCase();

      if (
        text.includes("market research") ||
        text.includes("financial plan") ||
        text.includes("marketing") ||
        text.includes("business coach") ||
        text.includes("ai assistant") ||
        text.includes("website")
      ) {
        button.dataset.bizpilotBound = "true";

        button.addEventListener("click", () => {
          handleGenericTool(button, text);
        });
      }
    });
  }

  async function handleGenericTool(button, buttonText) {
    const input = findElement([
      "textarea:focus",
      "input:focus",
      "#businessIdea",
      "#business-idea"
    ]);

    const value = input?.value?.trim();

    if (!value) {
      showTemporaryMessage(
        "Enter your business idea or question first."
      );
      return;
    }

    const originalText = button.textContent;

    button.disabled = true;
    button.textContent = "Working...";

    try {
      const response = await fetch(WORKER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          action: "assistant",
          type: "assistant",
          prompt: `${buttonText}: ${value}`,
          query: value,
          language: state.language
        })
      });

      const raw = await response.text();

      let data;

      try {
        data = JSON.parse(raw);
      } catch {
        data = { text: raw };
      }

      if (!response.ok) {
        throw new Error(
          data?.error ||
          data?.message ||
          `Request failed: ${response.status}`
        );
      }

      const text = extractGeneratedText(data);

      if (!text) {
        throw new Error("No AI response was returned.");
      }

      state.queryCount += 1;
      saveState();
      updateUsageDisplay();

      showTemporaryMessage(text);
    } catch (error) {
      console.error(error);

      showTemporaryMessage(
        `AI request failed: ${error.message}`
      );
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  }

  function showTemporaryMessage(message) {
    let box = $("#bizpilot-toast");

    if (!box) {
      box = document.createElement("div");
      box.id = "bizpilot-toast";

      Object.assign(box.style, {
        position: "fixed",
        right: "20px",
        bottom: "20px",
        maxWidth: "420px",
        padding: "16px",
        background: "#111827",
        color: "#ffffff",
        borderRadius: "10px",
        zIndex: "99999",
        whiteSpace: "pre-wrap",
        boxShadow: "0 10px 30px rgba(0,0,0,.3)"
      });

      document.body.appendChild(box);
    }

    box.textContent = message;
    box.style.display = "block";

    clearTimeout(box._timer);

    box._timer = setTimeout(() => {
      box.style.display = "none";
    }, 8000);
  }

  /* =========================
     USAGE
  ========================= */

  function updateUsageDisplay() {
    const elements = $$(
      "#queryCount, #usageCount, .query-count, .usage-count"
    );

    elements.forEach((element) => {
      element.textContent = String(state.queryCount);
    });
  }

  /* =========================
     SETTINGS
  ========================= */

  function initializeSettings() {
    const saveButtons = $$(
      "#saveSettings, .save-settings, button"
    );

    saveButtons.forEach((button) => {
      const text = button.textContent
        .trim()
        .toLowerCase();

      if (!text.includes("save settings")) {
        return;
      }

      button.addEventListener("click", () => {
        const language = findElement([
          "#languageSelect",
          "#language-selector",
          "select[name='language']"
        ]);

        if (language) {
          state.language = language.value;
        }

        saveState();

        showTemporaryMessage(
          "Settings saved successfully."
        );
      });
    });
  }

  /* =========================
     GLOBAL ERROR HANDLING
  ========================= */

  window.addEventListener("error", (event) => {
    console.error(
      "BizPilot AI frontend error:",
      event.error || event.message
    );
  });

  window.addEventListener(
    "unhandledrejection",
    (event) => {
      console.error(
        "BizPilot AI promise error:",
        event.reason
      );
    }
  );

  console.log(
    "BizPilot AI initialized successfully."
  );
});
