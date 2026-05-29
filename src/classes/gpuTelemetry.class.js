class GPUTelemetry {
    constructor(parentId) {
        if (!parentId) throw "Missing parameters";

        this.parent = document.getElementById(parentId);
        this.parent.innerHTML += `<div id="mod_gpuTelemetry"></div>`;
        this.container = document.getElementById("mod_gpuTelemetry");

        const TimeSeries = require("smoothie").TimeSeries;
        const SmoothieChart = require("smoothie").SmoothieChart;

        this.series = {
            gpu: new TimeSeries(),
            vram: new TimeSeries(),
            diskR: new TimeSeries(),
            diskW: new TimeSeries()
        };
        this.charts = {};
        this.intervals = [];

        let stroke = `rgb(${window.theme.r},${window.theme.g},${window.theme.b})`;
        let strokeAlt = `rgba(${window.theme.r},${window.theme.g},${window.theme.b},0.5)`;

        let chartOpts = (max) => ({
            limitFPS: 30,
            responsive: true,
            millisPerPixel: 50,
            grid: {
                fillStyle: 'transparent',
                strokeStyle: 'transparent',
                verticalSections: 0,
                borderVisible: false
            },
            labels: { disabled: true },
            yRangeFunction: () => ({ min: 0, max: max || 100 })
        });

        window.si.graphics().then(data => {
            let ctrl = (data && data.controllers || []).find(c => c.vendor && !/microsoft/i.test(c.vendor)) || (data.controllers && data.controllers[0]);
            let gpuName = ctrl ? (ctrl.vendor + " " + (ctrl.model || "")).trim().substr(0, 30) : "NO GPU DETECTED";
            let totalVram = ctrl && ctrl.vram ? `${ctrl.vram}MB` : "--";

            let inner = document.createElement("div");
            inner.setAttribute("id", "mod_gpuTelemetry_innercontainer");
            inner.innerHTML = `<h1>GPU TELEMETRY<i>${gpuName}</i></h1>
                <div>
                    <h1>GPU<br><i id="mod_gpuTelemetry_gpu">--%</i></h1>
                    <canvas id="mod_gpuTelemetry_canvas_gpu" height="32"></canvas>
                </div>
                <div>
                    <h1>VRAM<br><i id="mod_gpuTelemetry_vram">--%</i></h1>
                    <canvas id="mod_gpuTelemetry_canvas_vram" height="32"></canvas>
                </div>
                <div>
                    <h1>DISK I/O<br><i id="mod_gpuTelemetry_disk">R:-- W:--</i></h1>
                    <canvas id="mod_gpuTelemetry_canvas_disk" height="32"></canvas>
                </div>
                <div>
                    <div><h1>TEMP<br><i id="mod_gpuTelemetry_temp">--°C</i></h1></div>
                    <div><h1>FAN<br><i id="mod_gpuTelemetry_fan">-- RPM</i></h1></div>
                    <div><h1>VRAM<br><i id="mod_gpuTelemetry_vramTotal">${totalVram}</i></h1></div>
                </div>`;
            this.container.append(inner);

            this.charts.gpu = new SmoothieChart(chartOpts(100));
            this.charts.gpu.addTimeSeries(this.series.gpu, { lineWidth: 1.7, strokeStyle: stroke });
            this.charts.gpu.streamTo(document.getElementById("mod_gpuTelemetry_canvas_gpu"), 500);

            this.charts.vram = new SmoothieChart(chartOpts(100));
            this.charts.vram.addTimeSeries(this.series.vram, { lineWidth: 1.7, strokeStyle: stroke });
            this.charts.vram.streamTo(document.getElementById("mod_gpuTelemetry_canvas_vram"), 500);

            this.charts.disk = new SmoothieChart(chartOpts(50));
            this.charts.disk.addTimeSeries(this.series.diskR, { lineWidth: 1.7, strokeStyle: stroke });
            this.charts.disk.addTimeSeries(this.series.diskW, { lineWidth: 1.7, strokeStyle: strokeAlt });
            this.charts.disk.streamTo(document.getElementById("mod_gpuTelemetry_canvas_disk"), 500);

            this.gpuPresent = !!ctrl;
            this.update();
            this.intervals.push(setInterval(() => this.update(), 1000));
            this.intervals.push(setInterval(() => this.updateTemp(), 2000));
        }).catch(() => {
            this.container.innerHTML = `<div id="mod_gpuTelemetry_innercontainer"><h1>GPU TELEMETRY<i>UNAVAILABLE</i></h1></div>`;
        });
    }

    update() {
        if (this._updating) return;
        this._updating = true;
        let now = new Date().getTime();

        let p1 = window.si.graphics().then(data => {
            let ctrl = (data && data.controllers || []).find(c => c.vendor && !/microsoft/i.test(c.vendor)) || (data.controllers && data.controllers[0]);
            if (!ctrl) return;
            let util = (typeof ctrl.utilizationGpu === "number") ? ctrl.utilizationGpu : null;
            let memUsed = (typeof ctrl.memoryUsed === "number") ? ctrl.memoryUsed : null;
            let memTotal = (typeof ctrl.memoryTotal === "number" && ctrl.memoryTotal > 0) ? ctrl.memoryTotal : (ctrl.vram || 0);

            if (util !== null) {
                this.series.gpu.append(now, util);
                this._safeText("mod_gpuTelemetry_gpu", `${Math.round(util)}%`);
            } else {
                this._safeText("mod_gpuTelemetry_gpu", "n/a");
            }

            if (memUsed !== null && memTotal > 0) {
                let pct = (memUsed / memTotal) * 100;
                this.series.vram.append(now, pct);
                this._safeText("mod_gpuTelemetry_vram", `${Math.round(pct)}%`);
            } else {
                this._safeText("mod_gpuTelemetry_vram", "n/a");
            }

            if (typeof ctrl.fanSpeed === "number") {
                this._safeText("mod_gpuTelemetry_fan", `${ctrl.fanSpeed} RPM`);
            }
        }).catch(() => {});

        let p2 = window.si.disksIO().then(io => {
            if (!io) return;
            let r = Math.max(0, (io.rIO_sec || 0) / 256);
            let w = Math.max(0, (io.wIO_sec || 0) / 256);
            this.series.diskR.append(now, r);
            this.series.diskW.append(now, w);
            let rMB = ((io.rIO_sec || 0) * 4096 / (1024 * 1024)).toFixed(1);
            let wMB = ((io.wIO_sec || 0) * 4096 / (1024 * 1024)).toFixed(1);
            this._safeText("mod_gpuTelemetry_disk", `R:${rMB} W:${wMB}MB/s`);
        }).catch(() => {});

        Promise.all([p1, p2]).finally(() => { this._updating = false; });
    }

    updateTemp() {
        window.si.graphics().then(data => {
            let ctrl = (data && data.controllers || []).find(c => c.vendor && !/microsoft/i.test(c.vendor)) || (data.controllers && data.controllers[0]);
            if (ctrl && typeof ctrl.temperatureGpu === "number") {
                this._safeText("mod_gpuTelemetry_temp", `${ctrl.temperatureGpu}°C`);
            } else {
                window.si.cpuTemperature().then(t => {
                    if (t && typeof t.max === "number" && t.max > 0) {
                        this._safeText("mod_gpuTelemetry_temp", `~${t.max}°C`);
                    }
                }).catch(() => {});
            }
        }).catch(() => {});
    }

    _safeText(id, text) {
        try {
            let el = document.getElementById(id);
            if (el) el.innerText = text;
        } catch (e) { /* DOM may be refreshing */ }
    }

    destroy() {
        this.intervals.forEach(i => clearInterval(i));
        this.intervals = [];
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

module.exports = { GPUTelemetry };
