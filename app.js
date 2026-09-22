/**
 * BizPilot AI - Application Logic (V2 Complete)
 * Fully wired frontend for all 11 modules connecting to the Cloudflare Worker endpoint.
 * Preserves endpoint: https://bizpilot-ai.nihathasan053.workers.dev
 */

const WORKER_ENDPOINT = "https://bizpilot-ai.nihathasan053.workers.dev";

document.addEventListener("DOMContentLoaded", () => {

    // 1. State Management & Initialization
    let preferredLanguage =
        localStorage.getItem("preferredLanguage") || "en";

    let queryCount =
        parseInt(localStorage.getItem("bizpilot_query_count") || "0", 10);


    // UI Elements - Navigation & Sidebar
    const navItems = document.querySelectorAll(".nav-item");
    const tabPanes = document.querySelectorAll(".tab-pane");

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


    // Initialize Dashboard Query Count
    if (statQueries) {
        statQueries.textContent = queryCount;
    }


    // Initialize Language Selector
    if (languageSelect) {

        languageSelect.value = preferredLanguage;

        languageSelect.addEventListener("change", (e) => {

            preferredLanguage = e.target.value;

            localStorage.setItem(
                "preferredLanguage",
                preferredLanguage
            );

        });
    }


    // 2. Navigation Tab Switching
    navItems.forEach(item => {

        item.addEventListener("click", () => {

            const targetTab =
                item.getAttribute("data-tab");

            if (!targetTab) return;


            navItems.forEach(nav =>
                nav.classList.remove("active")
            );

            tabPanes.forEach(pane =>
                pane.classList.remove("active")
            );


            item.classList.add("active");


            const activePane =
                document.getElementById(`${targetTab}Tab`);

            if (activePane) {
                activePane.classList.add("active");
            }


            if (pageTitle) {
                pageTitle.textContent =
                    item.textContent.trim();
            }


            // Close sidebar on mobile upon navigation
            if (
                window.innerWidth <= 768 &&
                sidebar
            ) {
                sidebar.classList.remove("open");
            }

        });

    });


    // Mobile Sidebar Toggles
    if (menuToggle && sidebar) {

        menuToggle.addEventListener("click", () => {
            sidebar.classList.add("open");
        });

    }


    if (mobileCloseBtn && sidebar) {

        mobileCloseBtn.addEventListener("click", () => {
            sidebar.classList.remove("open");
        });

    }


    // 3. Reusable AI Worker Call Function
    // with Request Lock & Error Handling

    let isRequestInProgress = false;


    async function callAI(promptText) {

        if (isRequestInProgress) return null;

        isRequestInProgress = true;


        // Increment query count
        queryCount++;

        localStorage.setItem(
            "bizpilot_query_count",
            queryCount
        );


        if (statQueries) {
            statQueries.textContent = queryCount;
        }


        try {

            const response =
