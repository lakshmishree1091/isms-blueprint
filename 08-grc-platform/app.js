/* Lattice GRC Platform - stage 1 application logic
 * Plain JavaScript, no dependencies. Data comes from data.js.
 */
(function () {
  "use strict";

  /* =========================================================
   * Helpers
   * ======================================================= */

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function esc(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function bandFor(score) {
    return RISK_BANDS.find(b => score >= b.min && score <= b.max) || RISK_BANDS[RISK_BANDS.length - 1];
  }
  const bandClass = name => name.toLowerCase();
  const bandRank = name => RISK_BANDS.length - RISK_BANDS.findIndex(b => b.name === name); // Critical highest
  const levelOf = (scale, n) => (scale.find(s => s.score === n) || {}).level || "";

  function normaliseRisk(r) {
    const likelihood = clampInt(r.likelihood, 1, 5);
    const impact = clampInt(r.impact, 1, 5);
    const score = likelihood * impact;
    return {
      id: String(r.id || "").trim(),
      title: String(r.title || "").trim(),
      description: String(r.description || "").trim(),
      likelihood, impact, score,
      band: bandFor(score).name,
      treatment: String(r.treatment || "Treat").trim(),
      owner: String(r.owner || "").trim(),
      custom: !!r.custom
    };
  }
  function clampInt(v, lo, hi) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo;
  }
  const idNum = id => { const m = /(\d+)/.exec(id); return m ? parseInt(m[1], 10) : 0; };

  /* =========================================================
   * Store - localStorage with graceful fallback
   * ======================================================= */

  const STORAGE_KEY = "meridiaan-grc.risks";

  const Store = {
    available: false,
    risks: [],
    dirty: false,          // differs from source data
    staleSource: false,    // saved copy was made from an older data.js

    init() {
      this.available = (() => {
        try {
          const k = "__grc_probe__";
          window.localStorage.setItem(k, "1");
          window.localStorage.removeItem(k);
          return true;
        } catch (e) { return false; }
      })();

      let saved = null;
      if (this.available) {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (raw) saved = JSON.parse(raw);
        } catch (e) { saved = null; }
      }

      if (saved && Array.isArray(saved.risks)) {
        this.risks = saved.risks.map(normaliseRisk).filter(r => r.id);
        this.dirty = true;
        this.staleSource = saved.version !== DATA_VERSION;
      } else {
        this.risks = RISKS.map(normaliseRisk);
      }
    },

    persist() {
      this.dirty = true;
      if (!this.available) return false;
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
          version: DATA_VERSION,
          savedAt: new Date().toISOString(),
          risks: this.risks
        }));
        this.staleSource = false;
        return true;
      } catch (e) {
        this.available = false; // quota or policy failure - keep working in memory
        return false;
      }
    },

    upsert(risk, originalId) {
      const r = normaliseRisk(risk);
      const idx = this.risks.findIndex(x => x.id === (originalId || r.id));
      if (idx >= 0) this.risks[idx] = r; else this.risks.push(r);
      return this.persist();
    },

    remove(id) {
      this.risks = this.risks.filter(r => r.id !== id);
      return this.persist();
    },

    reset() {
      this.risks = RISKS.map(normaliseRisk);
      this.dirty = false;
      this.staleSource = false;
      if (this.available) {
        try { window.localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
      }
    },

    nextId() {
      const max = this.risks.reduce((m, r) => Math.max(m, idNum(r.id)), 0);
      // R-13 was removed from the source as a duplicate; never reuse it.
      const n = Math.max(max + 1, 17);
      return "R-" + String(n).padStart(2, "0");
    },

    owners() {
      return Array.from(new Set(this.risks.map(r => r.owner).filter(Boolean)))
        .sort((a, b) => a.localeCompare(b));
    }
  };

  function updateBanner() {
    const el = $("#storage-banner");
    if (!Store.available) {
      el.textContent = "Browser storage is unavailable (private window or blocked site data). " +
        "Changes will work for this session but will not be saved after a refresh.";
      el.hidden = false;
    } else if (Store.staleSource) {
      el.innerHTML = "The source data in <code>data.js</code> has changed since your edits were saved. " +
        "You are seeing your saved copy; use <b>Reset to source data</b> in the Risk Register to load the new baseline.";
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  }

  /* =========================================================
   * Tooltip & toast
   * ======================================================= */

  const tooltip = {
    el: null,
    show(html, x, y) {
      this.el.innerHTML = html;
      this.el.hidden = false;
      const pad = 14;
      const rect = this.el.getBoundingClientRect();
      let left = x + pad, top = y + pad;
      if (left + rect.width > window.innerWidth - 8) left = x - rect.width - pad;
      if (top + rect.height > window.innerHeight - 8) top = y - rect.height - pad;
      this.el.style.left = Math.max(8, left) + "px";
      this.el.style.top = Math.max(8, top) + "px";
    },
    hide() { this.el.hidden = true; }
  };

  let toastTimer = null;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }

  /* =========================================================
   * Router
   * ======================================================= */

  const PLACEHOLDERS = {
    controls:  { title: "Control Library", text: "Browse all 93 ISO/IEC 27001:2022 Annex A controls with applicability, justification, implementation status and linked risks.", icon: '<path d="M13 3 21 6.5v6c0 4.5-3.5 8-8 9.5-4.5-1.5-8-5-8-9.5v-6z"/>' },
    documents: { title: "Documents", text: "Manage the ISMS document set — policies, scope, SoA and procedures — with owners, versions and review dates.", icon: '<path d="M7 3h9l5 5v13H7zM16 3v5h5M10 13h8M10 17h8"/>' },
    gaps:      { title: "Gaps", text: "Track the ten gaps from the gap assessment against the three-phase remediation roadmap.", icon: '<path d="M4 13h6M16 13h6M10 8v10M16 8v10"/>' },
    evidence:  { title: "Evidence", text: "Link evidence records to controls and audit clauses, and see where evidence is missing or out of date.", icon: '<path d="M5 5h16v16H5zM9 3v4M17 3v4M9 14l3 3 5-5"/>' },
    incidents: { title: "Incidents", text: "Log incidents and track NIS2 and DORA reporting deadlines (early warning, notification, final report).", icon: '<path d="M13 3v3M13 20v3M3 13h3M20 13h3M13 8a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"/>' },
    assurance: { title: "Client Assurance", text: "Prepare assurance packs and track audit requests from the financial-sector clients under their DORA obligations.", icon: '<path d="M4 22V11l9-7 9 7v11zM10 22v-6h6v6"/>' }
  };

  function currentRoute() {
    const hash = (location.hash || "").replace(/^#\/?/, "");
    const [route, query] = hash.split("?");
    return { route: route || "dashboard", params: new URLSearchParams(query || "") };
  }

  function render() {
    const { route, params } = currentRoute();
    tooltip.hide();

    $$(".nav-item").forEach(a => {
      const on = a.dataset.route === route;
      a.classList.toggle("active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });

    const view = $("#view");
    if (route === "dashboard") renderDashboard(view);
    else if (route === "risks") renderRisks(view, params);
    else if (PLACEHOLDERS[route]) renderPlaceholder(view, PLACEHOLDERS[route]);
    else { location.hash = "#/dashboard"; return; }

    const titleMap = { dashboard: "Dashboard", risks: "Risk Register" };
    document.title = (titleMap[route] || (PLACEHOLDERS[route] || {}).title || "Lattice") + " · Lattice";
    updateBanner();
  }

  /* =========================================================
   * Dashboard
   * ======================================================= */

  function renderDashboard(view) {
    const risks = Store.risks;
    const byBand = {};
    RISK_BANDS.forEach(b => { byBand[b.name] = risks.filter(r => r.band === b.name); });

    const applicable = CONTROLS.filter(c => c.status !== "N/A");
    const excluded = CONTROLS.length - applicable.length;
    const statusDefs = [
      { key: "Implemented", color: "var(--st-implemented)", desc: "Operating and evidenced" },
      { key: "Partial",     color: "var(--st-partial)",     desc: "In place, not complete or evidenced" },
      { key: "Planned",     color: "var(--st-planned)",     desc: "Accepted as needed, not in place" }
    ];
    statusDefs.forEach(s => { s.n = applicable.filter(c => c.status === s.key).length; });
    const implPct = Math.round(statusDefs[0].n / applicable.length * 100);

    const openGaps = GAPS.filter(g => g.status !== "Closed");
    const prioDefs = [
      { key: "P1", label: "Close now",  fill: "var(--ink)" },
      { key: "P2", label: "Close next", fill: "#8b96a5" },
      { key: "P3", label: "Foundational", fill: "#c3c9d2" }
    ];
    prioDefs.forEach(p => { p.items = openGaps.filter(g => g.priority === p.key); });
    const maxPrio = Math.max(1, ...prioDefs.map(p => p.items.length));

    const kpiNotes = {
      Critical: "Score 16–25 · urgent",
      High: "Score 10–15 · treat & track",
      Medium: "Score 5–9 · manage",
      Low: "Score 1–4 · monitor"
    };

    const topRisks = risks.slice()
      .sort((a, b) => b.score - a.score || idNum(a.id) - idNum(b.id))
      .slice(0, 5);

    view.innerHTML = `
      <div class="page-head">
        <div>
          <h1>Dashboard</h1>
          <div class="sub">${esc(ORG.name)} · ISMS ${esc(ORG.ismsVersion)} · baseline data as at ${esc(ORG.dataDate)}</div>
        </div>
        <div class="page-actions">
          <a class="btn" href="#/risks">Open risk register</a>
        </div>
      </div>

      <section class="grid kpis" aria-label="Risks by band">
        ${RISK_BANDS.map(b => `
          <a class="card kpi ${bandClass(b.name)}" href="#/risks?band=${b.name}" aria-label="${byBand[b.name].length} ${b.name} risks — view in register">
            <div class="kpi-label"><span class="dot"></span>${b.name} risks</div>
            <div class="kpi-value">${byBand[b.name].length}</div>
            <div class="kpi-note">${kpiNotes[b.name]}</div>
          </a>`).join("")}
      </section>

      <div class="grid dash">
        <section class="card" aria-labelledby="hm-title">
          <div class="card-head">
            <h2 id="hm-title">Risk heatmap</h2>
            <span class="meta">${risks.length} risks · inherent score</span>
          </div>
          <div class="card-body">
            ${heatmapHTML(risks)}
            <div class="legend" aria-hidden="true">
              ${RISK_BANDS.map(b => `<span><i class="sw" style="--sw:var(--${bandClass(b.name)}-cell)"></i>${b.name} (${b.min}–${b.max})</span>`).join("")}
            </div>
          </div>
        </section>

        <div class="stack">
          <section class="card" aria-labelledby="ctl-title">
            <div class="card-head">
              <h2 id="ctl-title">Control implementation</h2>
              <span class="meta">ISO/IEC 27001:2022 Annex A</span>
            </div>
            <div class="card-body">
              <div class="headline">
                <span class="big">${implPct}%</span>
                <span class="of">fully implemented · ${statusDefs[0].n} of ${applicable.length} applicable controls</span>
              </div>
              <div class="statbar" role="img" aria-label="${statusDefs.map(s => `${s.key} ${s.n}`).join(", ")}">
                ${statusDefs.map(s => `<div style="flex:${s.n};background:${s.color}" data-tt="${esc(s.key)}: ${s.n} controls (${Math.round(s.n / applicable.length * 100)}%)"></div>`).join("")}
              </div>
              <div class="stat-rows">
                ${statusDefs.map(s => `
                  <div class="stat-row">
                    <i class="sw" style="--sw:${s.color}"></i>
                    <div>${s.key} <span class="desc">· ${s.desc}</span></div>
                    <span class="n">${s.n}</span>
                    <span class="pct">${Math.round(s.n / applicable.length * 100)}%</span>
                  </div>`).join("")}
              </div>
              <div class="kpi-note" style="margin-top:8px">${excluded} control excluded with justification (A.8.30 Outsourced development). Source: Statement of Applicability.</div>
            </div>
          </section>

          <section class="card" aria-labelledby="gap-title">
            <div class="card-head">
              <h2 id="gap-title">Open gaps by priority</h2>
              <span class="meta">${openGaps.length} open · gap assessment</span>
            </div>
            <div class="card-body">
              <div class="gap-bars">
                ${prioDefs.map(p => `
                  <div class="gap-bar">
                    <span class="prio ${p.key.toLowerCase()}">${p.key}</span>
                    <div class="track" title="${p.items.length} ${p.key} gaps"><div class="fill" style="width:${p.items.length / maxPrio * 100}%;--fill:${p.fill}"></div></div>
                    <span class="n">${p.items.length}</span>
                  </div>`).join("")}
              </div>
              <div class="list-title">P1 — close now (Phase 1, 0–3 months)</div>
              <ul class="list">
                ${prioDefs[0].items.map(g => `
                  <li>
                    <span class="mono muted">${esc(g.id)}</span>
                    <span>${esc(g.theme)}</span>
                    <span class="sub">${g.risks.length ? esc(g.risks.join(", ")) : "All"}</span>
                  </li>`).join("")}
              </ul>
            </div>
          </section>
        </div>
      </div>

      <section class="card" style="margin-top:16px" aria-labelledby="top-title">
        <div class="card-head">
          <h2 id="top-title">Highest-scoring risks</h2>
          <a class="btn ghost sm" href="#/risks">View all ${risks.length}</a>
        </div>
        <div class="card-body" style="padding-top:6px">
          <ul class="list">
            ${topRisks.map(r => `
              <li>
                <span class="mono muted">${esc(r.id)}</span>
                <span><b style="font-weight:600">${esc(r.title || r.description)}</b> <span class="sub">· ${esc(r.owner)}</span></span>
                <span>${badgeHTML(r.band, r.score)}</span>
              </li>`).join("")}
          </ul>
        </div>
      </section>
    `;

    bindHeatmap(view);
    $$(".statbar > div", view).forEach(seg => {
      seg.addEventListener("mousemove", e => tooltip.show(esc(seg.dataset.tt), e.clientX, e.clientY));
      seg.addEventListener("mouseleave", () => tooltip.hide());
    });
  }

  function badgeHTML(band, score) {
    return `<span class="badge ${bandClass(band)}"><span class="dot"></span>${esc(band)}${score != null ? ` · ${score}` : ""}</span>`;
  }

  function heatmapHTML(risks) {
    let cells = "";
    for (let l = 5; l >= 1; l--) {
      for (let i = 1; i <= 5; i++) {
        const here = risks.filter(r => r.likelihood === l && r.impact === i);
        const score = l * i;
        const band = bandFor(score).name;
        const label = `Likelihood ${l} (${levelOf(LIKELIHOOD_SCALE, l)}), impact ${i} (${levelOf(IMPACT_SCALE, i)}), score ${score}, ${band}: ` +
          (here.length ? `${here.length} risk${here.length > 1 ? "s" : ""} — ${here.map(r => r.id).join(", ")}` : "no risks");
        cells += here.length
          ? `<button type="button" class="cell has ${bandClass(band)}" data-l="${l}" data-i="${i}" aria-label="${esc(label)}">
               <span class="score-hint">${score}</span><span class="count">${here.length}</span>
             </button>`
          : `<div class="cell empty ${bandClass(band)}" role="img" aria-label="${esc(label)}"><span class="score-hint">${score}</span></div>`;
      }
    }
    return `
      <div class="heatmap-wrap">
        <div class="axis-title-y">LIKELIHOOD</div>
        <div class="axis-y">
          ${[5, 4, 3, 2, 1].map(l => `<div>${esc(levelOf(LIKELIHOOD_SCALE, l))}<b>${l}</b></div>`).join("")}
        </div>
        <div class="heatmap">${cells}</div>
        <div class="axis-x">
          ${[1, 2, 3, 4, 5].map(i => `<div><b>${i}</b>${esc(levelOf(IMPACT_SCALE, i))}</div>`).join("")}
        </div>
        <div class="axis-title-x">IMPACT</div>
      </div>`;
  }

  function bindHeatmap(root) {
    $$(".cell.has", root).forEach(cell => {
      const l = +cell.dataset.l, i = +cell.dataset.i;
      const here = Store.risks.filter(r => r.likelihood === l && r.impact === i);
      const html = `
        <div class="tt-head">L${l} × I${i} = ${l * i} · ${esc(bandFor(l * i).name)}</div>
        ${here.map(r => `<div class="tt-row"><b>${esc(r.id)}</b><span>${esc(r.title || r.description.slice(0, 60))}</span></div>`).join("")}
        <div class="tt-foot">Click to view in register</div>`;
      cell.addEventListener("mousemove", e => tooltip.show(html, e.clientX, e.clientY));
      cell.addEventListener("mouseleave", () => tooltip.hide());
      cell.addEventListener("focus", () => {
        const r = cell.getBoundingClientRect();
        tooltip.show(html, r.right, r.top);
      });
      cell.addEventListener("blur", () => tooltip.hide());
      cell.addEventListener("click", () => { location.hash = `#/risks?l=${l}&i=${i}`; });
    });
  }

  /* =========================================================
   * Risk register
   * ======================================================= */

  const regState = {
    sort: { key: "score", dir: "desc" },
    band: "", owner: "", q: "", cell: null
  };

  const COLUMNS = [
    { key: "id",          label: "ID" },
    { key: "description", label: "Risk description" },
    { key: "likelihood",  label: "Likelihood", num: true },
    { key: "impact",      label: "Impact", num: true },
    { key: "score",       label: "Score", num: true },
    { key: "band",        label: "Band" },
    { key: "treatment",   label: "Treatment" },
    { key: "owner",       label: "Owner" }
  ];

  function compare(a, b, key) {
    switch (key) {
      case "id": return idNum(a.id) - idNum(b.id) || a.id.localeCompare(b.id);
      case "band": return bandRank(a.band) - bandRank(b.band) || a.score - b.score;
      case "likelihood": case "impact": case "score": return a[key] - b[key];
      case "description": return (a.title || a.description).localeCompare(b.title || b.description);
      default: return String(a[key]).localeCompare(String(b[key]));
    }
  }

  function filteredRisks() {
    const q = regState.q.trim().toLowerCase();
    const { key, dir } = regState.sort;
    return Store.risks
      .filter(r => !regState.band || r.band === regState.band)
      .filter(r => !regState.owner || r.owner === regState.owner)
      .filter(r => !regState.cell || (r.likelihood === regState.cell.l && r.impact === regState.cell.i))
      .filter(r => !q || [r.id, r.title, r.description, r.owner, r.treatment].join(" ").toLowerCase().includes(q))
      .sort((a, b) => {
        const c = compare(a, b, key);
        return (dir === "asc" ? c : -c) || idNum(a.id) - idNum(b.id);
      });
  }

  function renderRisks(view, params) {
    // Apply deep-link filters (from dashboard KPI cards / heatmap)
    if (params.has("band") || params.has("l")) {
      regState.band = RISK_BANDS.some(b => b.name === params.get("band")) ? params.get("band") : "";
      const l = parseInt(params.get("l"), 10), i = parseInt(params.get("i"), 10);
      regState.cell = l >= 1 && l <= 5 && i >= 1 && i <= 5 ? { l, i } : null;
      regState.owner = ""; regState.q = "";
      history.replaceState(null, "", "#/risks");
    }

    const owners = Store.owners();
    if (regState.owner && !owners.includes(regState.owner)) regState.owner = "";

    view.innerHTML = `
      <div class="page-head">
        <div>
          <h1>Risk Register</h1>
          <div class="sub">Likelihood × impact (1–5 each) · bands per ISO/IEC 27001 clause 6.1.2 method · owner: CISO</div>
        </div>
        <div class="page-actions">
          <button type="button" class="btn ghost" id="reset-data" ${Store.dirty ? "" : "hidden"}>Reset to source data</button>
          <button type="button" class="btn primary" id="add-risk">＋ Add risk</button>
        </div>
      </div>

      <section class="card">
        <div class="toolbar">
          <input type="search" class="input search" id="f-q" placeholder="Search risks" aria-label="Search risks" value="${esc(regState.q)}">
          <label class="control">Band
            <select class="select" id="f-band">
              <option value="">All bands</option>
              ${RISK_BANDS.map(b => `<option ${regState.band === b.name ? "selected" : ""}>${b.name}</option>`).join("")}
            </select>
          </label>
          <label class="control">Owner
            <select class="select" id="f-owner">
              <option value="">All owners</option>
              ${owners.map(o => `<option ${regState.owner === o ? "selected" : ""}>${esc(o)}</option>`).join("")}
            </select>
          </label>
          <span id="f-chips"></span>
          <span class="spacer"></span>
          <span class="result-count" id="f-count" aria-live="polite"></span>
        </div>
        <div class="table-wrap">
          <table class="data" id="risk-table">
            <thead><tr>
              ${COLUMNS.map(c => `<th scope="col" class="${c.num ? "num" : ""}" data-key="${c.key}"><button type="button">${c.label}<span class="sort-ind" aria-hidden="true"></span></button></th>`).join("")}
            </tr></thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="table-foot">
          <span>Score = likelihood × impact. Low 1–4 · Medium 5–9 · High 10–15 · Critical 16–25. Click a row to edit.</span>
          <span>R-13 omitted from source: duplicate of R-02.</span>
        </div>
      </section>
    `;

    $("#f-q").addEventListener("input", e => { regState.q = e.target.value; drawTable(); });
    $("#f-band").addEventListener("change", e => { regState.band = e.target.value; drawTable(); });
    $("#f-owner").addEventListener("change", e => { regState.owner = e.target.value; drawTable(); });
    $$("#risk-table th").forEach(th => th.querySelector("button").addEventListener("click", () => {
      const key = th.dataset.key;
      if (regState.sort.key === key) regState.sort.dir = regState.sort.dir === "asc" ? "desc" : "asc";
      else regState.sort = { key, dir: ["score", "band", "likelihood", "impact"].includes(key) ? "desc" : "asc" };
      drawTable();
    }));
    $("#add-risk").addEventListener("click", () => openRiskDialog(null));
    $("#reset-data").addEventListener("click", () => {
      if (!confirm("Discard all added and edited risks and reload the register from data.js?")) return;
      Store.reset();
      render();
      toast("Risk register reset to source data");
    });

    drawTable();
  }

  function drawTable() {
    const rows = filteredRisks();
    const tbody = $("#risk-table tbody");
    if (!tbody) return;

    $$("#risk-table th").forEach(th => {
      const on = th.dataset.key === regState.sort.key;
      th.setAttribute("aria-sort", on ? (regState.sort.dir === "asc" ? "ascending" : "descending") : "none");
      th.querySelector(".sort-ind").textContent = on ? (regState.sort.dir === "asc" ? "▲" : "▼") : "";
    });

    tbody.innerHTML = rows.length ? rows.map(r => `
      <tr tabindex="0" data-id="${esc(r.id)}" aria-label="Edit ${esc(r.id)}">
        <td class="id">${esc(r.id)}${r.custom ? '<span class="tag-new">New</span>' : ""}</td>
        <td class="desc">
          ${r.title ? `<div class="risk-title">${esc(r.title)}</div>` : ""}
          <div class="risk-desc" title="${esc(r.description)}">${esc(r.description)}</div>
        </td>
        <td class="num">${r.likelihood}<span class="lvl">${esc(levelOf(LIKELIHOOD_SCALE, r.likelihood))}</span></td>
        <td class="num">${r.impact}<span class="lvl">${esc(levelOf(IMPACT_SCALE, r.impact))}</span></td>
        <td class="num score-cell">${r.score}</td>
        <td>${badgeHTML(r.band)}</td>
        <td>${esc(r.treatment)}</td>
        <td class="owner">${esc(r.owner)}</td>
      </tr>`).join("")
      : `<tr><td colspan="${COLUMNS.length}"><div class="empty-state">No risks match these filters.</div></td></tr>`;

    $$("tr[data-id]", tbody).forEach(tr => {
      const open = () => openRiskDialog(tr.dataset.id);
      tr.addEventListener("click", open);
      tr.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    });

    const chips = $("#f-chips");
    chips.innerHTML = regState.cell
      ? `<span class="chip">Heatmap cell: L${regState.cell.l} × I${regState.cell.i}<button type="button" aria-label="Clear heatmap filter">×</button></span>` : "";
    if (regState.cell) chips.querySelector("button").addEventListener("click", () => { regState.cell = null; drawTable(); });

    $("#f-count").textContent = `Showing ${rows.length} of ${Store.risks.length} risks`;
  }

  /* =========================================================
   * Add / edit dialog
   * ======================================================= */

  const dialog = { el: null, form: null, editingId: null };

  function setupDialog() {
    dialog.el = $("#risk-dialog");
    dialog.form = $("#risk-form");
    const f = dialog.form;

    f.likelihood.innerHTML = LIKELIHOOD_SCALE.map(s => `<option value="${s.score}">${s.score} — ${esc(s.level)}</option>`).join("");
    f.impact.innerHTML = IMPACT_SCALE.map(s => `<option value="${s.score}">${s.score} — ${esc(s.level)}</option>`).join("");
    f.treatment.innerHTML = TREATMENT_OPTIONS.map(t => `<option>${esc(t)}</option>`).join("");

    f.likelihood.addEventListener("change", updatePreview);
    f.impact.addEventListener("change", updatePreview);
    $$("[data-close]", f).forEach(b => b.addEventListener("click", () => dialog.el.close()));
    dialog.el.addEventListener("click", e => { if (e.target === dialog.el) dialog.el.close(); });

    f.addEventListener("submit", e => {
      e.preventDefault();
      saveFromDialog();
    });

    $("#delete-risk").addEventListener("click", () => {
      const id = dialog.editingId;
      if (!id || !confirm(`Delete ${id} from the register?`)) return;
      const ok = Store.remove(id);
      dialog.el.close();
      render();
      toast(ok ? `${id} deleted` : `${id} deleted (not saved — storage unavailable)`);
    });
  }

  function updatePreview() {
    const f = dialog.form;
    const score = (+f.likelihood.value) * (+f.impact.value);
    const band = bandFor(score);
    $("#preview-score").textContent = score;
    $("#preview-band").innerHTML = badgeHTML(band.name);
    $("#preview-action").textContent = band.action;
  }

  function openRiskDialog(id) {
    const f = dialog.form;
    const r = id ? Store.risks.find(x => x.id === id) : null;
    dialog.editingId = r ? r.id : null;

    f.reset();
    $$(".err", f).forEach(e => { e.textContent = ""; });
    $$(".invalid", f).forEach(e => e.classList.remove("invalid"));

    $("#risk-dialog-title").textContent = r ? `Edit ${r.id}` : "Add risk";
    $("#save-risk").textContent = r ? "Save changes" : "Add risk";
    $("#delete-risk").hidden = !r;

    f.id.value = r ? r.id : Store.nextId();
    f.title.value = r ? r.title : "";
    f.description.value = r ? r.description : "";
    f.likelihood.value = r ? r.likelihood : 3;
    f.impact.value = r ? r.impact : 3;
    f.treatment.value = r ? r.treatment : "Treat";
    if (r && !TREATMENT_OPTIONS.includes(r.treatment)) {
      f.treatment.insertAdjacentHTML("beforeend", `<option>${esc(r.treatment)}</option>`);
      f.treatment.value = r.treatment;
    }
    f.owner.value = r ? r.owner : "";
    $("#owner-list").innerHTML = Store.owners().map(o => `<option value="${esc(o)}">`).join("");

    updatePreview();
    tooltip.hide();
    dialog.el.showModal();
    f.description.focus();
  }

  function saveFromDialog() {
    const f = dialog.form;
    const data = {
      id: f.id.value.trim().toUpperCase(),
      title: f.title.value,
      description: f.description.value,
      likelihood: f.likelihood.value,
      impact: f.impact.value,
      treatment: f.treatment.value,
      owner: f.owner.value
    };

    const errors = {};
    if (!/^[A-Z0-9-]+$/.test(data.id)) errors.id = "Use letters, numbers and hyphens, e.g. R-17.";
    else if (Store.risks.some(r => r.id === data.id && r.id !== dialog.editingId)) errors.id = `${data.id} already exists.`;
    if (!data.description.trim()) errors.description = "Describe the risk.";
    if (!data.owner.trim()) errors.owner = "Assign an owner.";

    $$(".err", f).forEach(e => { e.textContent = errors[e.dataset.err] || ""; });
    ["id", "description", "owner"].forEach(k => f[k].classList.toggle("invalid", !!errors[k]));
    if (Object.keys(errors).length) {
      f[Object.keys(errors)[0]].focus();
      return;
    }

    const existing = dialog.editingId ? Store.risks.find(r => r.id === dialog.editingId) : null;
    data.custom = existing ? existing.custom : true;
    const ok = Store.upsert(data, dialog.editingId);
    dialog.el.close();
    render();
    const verb = existing ? "updated" : "added";
    toast(ok ? `${data.id} ${verb}` : `${data.id} ${verb} (not saved — storage unavailable)`);
  }

  /* =========================================================
   * Placeholder
   * ======================================================= */

  function renderPlaceholder(view, p) {
    view.innerHTML = `
      <div class="card placeholder">
        <div class="ph-icon"><svg viewBox="0 0 26 26" aria-hidden="true">${p.icon}</svg></div>
        <h1>${esc(p.title)}</h1>
        <p>This module is coming soon.</p>
        <p class="muted">${esc(p.text)}</p>
        <span class="stage">Planned for a later stage</span>
      </div>`;
  }

  /* =========================================================
   * Boot
   * ======================================================= */

  document.addEventListener("DOMContentLoaded", () => {
    tooltip.el = $("#tooltip");
    Store.init();
    setupDialog();
    window.addEventListener("hashchange", render);
    window.addEventListener("scroll", () => tooltip.hide(), { passive: true });
    if (!location.hash) history.replaceState(null, "", "#/dashboard");
    render();
  });
})();
