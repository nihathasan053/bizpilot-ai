/**
 * BizPilot AI - Application Logic V2
 * Frontend navigation + AI modules
 */

const WORKER_ENDPOINT = "https://bizpilot-ai.nihathasan053.workers.dev";

document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // 1. STATE
    // =========================

    let preferredLanguage =
        localStorage.getItem("preferredLanguage") || "en";

    let queryCount =
        parseInt(
            localStorage.getItem("bizpilot_query_count") || "0",
            10
        );

    let isRequestInProgress = false;


    // =========================
    // 2. UI ELEMENTS
    // =========================

    const navItems =
        document.querySelectorAll(".nav-item");

    const tabPanes =
        document.querySelectorAll(".tab-pane");

    const pageTitle =
        document.getElementById("pageTitle");

    const menuToggle =
        document.getElementById("menuToggle");

    const sidebar =
        document.getElementById("sidebar");

    const mobileCloseBtn =
        document.getElementById("mobileCloseBtn");

    const statQueries =
        document.getElementById("statQueries");

    const languageSelect =
        document.getElementById("languageSelect");


    // =========================
    // 3. QUERY COUNTER
    // =========================

    if (statQueries) {
        statQueries.textContent = queryCount;
    }


    // =========================
    // 4. LANGUAGE
    // =========================

    if (languageSelect) {

        languageSelect.value =
            preferredLanguage;

        languageSelect.addEventListener(
            "change",
            (event) => {

                preferredLanguage =
                    event.target.value;

                localStorage.setItem(
                    "preferredLanguage",
                    preferredLanguage
                );
            }
        );
    }


    // =========================
    // 5. NAVIGATION
    // =========================

    navItems.forEach((item) => {

        item.addEventListener("click", () => {

            const targetTab =
                item.getAttribute("data-tab");

            if (!targetTab) {
                return;
            }

            // Remove active state
            navItems.forEach((nav) => {
                nav.classList.remove("active");
            });

            tabPanes.forEach((pane) => {
                pane.classList.remove("active");
            });

            // Activate clicked menu
            item.classList.add("active");

            // Find target page
            const activePane =
                document.getElementById(
                    targetTab + "Tab"
                );

            if (activePane) {
                activePane.classList.add("active");
            }

            // Change page title
            if (pageTitle) {
                pageTitle.textContent =
                    item.textContent.trim();
            }

            // Close mobile menu
            if (
                window.innerWidth <= 768 &&
                sidebar
            ) {
                sidebar.classList.remove("open");
            }

        });

    });


    // =========================
    // 6. MOBILE MENU
    // =========================

    if (menuToggle && sidebar) {

        menuToggle.addEventListener(
            "click",
            () => {
                sidebar.classList.add("open");
            }
        );
    }


    if (mobileCloseBtn && sidebar) {

        mobileCloseBtn.addEventListener(
            "click",
            () => {
                sidebar.classList.remove("open");
            }
        );
    }


    // =========================
    // 7. AI WORKER FUNCTION
    // =========================

    async function callAI(promptText) {

        if (isRequestInProgress) {
            return null;
        }

        isRequestInProgress = true;

        queryCount++;

        localStorage.setItem(
            "bizpilot_query_count",
            queryCount
        );

        if (statQueries) {
            statQueries.textContent =
                queryCount;
        }

        try {

            const response = await fetch(
                WORKER_ENDPOINT,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        prompt: promptText,
                        language:
                            preferredLanguage
                    })
                }
            );

            if (!response.ok) {

                throw new Error(
                    "Worker returned status " +
                    response.status
                );
            }

            const data =
                await response.json();

            return (
                data.reply ||
                data.response ||
                data.text ||
                "No response received."
            );

        } catch (error) {

            console.error(
                "BizPilot AI Error:",
                error
            );

            return (
                "Error: Unable to connect to the " +
                "BizPilot AI Worker. Please check " +
                "the Cloudflare Worker."
            );

        } finally {

            isRequestInProgress = false;
        }
    }


    // =========================
    // 8. MODULE HANDLER
    // =========================

    function setupModuleHandler(
        buttonId,
        inputId,
        outputId,
        promptFunction
    ) {

        const button =
            document.getElementById(buttonId);

        const input =
            document.getElementById(inputId);

        const output =
            document.getElementById(outputId);

        if (!button || !output) {
            return;
        }

        button.addEventListener(
            "click",
            async () => {

                if (isRequestInProgress) {
                    return;
                }

                const value =
                    input
                        ? input.value.trim()
                        : "";

                if (!value && input) {

                    output.textContent =
                        "Please enter your request first.";

                    return;
                }

                const prompt =
                    promptFunction(value);

                const originalText =
                    button.textContent;

                button.disabled = true;

                button.textContent =
                    "Processing...";

                output.textContent =
                    "Generating AI response...";

                const result =
                    await callAI(prompt);

                button.disabled = false;

                button.textContent =
                    originalText;

                output.textContent =
                    result ||
                    "No output generated.";
            }
        );
    }


    // =========================
    // 9. BUSINESS PLAN
    // =========================

    setupModuleHandler(
        "generatePlanBtn",
        "businessIdeaInput",
        "businessPlanOutput",
        (value) =>
            `Create a structured business plan for "${value}". Include executive summary, problem, solution, target market, business model, marketing strategy, operations, risks and next steps.`
    );


    // =========================
    // 10. MARKET RESEARCH
    // =========================

    setupModuleHandler(
        "runMarketResearchBtn",
        "marketResearchInput",
        "marketResearchOutput",
        (value) =>
            `Provide market research for "${value}". Include target customers, competitors, market trends, opportunities, risks and research questions. Clearly separate estimates from verified data.`
    );


    // =========================
    // 11. FINANCIAL PLANNER
    // =========================

    setupModuleHandler(
        "runFinancialPlanBtn",
        "financialQueryInput",
        "financialPlannerOutput",
        (value) =>
            `Create a practical financial projection for "${value}". Include assumptions, revenue, expenses, cash flow and break-even considerations. Clearly label estimates.`
    );


    // =========================
    // 12. AI BUSINESS COACH
    // =========================

    setupModuleHandler(
        "askCoachBtn",
        "coachQueryInput",
        "aiCoachOutput",
        (value) =>
            `Act as a practical business coach. Analyze this situation: "${value}". Give structured advice, priorities, risks and next actions.`
    );


    // =========================
    // 13. WEBSITE BUILDER
    // =========================

    setupModuleHandler(
        "generateWebsiteCopyBtn",
        "websiteQueryInput",
        "websiteBuilderOutput",
        (value) =>
            `Create a professional landing page structure for "${value}". Include headline, value proposition, sections, CTA, SEO title and meta description.`
    );


    // =========================
    // 14. MARKETING ASSISTANT
    // =========================

    setupModuleHandler(
        "generateMarketingBtn",
        "marketingQueryInput",
        "marketingAssistantOutput",
        (value) =>
            `Create marketing assets for "${value}". Include social media hooks, advertising ideas, email copy and a simple campaign plan.`
    );


    // =========================
    // 15. AI ASSISTANT CHAT
    // =========================

    const chatForm =
        document.getElementById("chatForm");

    const userInput =
        document.getElementById("userInput");

    const chatMessages =
        document.getElementById("chatMessages");


    if (
        chatForm &&
        userInput &&
        chatMessages
    ) {

        chatForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                const message =
                    userInput.value.trim();

                if (
                    !message ||
                    isRequestInProgress
                ) {
                    return;
                }

                appendChatMessage(
                    message,
                    "user-message"
                );

                userInput.value = "";

                const loading =
                    appendChatMessage(
                        "Thinking...",
                        "ai-message"
                    );

                const response =
                    await callAI(message);

                loading.remove();

                appendChatMessage(
                    response ||
                    "No response received.",
                    "ai-message"
                );
            }
        );
    }


    // =========================
    // 16. CHAT MESSAGE HELPER
    // =========================

    function appendChatMessage(
        text,
        className
    ) {

        const messageDiv =
            document.createElement("div");

        messageDiv.className =
            "message " + className;

        const contentDiv =
            document.createElement("div");

        contentDiv.className =
            "message-content";

        contentDiv.textContent =
            text;

        messageDiv.appendChild(
            contentDiv
        );

        chatMessages.appendChild(
            messageDiv
        );

        chatMessages.scrollTop =
            chatMessages.scrollHeight;

        return messageDiv;
    }


    // =========================
    // 17. INITIALIZATION
    // =========================

    console.log(
        "BizPilot AI V2 loaded successfully."
    );

});
