class LayoutManager {
    constructor() {
        const path = require("path");
        const fs = require("fs");
        const remote = require("@electron/remote");

        this.settingsDir = remote.app.getPath("userData");
        this.layoutsFile = path.join(this.settingsDir, "layouts.json");

        // All known mod ids and their column. Used to show/hide via CSS classes.
        this.registry = [
            { id: "clock", column: "left" },
            { id: "sysinfo", column: "left" },
            { id: "hardwareInspector", column: "left" },
            { id: "cpuinfo", column: "left" },
            { id: "gpuTelemetry", column: "left" },
            { id: "ramwatcher", column: "left" },
            { id: "toplist", column: "left" },
            { id: "netstat", column: "right" },
            { id: "globe", column: "right" },
            { id: "conninfo", column: "right" },
            { id: "gitConstellation", column: "right" }
        ];

        // Presets (immutable defaults). User layouts persist alongside.
        this.presets = {
            "default": {
                visible: ["clock", "sysinfo", "hardwareInspector", "cpuinfo", "ramwatcher", "toplist",
                          "netstat", "globe", "conninfo"]
            },
            "dev": {
                visible: ["clock", "sysinfo", "cpuinfo", "ramwatcher", "toplist",
                          "netstat", "gitConstellation", "conninfo"]
            },
            "sysadmin": {
                visible: ["clock", "sysinfo", "hardwareInspector", "cpuinfo", "gpuTelemetry", "ramwatcher", "toplist",
                          "netstat", "conninfo"]
            },
            "cinematic": {
                visible: ["clock", "sysinfo", "hardwareInspector", "cpuinfo", "gpuTelemetry", "ramwatcher", "toplist",
                          "netstat", "globe", "conninfo", "gitConstellation"]
            }
        };

        // Load saved layouts (custom user-defined)
        try {
            this.userLayouts = JSON.parse(fs.readFileSync(this.layoutsFile, "utf-8"));
        } catch (e) {
            this.userLayouts = {};
        }

        // Current active layout name persisted in main settings
        this.active = (window.settings && window.settings.currentLayout) || "default";
    }

    _all() {
        return Object.assign({}, this.presets, this.userLayouts);
    }

    list() {
        return Object.keys(this._all());
    }

    getSpec(name) {
        return this._all()[name];
    }

    apply(name) {
        let spec = this.getSpec(name);
        if (!spec) {
            console.warn(`Layout "${name}" not found, falling back to default`);
            spec = this.presets["default"];
            name = "default";
        }
        let visibleSet = new Set(spec.visible);

        // Ensure required widgets are instantiated when they should be visible.
        this._ensureInstantiated(visibleSet);

        this.registry.forEach(entry => {
            let domId = "mod_" + entry.id;
            // Some widgets use different DOM ids; map exceptions.
            let aliases = {
                "clock": "mod_clock",
                "sysinfo": "mod_sysinfo",
                "hardwareInspector": "mod_hardwareInspector",
                "cpuinfo": "mod_cpuinfo",
                "gpuTelemetry": "mod_gpuTelemetry",
                "ramwatcher": "mod_ramwatcher",
                "toplist": "mod_toplist",
                "netstat": "mod_netstat",
                "globe": "mod_globe",
                "conninfo": "mod_conninfo",
                "gitConstellation": "mod_gitConstellation"
            };
            domId = aliases[entry.id] || domId;
            let el = document.getElementById(domId);
            if (!el) return;
            if (visibleSet.has(entry.id)) {
                el.style.display = "";
            } else {
                el.style.display = "none";
            }
        });

        this.active = name;
        try {
            window.settings.currentLayout = name;
        } catch (e) {}
        if (window.audioManager && window.audioManager.panels) {
            try { window.audioManager.panels.play(); } catch (e) {}
        }
    }

    _ensureInstantiated(visibleSet) {
        // GPU & Git widgets aren't instantiated by default — create them on first need.
        if (visibleSet.has("gpuTelemetry") && !document.getElementById("mod_gpuTelemetry") && typeof GPUTelemetry !== "undefined") {
            try {
                window.mods.gpuTelemetry = new GPUTelemetry("mod_column_left");
            } catch (e) { console.warn("GPU Telemetry init failed:", e); }
        }
        if (visibleSet.has("gitConstellation") && !document.getElementById("mod_gitConstellation") && typeof GitConstellation !== "undefined") {
            try {
                window.mods.gitConstellation = new GitConstellation("mod_column_right");
            } catch (e) { console.warn("Git Constellation init failed:", e); }
        }
    }

    save(name, spec) {
        if (this.presets[name]) {
            // Refuse to overwrite a preset; force user to use a new name.
            throw new Error(`"${name}" is a built-in preset. Choose a different name.`);
        }
        this.userLayouts[name] = spec;
        const fs = require("fs");
        fs.writeFileSync(this.layoutsFile, JSON.stringify(this.userLayouts, null, 2));
    }

    delete(name) {
        if (this.presets[name]) throw new Error("Cannot delete preset layouts");
        delete this.userLayouts[name];
        const fs = require("fs");
        fs.writeFileSync(this.layoutsFile, JSON.stringify(this.userLayouts, null, 2));
        if (this.active === name) this.apply("default");
    }

    openPicker() {
        let names = this.list();
        let listHtml = names.map(n => {
            let isActive = (n === this.active);
            return `<button class="layout_pick_item ${isActive ? "active" : ""}" data-layout="${window._escapeHtml(n)}">
                <span class="layout_pick_name">${window._escapeHtml(n.toUpperCase())}</span>
                <span class="layout_pick_meta">${this.presets[n] ? "preset" : "custom"} · ${this.getSpec(n).visible.length} widgets</span>
            </button>`;
        }).join("");

        try { if (window.keyboard) window.keyboard.detach(); } catch (e) {}
        let modal = new Modal({
            type: "custom",
            title: "Workspace Layouts",
            html: `<div id="layout_picker">
                <p style="font-size:1.2vh;opacity:0.7;margin-bottom:1vh;">Select a layout to apply. The active layout is highlighted.</p>
                <div id="layout_pick_list">${listHtml}</div>
            </div>`
        }, () => {
            try { if (window.keyboard) window.keyboard.attach(); } catch (e) {}
            try { if (window.term && window.term[window.currentTerm]) window.term[window.currentTerm].term.focus(); } catch (e) {}
        });

        setTimeout(() => {
            document.querySelectorAll(".layout_pick_item").forEach(btn => {
                btn.addEventListener("click", () => {
                    let name = btn.getAttribute("data-layout");
                    this.apply(name);
                    if (modal && typeof modal.close === "function") modal.close();
                });
            });
        }, 100);
    }
}

module.exports = { LayoutManager };
