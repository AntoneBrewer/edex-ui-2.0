class AICopilot {
    constructor() {
        const fs = require("fs");
        const path = require("path");

        this._open = false;
        this._watching = false;
        this._buffer = "";
        this._busy = false;
        this._lastCommand = "";

        this.settingsDir = require("@electron/remote").app.getPath("userData");
        this.configFile = path.join(this.settingsDir, "ai-copilot.json");
        this._loadConfig();

        // Mount panel
        let panel = document.createElement("section");
        panel.setAttribute("id", "ai_copilot");
        panel.setAttribute("class", "closed");
        panel.innerHTML = `
            <div id="ai_copilot_header">
                <h3>AI COPILOT</h3>
                <button id="ai_copilot_close" title="Close">×</button>
            </div>
            <div id="ai_copilot_actions">
                <button data-action="explain">EXPLAIN LAST ERROR</button>
                <button data-action="translate">NL → COMMAND</button>
                <button data-action="suggest">SUGGEST NEXT</button>
                <label class="ai_copilot_watch">
                    <input type="checkbox" id="ai_copilot_watch"> Watch terminal
                </label>
            </div>
            <div id="ai_copilot_messages"></div>
            <div id="ai_copilot_input">
                <input type="text" id="ai_copilot_query" placeholder="Ask anything, or describe a command…" />
                <button id="ai_copilot_send">SEND</button>
            </div>
            <div id="ai_copilot_footer">
                <button id="ai_copilot_setup">⚙ Setup API key</button>
                <span id="ai_copilot_status"></span>
            </div>
        `;
        document.body.appendChild(panel);
        this.panel = panel;

        // Hover toggle tab
        let tab = document.createElement("div");
        tab.setAttribute("id", "ai_copilot_tab");
        tab.innerHTML = "<span>AI</span>";
        tab.addEventListener("click", () => this.toggle());
        document.body.appendChild(tab);
        this.tab = tab;

        document.getElementById("ai_copilot_close").addEventListener("click", () => this.close());
        document.getElementById("ai_copilot_setup").addEventListener("click", () => this.openSetup());
        document.getElementById("ai_copilot_send").addEventListener("click", () => this.handleSend());
        document.getElementById("ai_copilot_query").addEventListener("keydown", e => {
            if (e.key === "Enter") this.handleSend();
        });
        document.getElementById("ai_copilot_watch").addEventListener("change", e => {
            this._watching = e.target.checked;
            this._renderStatus(this._watching ? "Watching terminal output" : "Terminal watch off");
        });
        panel.querySelectorAll("[data-action]").forEach(btn => {
            btn.addEventListener("click", () => this.runAction(btn.getAttribute("data-action")));
        });

        this._renderStatus(this.config.apiKey ? "Ready" : "Set API key to begin");
    }

    _loadConfig() {
        const fs = require("fs");
        try {
            this.config = JSON.parse(fs.readFileSync(this.configFile, "utf-8"));
        } catch (e) {
            this.config = { apiKey: "", model: "claude-haiku-4-5", system: "" };
        }
    }

    _saveConfig() {
        const fs = require("fs");
        fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
    }

    _stripAnsi(s) {
        return (s || "").replace(/\x1B\[[0-?]*[ -/]*[@-~]/g, "");
    }

    onTerminalChunk(data) {
        if (!this._watching) return;
        let text = this._stripAnsi(typeof data === "string" ? data : data.toString());
        this._buffer = (this._buffer + text).slice(-8000);
    }

    onTerminalInput(line) {
        // Tracks the last command the user submitted (best-effort)
        if (typeof line === "string" && line.trim()) {
            this._lastCommand = line.trim();
        }
    }

    toggle() {
        this._open ? this.close() : this.open();
    }

    open() {
        this._open = true;
        this.panel.setAttribute("class", "open");
        this.tab.setAttribute("class", "hidden");
        try {
            if (window.keyboard) window.keyboard.detach();
        } catch (e) {}
        setTimeout(() => {
            let q = document.getElementById("ai_copilot_query");
            if (q) q.focus();
        }, 100);
    }

    close() {
        this._open = false;
        this.panel.setAttribute("class", "closed");
        this.tab.setAttribute("class", "");
        try {
            if (window.keyboard) window.keyboard.attach();
            if (window.term && window.term[window.currentTerm]) window.term[window.currentTerm].term.focus();
        } catch (e) {}
    }

    openSetup() {
        let current = this.config.apiKey || "";
        let masked = current ? current.substr(0, 8) + "…" + current.substr(-4) : "";
        new Modal({
            type: "custom",
            title: "AI Copilot Setup",
            html: `<div style="padding:1vh;">
                <p style="font-size:1.4vh;">Paste your Anthropic API key. It's stored locally in <code>ai-copilot.json</code>; it is sent only to api.anthropic.com when you press an action.</p>
                <p style="font-size:1.2vh;opacity:0.6;">Current: ${masked || "<i>none</i>"}</p>
                <input type="password" id="ai_copilot_key_input" style="width:90%;padding:0.6vh;background:#000;border:1px solid rgba(var(--color_r),var(--color_g),var(--color_b),0.4);color:rgb(var(--color_r),var(--color_g),var(--color_b));font-family:var(--font_mono);font-size:1.4vh;" placeholder="sk-ant-…" />
                <p style="font-size:1.2vh;margin-top:1.5vh;">Model:</p>
                <select id="ai_copilot_model_input" style="background:#000;color:rgb(var(--color_r),var(--color_g),var(--color_b));border:1px solid rgba(var(--color_r),var(--color_g),var(--color_b),0.4);padding:0.4vh;">
                    <option value="claude-haiku-4-5">claude-haiku-4-5 (fast)</option>
                    <option value="claude-sonnet-4-6">claude-sonnet-4-6 (balanced)</option>
                    <option value="claude-opus-4-7">claude-opus-4-7 (best)</option>
                </select>
            </div>`,
            buttons: [
                { label: "Save", action: `window.aiCopilot._saveSetup()` },
                { label: "Cancel", action: "" }
            ]
        });
        setTimeout(() => {
            let sel = document.getElementById("ai_copilot_model_input");
            if (sel) sel.value = this.config.model || "claude-haiku-4-5";
        }, 100);
    }

    _saveSetup() {
        let keyEl = document.getElementById("ai_copilot_key_input");
        let modelEl = document.getElementById("ai_copilot_model_input");
        if (keyEl && keyEl.value.trim()) this.config.apiKey = keyEl.value.trim();
        if (modelEl) this.config.model = modelEl.value;
        this._saveConfig();
        this._renderStatus("Saved");
    }

    _addMessage(role, text) {
        let log = document.getElementById("ai_copilot_messages");
        if (!log) return;
        let div = document.createElement("div");
        div.setAttribute("class", `ai_msg ai_msg_${role}`);
        div.innerHTML = `<span class="ai_msg_role">${role.toUpperCase()}</span><div class="ai_msg_body">${window._escapeHtml(text)}</div>`;
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
        return div;
    }

    _addCommandCard(cmd) {
        let log = document.getElementById("ai_copilot_messages");
        if (!log) return;
        let safeAttr = window._escapeHtml(cmd).replace(/"/g, "&quot;");
        let div = document.createElement("div");
        div.setAttribute("class", "ai_msg ai_msg_cmd");
        div.innerHTML = `<span class="ai_msg_role">PROPOSED</span>
            <pre class="ai_cmd_pre">${window._escapeHtml(cmd)}</pre>
            <div class="ai_cmd_buttons">
                <button class="ai_cmd_run" data-cmd="${safeAttr}">RUN</button>
                <button class="ai_cmd_copy" data-cmd="${safeAttr}">COPY</button>
                <button class="ai_cmd_cancel">CANCEL</button>
            </div>`;
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
        div.querySelector(".ai_cmd_run").addEventListener("click", () => {
            try {
                window.term[window.currentTerm].writelr(cmd);
                this._renderStatus("Command sent to terminal");
            } catch (e) {
                this._renderStatus("Failed to send to terminal");
            }
        });
        div.querySelector(".ai_cmd_copy").addEventListener("click", () => {
            try { require("electron").clipboard.writeText(cmd); this._renderStatus("Copied"); } catch (e) {}
        });
        div.querySelector(".ai_cmd_cancel").addEventListener("click", () => div.remove());
    }

    _renderStatus(text) {
        let el = document.getElementById("ai_copilot_status");
        if (el) el.innerText = text || "";
    }

    async handleSend() {
        let inp = document.getElementById("ai_copilot_query");
        if (!inp) return;
        let q = inp.value.trim();
        if (!q) return;
        inp.value = "";
        this._addMessage("you", q);
        await this._ask({
            system: "You are an in-terminal copilot inside the eDEX-UI sci-fi terminal. Be concise. If the user is clearly asking for a shell command, respond ONLY with the command on a single line, no prose, no fencing. Otherwise answer briefly in plain text.",
            user: this._withContext(q)
        });
    }

    async runAction(action) {
        if (action === "explain") {
            let tail = this._buffer.slice(-3000);
            if (!tail && !this._lastCommand) {
                this._renderStatus("Enable 'Watch terminal' first and run something");
                return;
            }
            this._addMessage("you", "Explain the last error");
            await this._ask({
                system: "You are a terminal error explainer. Read the recent terminal output and explain (1) what went wrong (2) the likely cause (3) a concrete fix. Keep it under 120 words.",
                user: `Last command: ${this._lastCommand || "(unknown)"}\n\nRecent terminal output:\n${tail || "(empty — user hasn't enabled terminal watch)"}`
            });
        } else if (action === "translate") {
            let goal = (document.getElementById("ai_copilot_query") || {}).value || "";
            if (!goal.trim()) {
                this._renderStatus("Type the goal in the input first");
                return;
            }
            document.getElementById("ai_copilot_query").value = "";
            this._addMessage("you", `Translate: ${goal}`);
            await this._ask({
                system: "You translate natural-language goals into a single shell command for the user's platform. Respond ONLY with the command, on a single line. No code fences, no explanation, no leading $.",
                user: this._withContext(goal),
                asCommand: true
            });
        } else if (action === "suggest") {
            let tail = this._buffer.slice(-2000);
            this._addMessage("you", "Suggest the next command");
            await this._ask({
                system: "Suggest the single most useful next shell command for the user given recent context. Respond ONLY with the command on a single line.",
                user: this._withContext(tail ? `Recent output:\n${tail}` : "(no recent context)"),
                asCommand: true
            });
        }
    }

    _withContext(q) {
        let ctx = [];
        if (this._lastCommand) ctx.push(`Last command: ${this._lastCommand}`);
        ctx.push(`Platform: ${process.platform}`);
        return ctx.join("\n") + "\n\n" + q;
    }

    async _ask({ system, user, asCommand }) {
        if (!this.config.apiKey) {
            this._addMessage("error", "No API key set. Click 'Setup API key' below.");
            return;
        }
        if (this._busy) {
            this._renderStatus("Busy…");
            return;
        }
        this._busy = true;
        this._renderStatus("Thinking…");
        try {
            let resp = await fetch("https://api.anthropic.com/v1/messages", {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "x-api-key": this.config.apiKey,
                    "anthropic-version": "2023-06-01",
                    "anthropic-dangerous-direct-browser-access": "true"
                },
                body: JSON.stringify({
                    model: this.config.model || "claude-haiku-4-5",
                    max_tokens: 600,
                    system,
                    messages: [{ role: "user", content: user }]
                })
            });
            if (!resp.ok) {
                let txt = await resp.text();
                this._addMessage("error", `API ${resp.status}: ${txt.slice(0, 200)}`);
                this._renderStatus("Error");
                return;
            }
            let data = await resp.json();
            let text = (data.content || []).filter(c => c.type === "text").map(c => c.text).join("\n").trim();
            if (asCommand) {
                let cmd = text.split("\n").map(l => l.trim()).filter(l => l.length && !l.startsWith("#")).find(l => l) || text;
                cmd = cmd.replace(/^\$\s*/, "").replace(/^```.*$/gm, "").trim();
                this._addCommandCard(cmd);
            } else {
                this._addMessage("ai", text);
            }
            this._renderStatus("Ready");
        } catch (e) {
            this._addMessage("error", `Network error: ${e.message}`);
            this._renderStatus("Network error");
        } finally {
            this._busy = false;
        }
    }
}

module.exports = { AICopilot };
