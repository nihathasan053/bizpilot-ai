document.addEventListener('DOMContentLoaded', () => {
    const WORKER_URL = 'https://bizpilot-ai.nihathasan053.workers.dev';

    // 1. Sidebar Navigation
    const navItems = document.querySelectorAll('[data-tab]');
    const allTabIds = [
        'dashboardTab', 'businessPlanTab', 'marketResearchTab', 
        'financialPlannerTab', 'aiCoachTab', 'websiteBuilderTab', 
        'marketingAssistantTab', 'assistantTab', 'analyticsTab', 
        'pricingTab', 'settingsTab'
    ];

    function switchTab(tabName) {
        allTabIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (id === tabName + 'Tab') {
                    el.style.display = 'block';
                    el.classList.add('active');
                } else {
                    el.style.display = 'none';
                    el.classList.remove('active');
                }
            }
        });

        navItems.forEach(nav => {
            if (nav.getAttribute('data-tab') === tabName) {
                nav.classList.add('active');
            } else {
                nav.classList.remove('active');
            }
        });
    }

    navItems.forEach(nav => {
        nav.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = nav.getAttribute('data-tab');
            if (tabName) {
                switchTab(tabName);
            }
        });
    });

    // Default to Dashboard on load
    switchTab('dashboard');

    // Helper to get current language
    function getCurrentLanguage() {
        const langSelect = document.getElementById('languageSelect');
        return langSelect ? langSelect.value : 'en';
    }

    // Safe Worker API Caller with proper payload format
    async function callWorker(action, promptText) {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action: action,
                prompt: promptText,
                language: getCurrentLanguage()
            })
        });

        if (!response.ok) {
            throw new Error(`Worker returned status ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data.output || data.response || data.result || data.message || JSON.stringify(data);
    }

    // Safe output renderer using textContent to prevent unsafe innerHTML injection
    function renderOutput(outputEl, text, isError = false) {
        if (!outputEl) return;
        outputEl.innerHTML = '';
        const wrapper = document.createElement('div');
        wrapper.style.padding = '12px';
        wrapper.style.borderRadius = '6px';
        wrapper.style.marginTop = '10px';
        wrapper.style.lineHeight = '1.6';

        if (isError) {
            wrapper.style.background = 'rgba(239, 68, 68, 0.1)';
            wrapper.style.color = '#ef4444';
            wrapper.textContent = `Error: ${text}`;
        } else {
            wrapper.style.background = 'rgba(16, 185, 129, 0.05)';
            wrapper.style.color = 'inherit';
            wrapper.textContent = text;
        }
        outputEl.appendChild(wrapper);
    }

    // Generic module runner with button state protection and safe error handling
    async function handleModule(buttonId, inputId, outputId, actionName, loadingText) {
        const btn = document.getElementById(buttonId);
        const input = document.getElementById(inputId);
        const output = document.getElementById(outputId);

        if (!btn || !input || !output) return;

        const originalText = btn.textContent;
        const promptText = input.value.trim();

        if (!promptText) {
            renderOutput(output, 'Please enter a query or description first.', true);
            return;
        }

        btn.disabled = true;
        btn.textContent = loadingText;
        renderOutput(output, 'Processing request...');

        try {
            const result = await callWorker(actionName, promptText);
            renderOutput(output, result, false);
        } catch (err) {
            renderOutput(output, err.message || 'An unexpected error occurred.', true);
        } finally {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }

    // 1. Business Plan Generator
    const generatePlanBtn = document.getElementById('generatePlanBtn');
    if (generatePlanBtn) {
        generatePlanBtn.addEventListener('click', () => {
            handleModule('generatePlanBtn', 'businessIdeaInput', 'businessPlanOutput', 'businessPlan', 'Generating Plan...');
        });
    }

    // 2. Market Research
    const runMarketResearchBtn = document.getElementById('runMarketResearchBtn');
    if (runMarketResearchBtn) {
        runMarketResearchBtn.addEventListener('click', () => {
            handleModule('runMarketResearchBtn', 'marketResearchInput', 'marketResearchOutput', 'marketResearch', 'Researching...');
        });
    }

    // 3. Financial Planner
    const runFinancialPlanBtn = document.getElementById('runFinancialPlanBtn');
    if (runFinancialPlanBtn) {
        runFinancialPlanBtn.addEventListener('click', () => {
            handleModule('runFinancialPlanBtn', 'financialQueryInput', 'financialPlannerOutput', 'financialPlanner', 'Analyzing...');
        });
    }

    // 4. AI Coach
    const askCoachBtn = document.getElementById('askCoachBtn');
    if (askCoachBtn) {
        askCoachBtn.addEventListener('click', () => {
            handleModule('askCoachBtn', 'coachQueryInput', 'aiCoachOutput', 'aiCoach', 'Consulting...');
        });
    }

    // 5. Website Builder
    const generateWebsiteCopyBtn = document.getElementById('generateWebsiteCopyBtn');
    if (generateWebsiteCopyBtn) {
        generateWebsiteCopyBtn.addEventListener('click', () => {
            handleModule('generateWebsiteCopyBtn', 'websiteQueryInput', 'websiteBuilderOutput', 'websiteBuilder', 'Generating Copy...');
        });
    }

    // 6. Marketing Assistant
    const generateMarketingBtn = document.getElementById('generateMarketingBtn');
    if (generateMarketingBtn) {
        generateMarketingBtn.addEventListener('click', () => {
            handleModule('generateMarketingBtn', 'marketingQueryInput', 'marketingAssistantOutput', 'marketingAssistant', 'Generating Strategy...');
        });
    }

    // 7. Assistant Chat
    const chatForm = document.getElementById('chatForm');
    const userInput = document.getElementById('userInput');
    const chatMessages = document.getElementById('chatMessages');

    if (chatForm && userInput && chatMessages) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = userInput.value.trim();
            if (!text) return;

            // Append user message securely
            const userMsgDiv = document.createElement('div');
            userMsgDiv.style.margin = '8px 0';
            userMsgDiv.style.textAlign = 'right';
            const userSpan = document.createElement('span');
            userSpan.style.background = '#3b82f6';
            userSpan.style.color = 'white';
            userSpan.style.padding = '8px 12px';
            userSpan.style.borderRadius = '8px';
            userSpan.style.display = 'inline-block';
            userSpan.textContent = text;
            userMsgDiv.appendChild(userSpan);
            chatMessages.appendChild(userMsgDiv);

            userInput.value = '';
            chatMessages.scrollTop = chatMessages.scrollHeight;

            try {
                const result = await callWorker('assistant', text);
                const aiMsgDiv = document.createElement('div');
                aiMsgDiv.style.margin = '8px 0';
                aiMsgDiv.style.textAlign = 'left';
                const aiSpan = document.createElement('span');
                aiSpan.style.background = '#1f2937';
                aiSpan.style.color = 'white';
                aiSpan.style.padding = '8px 12px';
                aiSpan.style.borderRadius = '8px';
                aiSpan.style.display = 'inline-block';
                aiSpan.textContent = result;
                aiMsgDiv.appendChild(aiSpan);
                chatMessages.appendChild(aiMsgDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            } catch (err) {
                const errorMsgDiv = document.createElement('div');
                errorMsgDiv.style.margin = '8px 0';
                errorMsgDiv.style.color = '#ef4444';
                errorMsgDiv.textContent = `Error: ${err.message}`;
                chatMessages.appendChild(errorMsgDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
        });
    }
});
