/**
 * BizPilot AI
 * Complete Application Script
 * V4
 */

const WORKER_ENDPOINT =
    "https://bizpilot-ai.nihathasan053.workers.dev";

document.addEventListener("DOMContentLoaded", function () {

    // =========================================
    // 1. GLOBAL STATE
    // =========================================

    let isRequestInProgress = false;

    let preferredLanguage =
        localStorage.getItem("preferredLanguage") || "English";

    let queryCount =
        parseInt(
            localStorage.getItem("bizpilot_query_count") || "0",
            10
        );

    // =========================================
    // 2. COMMON ELEMENTS
    // =========================================

    const navItems =
        document.querySelectorAll(".nav-item");

    const tabPanes =
        document.querySelectorAll(".tab-pane");

    const pageTitle =
        document.getElementById("pageTitle");

    const sidebar =
        document.querySelector(".sidebar");

    const menuToggle =
        document.querySelector(".menu-toggle");

    const mobileCloseBtn =
        document.querySelector(".mobile-close");

    const statQueries =
        document.getElementById("statQueries");

    // =========================================
    // 3. QUERY COUNTER
    // =========================================

    if (statQueries) {
        statQueries.textContent = queryCount;
    }

    // =========================================
    // 4. LANGUAGE
    // =========================================

    const languageSelector =
        document.getElementById("languageSelect") ||
        document.getElementById("languageSelector");

    if (languageSelector) {

        const savedLanguage =
            localStorage.getItem("preferredLanguage");

        if (savedLanguage) {
            languageSelector.value = savedLanguage;
        }

        languageSelector.addEventListener(
            "change",
            function () {

                preferredLanguage =
                    languageSelector.value;

                localStorage.setItem(
                    "preferredLanguage",
                    preferredLanguage
                );
            }
        );
    }

    // =========================================
    // 5. NAVIGATION
    // =========================================

    navItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function () {

                const targetTab =
                    item.getAttribute("data-tab");

                if (!targetTab) {
                    return;
                }

                navItems.forEach(function (nav) {
                    nav.classList.remove("active");
                });

                tabPanes.forEach(function (pane) {
                    pane.classList.remove("active");
                });

                item.classList.add("active");

                const activePane =
                    document.getElementById(
                        targetTab + "Tab"
                    );

                if (activePane) {
                    activePane.classList.add("active");
                }

                if (pageTitle) {
                    pageTitle.textContent =
                        item.textContent.trim();
                }

                if (
                    window.innerWidth <= 768 &&
                    sidebar
                ) {
                    sidebar.classList.remove("open");
                }
            }
        );
    });

    // =========================================
    // 6. MOBILE MENU
    // =========================================

    if (menuToggle && sidebar) {

        menuToggle.addEventListener(
            "click",
            function () {
                sidebar.classList.add("open");
            }
        );
    }

    if (mobileCloseBtn && sidebar) {

        mobileCloseBtn.addEventListener(
            "click",
            function () {
                sidebar.classList.remove("open");
            }
        );
    }

    // =========================================
    // 7. AI WORKER
    // =========================================

    async function callAI(promptText) {

        if (isRequestInProgress) {
            return null;
        }

        isRequestInProgress = true;

        try {

            console.log(
                "Sending request to BizPilot AI..."
            );

            const response =
                await fetch(
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

            const rawText =
                await response.text();

            console.log(
                "Worker status:",
                response.status
            );

            console.log(
                "Worker response:",
                rawText
            );

            if (!response.ok) {

                throw new Error(
                    "Worker error " +
                    response.status +
                    ": " +
                    rawText
                );
            }

            let data;

            try {

                data =
                    JSON.parse(rawText);

            } catch (error) {

                if (rawText.trim()) {
                    return rawText;
                }

                throw new Error(
                    "Worker returned an empty response."
                );
            }

            /*
             * Support multiple common Worker
             * response formats.
             */

            let result =
                data.reply ??
                data.response ??
                data.text ??
                data.result ??
                data.output ??
                data.content ??
                data.message;

            /*
             * Some APIs return:
             * { choices: [{ message: { content: "..." }}] }
             */

            if (
                !result &&
                data.choices &&
                Array.isArray(data.choices)
            ) {

                const choice =
                    data.choices[0];

                if (
                    choice &&
                    choice.message &&
                    choice.message.content
                ) {
                    result =
                        choice.message.content;
                }
            }

            /*
             * Another possible format:
             * { data: { reply: "..." } }
             */

            if (
                !result &&
                data.data &&
                typeof data.data === "object"
            ) {

                result =
                    data.data.reply ??
                    data.data.response ??
                    data.data.text ??
                    data.data.content ??
                    data.data.result;
            }

            if (
                typeof result === "string" &&
                result.trim()
            ) {

                return result.trim();
            }

            if (
                result &&
                typeof result === "object"
            ) {

                return JSON.stringify(
                    result,
                    null,
                    2
                );
            }

            /*
             * Never hide the actual Worker response.
             */

            return (
                "The AI returned no usable answer.\n\n" +
                "Worker response:\n" +
                rawText
            );

        } catch (error) {

            console.error(
                "BizPilot AI Error:",
                error
            );

            return (
                "Unable to generate the AI response.\n\n" +
                "Reason: " +
                error.message
            );

        } finally {

            isRequestInProgress = false;
        }
    }

    // =========================================
    // 8. DISPLAY RESULT
    // =========================================

    function showResult(
        output,
        result
    ) {

        if (!output) {
            return;
        }

        output.textContent =
            result ||
            "No output generated.";

        output.style.whiteSpace =
            "pre-wrap";

        output.style.wordBreak =
            "break-word";

        output.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });
    }

    // =========================================
    // 9. GENERIC AI MODULE
    // =========================================

    function setupModule(
        buttonId,
        inputId,
        outputId,
        promptBuilder
    ) {

        const button =
            document.getElementById(buttonId);
