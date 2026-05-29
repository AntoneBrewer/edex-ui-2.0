class GitConstellation {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";
        const cp = require("child_process");

        this.parent = document.getElementById(parentId);
        this.parent.innerHTML += `<div id="mod_gitConstellation"></div>`;
        this.container = document.getElementById("mod_gitConstellation");

        this.cwd = null;
        this.poll = null;
        this.commits = [];
        this.status = null;
        this.branch = null;
        this.ahead = 0;
        this.behind = 0;
        this.dirty = 0;
        this.staged = 0;
        this.empty = true;
        this.gitMissing = false;

        this.render();

        this._git = (args, cwd) => new Promise(resolve => {
            cp.execFile("git", args, { cwd, timeout: 2500, windowsHide: true }, (err, stdout, stderr) => {
                if (err && err.code === "ENOENT") {
                    this.gitMissing = true;
                    resolve(null);
                    return;
                }
                if (err) { resolve(null); return; }
                resolve(stdout.toString());
            });
        });

        // Subscribe to cwd updates via the existing oncwdchange hook on the active term.
        this._attachToTerm = () => {
            if (!window.term || !window.term[window.currentTerm]) {
                setTimeout(this._attachToTerm, 500);
                return;
            }
            let num = window.currentTerm;
            let prev = window.term[num].oncwdchange;
            window.term[num].oncwdchange = cwd => {
                if (typeof prev === "function") {
                    try { prev(cwd); } catch (e) {}
                }
                if (cwd && cwd.startsWith("FALLBACK |-- ")) cwd = cwd.slice(13);
                if (cwd && cwd !== this.cwd) {
                    this.cwd = cwd;
                    this.refresh();
                }
            };
        };
        this._attachToTerm();

        this.poll = setInterval(() => this.refresh(), 4000);

        // Click handler for commit nodes (delegated)
        this.container.addEventListener("click", e => {
            let node = e.target.closest("[data-sha]");
            if (!node) return;
            let sha = node.getAttribute("data-sha");
            this.showCommit(sha);
        });
    }

    async refresh() {
        if (!this.cwd) return;
        if (this.gitMissing) {
            this.empty = true;
            this.render();
            return;
        }
        let topLevel = await this._git(["rev-parse", "--show-toplevel"], this.cwd);
        if (!topLevel || !topLevel.trim()) {
            this.empty = true;
            this.render();
            return;
        }
        this.empty = false;
        this.repoRoot = topLevel.trim();

        let [branch, status, log, upstream] = await Promise.all([
            this._git(["rev-parse", "--abbrev-ref", "HEAD"], this.repoRoot),
            this._git(["status", "--porcelain"], this.repoRoot),
            this._git(["log", "--max-count=24", "--pretty=format:%H|%h|%P|%s|%an|%at"], this.repoRoot),
            this._git(["rev-list", "--left-right", "--count", "HEAD...@{upstream}"], this.repoRoot)
        ]);

        this.branch = (branch || "").trim() || "(detached)";

        // status parse
        this.dirty = 0;
        this.staged = 0;
        if (status) {
            status.split("\n").filter(l => l.length).forEach(l => {
                let X = l[0], Y = l[1];
                if (X !== " " && X !== "?") this.staged++;
                if (Y !== " " || X === "?") this.dirty++;
            });
        }

        // upstream parse: "ahead\tbehind"
        this.ahead = 0; this.behind = 0;
        if (upstream) {
            let parts = upstream.trim().split(/\s+/).map(Number);
            if (parts.length === 2 && !isNaN(parts[0])) {
                this.ahead = parts[0];
                this.behind = parts[1];
            }
        }

        // log parse
        this.commits = [];
        if (log) {
            log.split("\n").filter(l => l.length).forEach(line => {
                let [sha, shortSha, parents, subject, author, ts] = line.split("|");
                this.commits.push({
                    sha,
                    shortSha,
                    parents: (parents || "").split(" ").filter(p => p.length),
                    subject: subject || "",
                    author: author || "",
                    ts: Number(ts) || 0
                });
            });
        }

        this.render();
    }

    render() {
        if (!this.container) return;
        let r = window.theme && window.theme.r || 170;
        let g = window.theme && window.theme.g || 207;
        let b = window.theme && window.theme.b || 209;

        if (this.gitMissing) {
            this.container.innerHTML = `<div id="mod_gitConstellation_inner">
                <h1>GIT CONSTELLATION<i>UNAVAILABLE</i></h1>
                <h3 class="gc_empty">git not installed on host</h3>
            </div>`;
            return;
        }
        if (this.empty) {
            this.container.innerHTML = `<div id="mod_gitConstellation_inner">
                <h1>GIT CONSTELLATION<i>NO REPO</i></h1>
                <h3 class="gc_empty">${this.cwd ? "cwd is not a git repository" : "waiting for cwd…"}</h3>
            </div>`;
            return;
        }

        // Build SVG constellation
        let W = 100, H = 100;
        let nodes = this.commits.slice().reverse(); // oldest left
        let positions = {};
        nodes.forEach((c, i) => {
            let x = (i / Math.max(1, nodes.length - 1)) * (W - 8) + 4;
            // alternate y so it forms a constellation, seeded by sha
            let h = parseInt(c.shortSha.substr(0, 2), 16) % 60;
            let y = 20 + h;
            positions[c.sha] = { x, y };
        });

        let edges = "";
        nodes.forEach(c => {
            let me = positions[c.sha];
            c.parents.forEach(p => {
                let par = positions[p];
                if (par) {
                    edges += `<line x1="${par.x}" y1="${par.y}" x2="${me.x}" y2="${me.y}" stroke="rgba(${r},${g},${b},0.4)" stroke-width="0.4"/>`;
                }
            });
        });

        let dots = "";
        nodes.forEach((c, i) => {
            let { x, y } = positions[c.sha];
            let isHead = (i === nodes.length - 1);
            let radius = isHead ? 1.6 : 1.0;
            dots += `<g data-sha="${c.sha}" style="cursor:pointer">
                <circle cx="${x}" cy="${y}" r="${radius}" fill="rgb(${r},${g},${b})" />
                <circle cx="${x}" cy="${y}" r="${radius * 2.5}" fill="rgba(${r},${g},${b},0.12)" />
                <title>${window._escapeHtml(c.shortSha + " — " + c.subject + " (" + c.author + ")")}</title>
            </g>`;
        });

        let headLine = nodes.length ? `<text x="${positions[nodes[nodes.length-1].sha].x}" y="${positions[nodes[nodes.length-1].sha].y - 4}" font-size="3" fill="rgb(${r},${g},${b})" text-anchor="middle">HEAD</text>` : "";

        let status = `<div class="gc_status">
            <span class="gc_branch">⎇ ${window._escapeHtml(this.branch)}</span>
            <span class="gc_arrow">↑${this.ahead}</span>
            <span class="gc_arrow">↓${this.behind}</span>
            <span class="gc_count">●${this.dirty} dirty</span>
            <span class="gc_count">◆${this.staged} staged</span>
        </div>`;

        this.container.innerHTML = `<div id="mod_gitConstellation_inner">
            <h1>GIT CONSTELLATION<i>${window._escapeHtml(this.repoRoot.split(/[\\/]/).pop())}</i></h1>
            ${status}
            <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" id="mod_gitConstellation_svg">
                ${edges}
                ${dots}
                ${headLine}
            </svg>
            <h3 class="gc_subject">${nodes.length ? window._escapeHtml(nodes[nodes.length-1].subject.substr(0, 60)) : ""}</h3>
        </div>`;
    }

    async showCommit(sha) {
        if (!this.repoRoot) return;
        let diff = await this._git(["show", "--stat", "--color=never", sha], this.repoRoot);
        let safe = window._escapeHtml(diff || "(no diff)");
        new Modal({
            type: "custom",
            title: `Commit ${sha.substr(0, 10)}`,
            html: `<pre style="max-height:55vh;overflow:auto;font-size:1.2vh;white-space:pre-wrap;">${safe}</pre>`
        });
    }

    destroy() {
        if (this.poll) clearInterval(this.poll);
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

module.exports = { GitConstellation };
