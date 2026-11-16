/* Lattice GRC Platform - application logic
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
  const idNum = id => { const m = /(\d+)/.exec(id); return m ? parseInt(m[1], 10) : 0; };
  const pct = (n, d) => d ? Math.round(n / d * 100) : 0;

  function clampInt(v, lo, hi) {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo;
  }

  /* Control IDs sort naturally: A.5.2 before A.5.10 */
  function controlKey(id) {
    return String(id).split(".").slice(1).map(n => parseInt(n, 10) || 0);
  }
  function compareControlIds(a, b) {
    const ka = controlKey(a), kb = controlKey(b);
    for (let i = 0; i < Math.max(ka.length, kb.length); i++) {
      const d = (ka[i] || 0) - (kb[i] || 0);
      if (d) return d;
    }
    return 0;
  }

  /* Control status vocabulary - colour language shared across modules */
  const CONTROL_STATUSES = ["Implemented", "Partial", "Planned"];
  const statusClass = s => s === "N/A" ? "na" : s.toLowerCase();
  const statusRank = s => ({ Implemented: 1, Partial: 2, Planned: 3, "N/A": 4 })[s] || 5;
  const STATUS_DESC = {
    Implemented: "Operating and evidenced",
    Partial: "In place, not complete or evidenced",
    Planned: "Accepted as needed, not in place",
    "N/A": "Excluded with justification"
  };

  /* =========================================================
   * Normalisers - every record passes through one on load and save
   * ======================================================= */

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

  function normaliseControl(c) {
    const applicable = c.applicable === "No" ? "No" : "Yes";
    const status = applicable === "No" ? "N/A"
      : (CONTROL_STATUSES.includes(c.status) ? c.status : "Planned");
    return {
      id: String(c.id || "").trim(),
      theme: String(c.theme || "").trim(),
      title: String(c.title || "").trim(),
      applicable, status,
      justification: String(c.justification || "").trim()
    };
  }

  function normaliseGap(g) {
    return {
      id: String(g.id || "").trim(),
      theme: String(g.theme || "").trim(),
      missing: String(g.missing || "").trim(),
      controls: Array.isArray(g.controls) ? g.controls.map(String) : [],
      risks: Array.isArray(g.risks) ? g.risks.map(String) : [],
      risksNote: String(g.risksNote || "").trim(),
      priority: GAP_PRIORITIES.some(p => p.key === g.priority) ? g.priority : "P3",
      phase: clampInt(g.phase, 1, ROADMAP_PHASES.length),
      status: GAP_STATUSES.includes(g.status) ? g.status : "Open",
      owner: String(g.owner || "").trim()
    };
  }

  /* =========================================================
   * Storage - one collection per module, localStorage with fallback
   * ======================================================= */

  // Prefix kept from the first release so previously saved risks still load.
  const STORAGE_PREFIX = "meridiaan-grc.";

  const storage = {
    available: (() => {
      try {
        const k = "__grc_probe__";
        window.localStorage.setItem(k, "1");
        window.localStorage.removeItem(k);
        return true;
      } catch (e) { return false; }
    })()
  };

  function createCollection(name, source, normalise) {
    const key = STORAGE_PREFIX + name;
    return {
      name,
      items: [],
      dirty: false,          // differs from source data
      staleSource: false,    // saved copy was made from an older data.js

      init() {
        let saved = null;
        if (storage.available) {
          try {
            const raw = window.localStorage.getItem(key);
            if (raw) saved = JSON.parse(raw);
          } catch (e) { saved = null; }
        }
        const list = saved && (saved.items || saved[name]); // `risks` was the original field name
        if (Array.isArray(list)) {
          this.items = list.map(normalise).filter(x => x.id);
          this.dirty = true;
          this.staleSource = saved.version !== DATA_VERSION;
        } else {
          this.items = source.map(normalise);
        }
      },

      persist() {
        this.dirty = true;
        if (!storage.available) return false;
        try {
          window.localStorage.setItem(key, JSON.stringify({
            version: DATA_VERSION,
            savedAt: new Date().toISOString(),
            [name]: this.items
          }));
          this.staleSource = false;
          return true;
        } catch (e) {
          storage.available = false; // quota or policy failure - keep working in memory
          return false;
        }
      },

      find(id) { return this.items.find(x => x.id === id); },

      upsert(item, originalId) {
        const rec = normalise(item);
        const idx = this.items.findIndex(x => x.id === (originalId || rec.id));
        if (idx >= 0) this.items[idx] = rec; else this.items.push(rec);
        return this.persist();
      },

      remove(id) {
        this.items = this.items.filter(x => x.id !== id);
        return this.persist();
      },

      reset() {
        this.items = source.map(normalise);
        this.dirty = false;
        this.staleSource = false;
        if (storage.available) {
          try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
        }
      }
    };
  }

  const Risks = createCollection("risks", RISKS, normaliseRisk);
  const Controls = createCollection("controls", CONTROLS, normaliseControl);
  const Gaps = createCollection("gaps", GAPS, normaliseGap);
  const COLLECTIONS = [Risks, Controls, Gaps];

  Risks.nextId = function () {
    const max = this.items.reduce((m, r) => Math.max(m, idNum(r.id)), 0);
    // R-13 was removed from the source as a duplicate; never reuse it.
    return "R-" + String(Math.max(max + 1, 17)).padStart(2, "0");
  };
  const uniqSorted = arr => Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));
  Risks.owners = function () { return uniqSorted(this.items.map(r => r.owner)); };
  Gaps.owners = function () { return uniqSorted(this.items.map(g => g.owner)); };

  function updateBanner() {
    const el = $("#storage-banner");
    if (!storage.available) {
      el.textContent = "Browser storage is unavailable (private window or blocked site data). " +
        "Changes will work for this session but will not be saved after a refresh.";
      el.hidden = false;
    } else if (COLLECTIONS.some(c => c.staleSource)) {
      el.innerHTML = "The source data in <code>data.js</code> has changed since your edits were saved. " +
        "You are seeing your saved copy; use <b>Reset to source data</b> in the affected module to load the new baseline.";
      el.hidden = false;
    } else {
      el.hidden = true;
    }
  }

  const savedMsg = (ok, text) => ok ? text : `${text} (not saved — storage unavailable)`;

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
   * Shared table, dialog and page helpers
   * ======================================================= */

  function headerHTML(columns) {
    return columns.map(c => c.sortable === false
      ? `<th scope="col" class="nosort">${c.label}</th>`
      : `<th scope="col" class="${c.num ? "num" : ""}" data-key="${c.key}"><button type="button">${c.label}<span class="sort-ind" aria-hidden="true"></span></button></th>`
    ).join("");
  }

  function bindSort(table, state, descKeys, redraw) {
    $$("th[data-key]", table).forEach(th => th.querySelector("button").addEventListener("click", () => {
      const key = th.dataset.key;
      if (state.sort.key === key) state.sort.dir = state.sort.dir === "asc" ? "desc" : "asc";
      else state.sort = { key, dir: descKeys.includes(key) ? "desc" : "asc" };
      redraw();
    }));
  }

  function paintSort(table, state) {
    $$("th[data-key]", table).forEach(th => {
      const on = th.dataset.key === state.sort.key;
      th.setAttribute("aria-sort", on ? (state.sort.dir === "asc" ? "ascending" : "descending") : "none");
      th.querySelector(".sort-ind").textContent = on ? (state.sort.dir === "asc" ? "▲" : "▼") : "";
    });
  }

  function bindRows(tbody, open) {
    $$("tr[data-id]", tbody).forEach(tr => {
      tr.addEventListener("click", e => { if (!e.target.closest("a")) open(tr.dataset.id); });
      tr.addEventListener("keydown", e => {
        if (e.target !== tr) return;
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(tr.dataset.id); }
      });
    });
  }

  /* Scroll to and briefly highlight a row (deep links from other modules) */
  function focusRow(tbody, id) {
    const tr = $$("tr[data-id]", tbody).find(r => r.dataset.id === id);
    if (!tr) return false;
    tr.scrollIntoView({ block: "center" });
    tr.focus({ preventScroll: true });
    tr.classList.add("flash");
    setTimeout(() => tr.classList.remove("flash"), 2400);
    return true;
  }

  function resetButtonHTML(coll) {
    return `<button type="button" class="btn ghost" id="reset-data" ${coll.dirty ? "" : "hidden"}>Reset to source data</button>`;
  }
  function bindReset(coll, label) {
    $("#reset-data").addEventListener("click", () => {
      if (!confirm(`Discard all changes to the ${label} and reload it from data.js?`)) return;
      coll.reset();
      render();
      toast(`${label[0].toUpperCase() + label.slice(1)} reset to source data`);
    });
  }

  function setupDialogChrome(dialogEl) {
    $$("[data-close]", dialogEl).forEach(b => b.addEventListener("click", () => dialogEl.close()));
    dialogEl.addEventListener("click", e => { if (e.target === dialogEl) dialogEl.close(); });
  }

  function showErrors(form, errors, fields) {
    $$(".err", form).forEach(e => { e.textContent = errors[e.dataset.err] || ""; });
    fields.forEach(k => form[k].classList.toggle("invalid", !!errors[k]));
    const first = Object.keys(errors)[0];
    if (first) form[first].focus();
    return !first;
  }
  function clearErrors(form) {
    $$(".err", form).forEach(e => { e.textContent = ""; });
    $$(".invalid", form).forEach(e => e.classList.remove("invalid"));
  }

  function badgeHTML(band, score) {
    return `<span class="badge ${bandClass(band)}"><span class="dot"></span>${esc(band)}${score != null ? ` · ${score}` : ""}</span>`;
  }
  function statusBadgeHTML(status) {
    const label = status === "N/A" ? "Not applicable" : status;
    return `<span class="badge ${statusClass(status)}"><span class="dot"></span>${esc(label)}</span>`;
  }
  function gapStatusHTML(status) {
    return `<span class="gap-status ${status.replace(/\s+/g, "-").toLowerCase()}">${esc(status)}</span>`;
  }
  const prioHTML = p => `<span class="prio ${esc(p.toLowerCase())}">${esc(p)}</span>`;

  /* Linked references (gaps -> risks / controls) */
  function riskLinkHTML(id) {
    const r = Risks.find(id);
    if (!r) return `<span class="ref-link missing" title="${esc(id)} is no longer in the risk register">${esc(id)}</span>`;
    return `<a class="ref-link" href="#/risks?focus=${encodeURIComponent(id)}" title="${esc(`${r.id} · ${r.title || r.description.slice(0, 60)} · ${r.band} (${r.score})`)}">` +
      `<span class="dot ${bandClass(r.band)}"></span>${esc(id)}</a>`;
  }
  function controlLinkHTML(id) {
    const c = Controls.find(id);
    if (!c) return `<span class="ref-link missing">${esc(id)}</span>`;
    return `<a class="ref-link mono" href="#/controls?focus=${encodeURIComponent(id)}" title="${esc(`${c.id} · ${c.title} · ${c.status === "N/A" ? "Not applicable" : c.status}`)}">` +
      `<span class="dot ${statusClass(c.status)}"></span>${esc(id)}</a>`;
  }

  /* Gap progress = share of the gap's applicable key controls that are Implemented */
  function gapProgress(g) {
    const ctrls = g.controls.map(id => Controls.find(id)).filter(c => c && c.applicable === "Yes");
    const by = { Implemented: 0, Partial: 0, Planned: 0 };
    ctrls.forEach(c => { by[c.status]++; });
    return { total: ctrls.length, ...by, pct: pct(by.Implemented, ctrls.length) };
  }

  function progressBarHTML(p) {
    const segs = CONTROL_STATUSES.filter(s => p[s] > 0)
      .map(s => `<div style="flex:${p[s]};background:var(--st-${s.toLowerCase()})"></div>`).join("");
    return `<div class="statbar mini" role="img" aria-label="${CONTROL_STATUSES.map(s => `${p[s]} ${s}`).join(", ")}">${segs || '<div style="flex:1;background:var(--border)"></div>'}</div>`;
  }

  /* =========================================================
   * Router
   * ======================================================= */

  const PLACEHOLDERS = {
    documents: { title: "Documents", text: "Manage the ISMS document set — policies, scope, SoA and procedures — with owners, versions and review dates.", icon: '<path d="M7 3h9l5 5v13H7zM16 3v5h5M10 13h8M10 17h8"/>' },
    evidence:  { title: "Evidence", text: "Link evidence records to controls and audit clauses, and see where evidence is missing or out of date.", icon: '<path d="M5 5h16v16H5zM9 3v4M17 3v4M9 14l3 3 5-5"/>' },
    incidents: { title: "Incidents", text: "Log incidents and track NIS2 and DORA reporting deadlines (early warning, notification, final report).", icon: '<path d="M13 3v3M13 20v3M3 13h3M20 13h3M13 8a5 5 0 1 1 0 10 5 5 0 0 1 0-10z"/>' },
    assurance: { title: "Client Assurance", text: "Prepare assurance packs and track audit requests from the financial-sector clients under their DORA obligations.", icon: '<path d="M4 22V11l9-7 9 7v11zM10 22v-6h6v6"/>' }
  };

  const VIEWS = {
    dashboard: { title: "Dashboard",       render: (v) => renderDashboard(v) },
    risks:     { title: "Risk Register",   render: (v, p) => renderRisks(v, p) },
    controls:  { title: "Control Library", render: (v, p) => renderControls(v, p) },
    gaps:      { title: "Gaps",            render: (v, p) => renderGaps(v, p) }
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
    if (VIEWS[route]) VIEWS[route].render(view, params);
    else if (PLACEHOLDERS[route]) renderPlaceholder(view, PLACEHOLDERS[route]);
    else { location.hash = "#/dashboard"; return; }

    document.title = ((VIEWS[route] || PLACEHOLDERS[route] || {}).title || "Lattice") + " · Lattice";
    updateBanner();
  }

  /* =========================================================
   * Dashboard
   * ======================================================= */

  function renderDashboard(view) {
    const risks = Risks.items;
    const byBand = {};
    RISK_BANDS.forEach(b => { byBand[b.name] = risks.filter(r => r.band === b.name); });

    const applicable = Controls.items.filter(c => c.applicable === "Yes");
    const excluded = Controls.items.filter(c => c.applicable === "No");
    const statusDefs = CONTROL_STATUSES.map(key => ({
      key, desc: STATUS_DESC[key], color: `var(--st-${key.toLowerCase()})`,
      n: applicable.filter(c => c.status === key).length
    }));
    const implPct = pct(statusDefs[0].n, applicable.length);

    const openGaps = Gaps.items.filter(g => g.status !== "Closed");
    const prioFill = { P1: "var(--ink)", P2: "#8b96a5", P3: "#c3c9d2" };
    const prioDefs = GAP_PRIORITIES.map(p => ({ ...p, fill: prioFill[p.key], items: openGaps.filter(g => g.priority === p.key) }));
    const maxPrio = Math.max(1, ...prioDefs.map(p => p.items.length));
    const p1Phase = ROADMAP_PHASES[0];

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
              <a class="btn ghost sm" href="#/controls">View controls</a>
            </div>
            <div class="card-body">
              <div class="headline">
                <span class="big">${implPct}%</span>
                <span class="of">fully implemented · ${statusDefs[0].n} of ${applicable.length} applicable controls</span>
              </div>
              <div class="statbar" role="img" aria-label="${statusDefs.map(s => `${s.key} ${s.n}`).join(", ")}">
                ${statusDefs.map(s => `<div style="flex:${s.n};background:${s.color}" data-tt="${esc(s.key)}: ${s.n} controls (${pct(s.n, applicable.length)}%)"></div>`).join("")}
              </div>
              <div class="stat-rows">
                ${statusDefs.map(s => `
                  <div class="stat-row">
                    <i class="sw" style="--sw:${s.color}"></i>
                    <div>${s.key} <span class="desc">· ${s.desc}</span></div>
                    <span class="n">${s.n}</span>
                    <span class="pct">${pct(s.n, applicable.length)}%</span>
                  </div>`).join("")}
              </div>
              <div class="kpi-note" style="margin-top:8px">${excluded.length
                ? `${excluded.length} control${excluded.length > 1 ? "s" : ""} excluded with justification (${excluded.map(c => `${esc(c.id)} ${esc(c.title)}`).join("; ")}).`
                : "No controls excluded."} Source: Statement of Applicability.</div>
            </div>
          </section>

          <section class="card" aria-labelledby="gap-title">
            <div class="card-head">
              <h2 id="gap-title">Open gaps by priority</h2>
              <a class="btn ghost sm" href="#/gaps">View gaps</a>
            </div>
            <div class="card-body">
              <div class="gap-bars">
                ${prioDefs.map(p => `
                  <div class="gap-bar">
                    ${prioHTML(p.key)}
                    <div class="track" title="${p.items.length} open ${p.key} gaps"><div class="fill" style="width:${p.items.length / maxPrio * 100}%;--fill:${p.fill}"></div></div>
                    <span class="n">${p.items.length}</span>
                  </div>`).join("")}
              </div>
              <div class="list-title">P1 — close now (Phase 1, ${esc(p1Phase.timeframe)})</div>
              <ul class="list">
                ${prioDefs[0].items.length ? prioDefs[0].items.map(g => `
                  <li>
                    <span class="mono muted">${esc(g.id)}</span>
                    <span>${esc(g.theme)}</span>
                    <span class="sub">${g.risks.length ? esc(g.risks.join(", ")) : esc(g.risksNote || "—")}</span>
                  </li>`).join("") : `<li><span></span><span class="sub">No open P1 gaps.</span><span></span></li>`}
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
      const here = Risks.items.filter(r => r.likelihood === l && r.impact === i);
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
    band: "", owner: "", q: "", cell: null, focus: null
  };

  const RISK_COLUMNS = [
    { key: "id",          label: "ID" },
    { key: "description", label: "Risk description" },
    { key: "likelihood",  label: "Likelihood", num: true },
    { key: "impact",      label: "Impact", num: true },
    { key: "score",       label: "Score", num: true },
    { key: "band",        label: "Band" },
    { key: "treatment",   label: "Treatment" },
    { key: "owner",       label: "Owner" }
  ];

  function compareRisks(a, b, key) {
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
    return Risks.items
      .filter(r => !regState.band || r.band === regState.band)
      .filter(r => !regState.owner || r.owner === regState.owner)
      .filter(r => !regState.cell || (r.likelihood === regState.cell.l && r.impact === regState.cell.i))
      .filter(r => !q || [r.id, r.title, r.description, r.owner, r.treatment].join(" ").toLowerCase().includes(q))
      .sort((a, b) => {
        const c = compareRisks(a, b, key);
        return (dir === "asc" ? c : -c) || idNum(a.id) - idNum(b.id);
      });
  }

  function renderRisks(view, params) {
    // Deep links: dashboard KPI cards / heatmap (band, l, i) and gap links (focus)
    if (params.has("band") || params.has("l") || params.has("focus")) {
      regState.band = RISK_BANDS.some(b => b.name === params.get("band")) ? params.get("band") : "";
      const l = parseInt(params.get("l"), 10), i = parseInt(params.get("i"), 10);
      regState.cell = l >= 1 && l <= 5 && i >= 1 && i <= 5 ? { l, i } : null;
      regState.owner = ""; regState.q = "";
      regState.focus = params.get("focus");
      history.replaceState(null, "", "#/risks");
    }

    const owners = Risks.owners();
    if (regState.owner && !owners.includes(regState.owner)) regState.owner = "";

    view.innerHTML = `
      <div class="page-head">
        <div>
          <h1>Risk Register</h1>
          <div class="sub">Likelihood × impact (1–5 each) · bands per ISO/IEC 27001 clause 6.1.2 method · owner: CISO</div>
        </div>
        <div class="page-actions">
          ${resetButtonHTML(Risks)}
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
            <thead><tr>${headerHTML(RISK_COLUMNS)}</tr></thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="table-foot">
          <span>Score = likelihood × impact. Low 1–4 · Medium 5–9 · High 10–15 · Critical 16–25. Click a row to edit.</span>
          <span>R-13 omitted from source: duplicate of R-02.</span>
        </div>
      </section>
    `;

    $("#f-q").addEventListener("input", e => { regState.q = e.target.value; drawRiskTable(); });
    $("#f-band").addEventListener("change", e => { regState.band = e.target.value; drawRiskTable(); });
    $("#f-owner").addEventListener("change", e => { regState.owner = e.target.value; drawRiskTable(); });
    bindSort($("#risk-table"), regState, ["score", "band", "likelihood", "impact"], drawRiskTable);
    $("#add-risk").addEventListener("click", () => openRiskDialog(null));
    bindReset(Risks, "risk register");

    drawRiskTable();

    if (regState.focus) {
      const id = regState.focus;
      regState.focus = null;
      if (!focusRow($("#risk-table tbody"), id)) toast(`${id} is not in the risk register`);
    }
  }

  function drawRiskTable() {
    const table = $("#risk-table");
    if (!table) return;
    const rows = filteredRisks();
    const tbody = $("tbody", table);
    paintSort(table, regState);

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
      : `<tr><td colspan="${RISK_COLUMNS.length}"><div class="empty-state">No risks match these filters.</div></td></tr>`;

    bindRows(tbody, openRiskDialog);

    const chips = $("#f-chips");
    chips.innerHTML = regState.cell
      ? `<span class="chip">Heatmap cell: L${regState.cell.l} × I${regState.cell.i}<button type="button" aria-label="Clear heatmap filter">×</button></span>` : "";
    if (regState.cell) chips.querySelector("button").addEventListener("click", () => { regState.cell = null; drawRiskTable(); });

    $("#f-count").textContent = `Showing ${rows.length} of ${Risks.items.length} risks`;
  }

  /* ---------- Risk dialog ---------- */

  const riskDialog = { el: null, form: null, editingId: null };

  function setupRiskDialog() {
    riskDialog.el = $("#risk-dialog");
    riskDialog.form = $("#risk-form");
    const f = riskDialog.form;

    f.likelihood.innerHTML = LIKELIHOOD_SCALE.map(s => `<option value="${s.score}">${s.score} — ${esc(s.level)}</option>`).join("");
    f.impact.innerHTML = IMPACT_SCALE.map(s => `<option value="${s.score}">${s.score} — ${esc(s.level)}</option>`).join("");
    f.treatment.innerHTML = TREATMENT_OPTIONS.map(t => `<option>${esc(t)}</option>`).join("");

    f.likelihood.addEventListener("change", updateRiskPreview);
    f.impact.addEventListener("change", updateRiskPreview);
    setupDialogChrome(riskDialog.el);
    f.addEventListener("submit", e => { e.preventDefault(); saveRiskDialog(); });

    $("#delete-risk").addEventListener("click", () => {
      const id = riskDialog.editingId;
      if (!id || !confirm(`Delete ${id} from the register?`)) return;
      const ok = Risks.remove(id);
      riskDialog.el.close();
      render();
      toast(savedMsg(ok, `${id} deleted`));
    });
  }

  function updateRiskPreview() {
    const f = riskDialog.form;
    const score = (+f.likelihood.value) * (+f.impact.value);
    const band = bandFor(score);
    $("#preview-score").textContent = score;
    $("#preview-band").innerHTML = badgeHTML(band.name);
    $("#preview-action").textContent = band.action;
  }

  function openRiskDialog(id) {
    const f = riskDialog.form;
    const r = id ? Risks.find(id) : null;
    riskDialog.editingId = r ? r.id : null;

    f.reset();
    clearErrors(f);

    $("#risk-dialog-title").textContent = r ? `Edit ${r.id}` : "Add risk";
    $("#save-risk").textContent = r ? "Save changes" : "Add risk";
    $("#delete-risk").hidden = !r;

    f.id.value = r ? r.id : Risks.nextId();
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
    $("#owner-list").innerHTML = Risks.owners().map(o => `<option value="${esc(o)}">`).join("");

    updateRiskPreview();
    tooltip.hide();
    riskDialog.el.showModal();
    f.description.focus();
  }

  function saveRiskDialog() {
    const f = riskDialog.form;
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
    else if (Risks.items.some(r => r.id === data.id && r.id !== riskDialog.editingId)) errors.id = `${data.id} already exists.`;
    if (!data.description.trim()) errors.description = "Describe the risk.";
    if (!data.owner.trim()) errors.owner = "Assign an owner.";
    if (!showErrors(f, errors, ["id", "description", "owner"])) return;

    const existing = riskDialog.editingId ? Risks.find(riskDialog.editingId) : null;
    data.custom = existing ? existing.custom : true;
    const ok = Risks.upsert(data, riskDialog.editingId);
    riskDialog.el.close();
    render();
    toast(savedMsg(ok, `${data.id} ${existing ? "updated" : "added"}`));
  }

  /* =========================================================
   * Control library
   * ======================================================= */

  const ctlState = {
    sort: { key: "id", dir: "asc" },
    theme: "", status: "", applicable: "", q: "", focus: null
  };

  const CONTROL_THEMES = ["Organizational", "People", "Physical", "Technological"];

  const CONTROL_COLUMNS = [
    { key: "id",            label: "Control" },
    { key: "title",         label: "Title" },
    { key: "theme",         label: "Theme" },
    { key: "applicable",    label: "Applicable" },
    { key: "justification", label: "Justification" },
    { key: "status",        label: "Status" }
  ];

  function compareControls(a, b, key) {
    switch (key) {
      case "id": return compareControlIds(a.id, b.id);
      case "status": return statusRank(a.status) - statusRank(b.status);
      case "theme": return CONTROL_THEMES.indexOf(a.theme) - CONTROL_THEMES.indexOf(b.theme);
      default: return String(a[key]).localeCompare(String(b[key]));
    }
  }

  function filteredControls() {
    const q = ctlState.q.trim().toLowerCase();
    const { key, dir } = ctlState.sort;
    return Controls.items
      .filter(c => !ctlState.theme || c.theme === ctlState.theme)
      .filter(c => !ctlState.status || c.status === ctlState.status)
      .filter(c => !ctlState.applicable || c.applicable === ctlState.applicable)
      .filter(c => !q || [c.id, c.title, c.theme, c.justification, c.status].join(" ").toLowerCase().includes(q))
      .sort((a, b) => {
        const c = compareControls(a, b, key);
        return (dir === "asc" ? c : -c) || compareControlIds(a.id, b.id);
      });
  }

  /* Summary strip items: each one is also a one-click filter */
  function controlSummary() {
    const all = Controls.items;
    const app = all.filter(c => c.applicable === "Yes");
    const count = s => app.filter(c => c.status === s).length;
    return [
      { label: "Total controls", n: all.length, note: "ISO/IEC 27001:2022 Annex A", filter: { status: "", applicable: "" } },
      { label: "Applicable", n: app.length, note: "In scope of the ISMS", filter: { status: "", applicable: "Yes" } },
      ...CONTROL_STATUSES.map(s => ({
        label: s, n: count(s), note: `${pct(count(s), app.length)}% of applicable`,
        cls: statusClass(s), filter: { status: s, applicable: "" }
      })),
      { label: "Excluded", n: all.length - app.length, note: "Not applicable, justified", cls: "na", filter: { status: "", applicable: "No" } }
    ];
  }

  function renderControls(view, params) {
    if (params.has("focus")) {
      ctlState.theme = ""; ctlState.status = ""; ctlState.applicable = ""; ctlState.q = "";
      ctlState.focus = params.get("focus");
      history.replaceState(null, "", "#/controls");
    }

    view.innerHTML = `
      <div class="page-head">
        <div>
          <h1>Control Library</h1>
          <div class="sub">ISO/IEC 27001:2022 Annex A · Statement of Applicability ${esc(ORG.ismsVersion)} · owner: CISO</div>
        </div>
        <div class="page-actions">
          ${resetButtonHTML(Controls)}
        </div>
      </div>

      <section class="card summary-strip" id="ctl-summary" aria-label="Control summary"></section>

      <section class="card">
        <div class="toolbar">
          <input type="search" class="input search" id="f-q" placeholder="Search controls" aria-label="Search controls" value="${esc(ctlState.q)}">
          <label class="control">Theme
            <select class="select" id="f-theme">
              <option value="">All themes</option>
              ${CONTROL_THEMES.map(t => `<option ${ctlState.theme === t ? "selected" : ""}>${t}</option>`).join("")}
            </select>
          </label>
          <label class="control">Status
            <select class="select" id="f-status">
              <option value="">All statuses</option>
              ${CONTROL_STATUSES.map(s => `<option ${ctlState.status === s ? "selected" : ""}>${s}</option>`).join("")}
              <option value="N/A" ${ctlState.status === "N/A" ? "selected" : ""}>Not applicable</option>
            </select>
          </label>
          <label class="control">Applicability
            <select class="select" id="f-applicable">
              <option value="">All</option>
              <option value="Yes" ${ctlState.applicable === "Yes" ? "selected" : ""}>Applicable</option>
              <option value="No" ${ctlState.applicable === "No" ? "selected" : ""}>Excluded</option>
            </select>
          </label>
          <span class="spacer"></span>
          <span class="result-count" id="f-count" aria-live="polite"></span>
        </div>
        <div class="table-wrap">
          <table class="data" id="control-table">
            <thead><tr>${headerHTML(CONTROL_COLUMNS)}</tr></thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="table-foot">
          <span>Implemented: operating and evidenced · Partial: in place, not complete or not consistently evidenced · Planned: accepted as needed, not yet in place. Click a row to edit.</span>
          <span>Source: 02-iso27001-soa</span>
        </div>
      </section>
    `;

    const bindSelect = (sel, field) => $(sel).addEventListener("change", e => { ctlState[field] = e.target.value; drawControls(); });
    $("#f-q").addEventListener("input", e => { ctlState.q = e.target.value; drawControls(); });
    bindSelect("#f-theme", "theme");
    bindSelect("#f-status", "status");
    bindSelect("#f-applicable", "applicable");
    bindSort($("#control-table"), ctlState, [], drawControls);
    bindReset(Controls, "control library");

    drawControls();

    if (ctlState.focus) {
      const id = ctlState.focus;
      ctlState.focus = null;
      if (!focusRow($("#control-table tbody"), id)) toast(`${id} is not in the control library`);
    }
  }

  function drawControls() {
    const table = $("#control-table");
    if (!table) return;
    const rows = filteredControls();
    const tbody = $("tbody", table);
    paintSort(table, ctlState);

    // Summary strip (re-drawn so its active state follows the filters)
    const strip = $("#ctl-summary");
    strip.innerHTML = controlSummary().map(s => {
      const active = ctlState.status === s.filter.status && ctlState.applicable === s.filter.applicable;
      return `<button type="button" class="sum-item ${s.cls || ""}" aria-pressed="${active}" data-status="${esc(s.filter.status)}" data-applicable="${esc(s.filter.applicable)}">
          <span class="sum-label">${s.cls ? '<span class="dot"></span>' : ""}${esc(s.label)}</span>
          <span class="sum-value">${s.n}</span>
          <span class="sum-note">${esc(s.note)}</span>
        </button>`;
    }).join("");
    $$(".sum-item", strip).forEach(b => b.addEventListener("click", () => {
      ctlState.status = b.dataset.status;
      ctlState.applicable = b.dataset.applicable;
      $("#f-status").value = ctlState.status;
      $("#f-applicable").value = ctlState.applicable;
      drawControls();
    }));

    tbody.innerHTML = rows.length ? rows.map(c => {
      const excluded = c.applicable === "No";
      return `
      <tr tabindex="0" data-id="${esc(c.id)}" class="${excluded ? "excluded" : ""}" aria-label="Edit ${esc(c.id)}${excluded ? " (excluded)" : ""}">
        <td class="id">${esc(c.id)}</td>
        <td class="ctl-title">${esc(c.title)}${excluded ? '<span class="tag-excluded">Excluded</span>' : ""}</td>
        <td class="nowrap">${esc(c.theme)}</td>
        <td class="${excluded ? "app-no" : ""}">${excluded ? "No" : "Yes"}</td>
        <td class="justif">${esc(c.justification)}</td>
        <td>${statusBadgeHTML(c.status)}</td>
      </tr>`;
    }).join("")
      : `<tr><td colspan="${CONTROL_COLUMNS.length}"><div class="empty-state">No controls match these filters.</div></td></tr>`;

    bindRows(tbody, openControlDialog);
    $("#f-count").textContent = `Showing ${rows.length} of ${Controls.items.length} controls`;
  }

  /* ---------- Control dialog ---------- */

  const ctlDialog = { el: null, form: null, editingId: null, lastStatus: "Planned" };

  function setupControlDialog() {
    ctlDialog.el = $("#control-dialog");
    ctlDialog.form = $("#control-form");
    const f = ctlDialog.form;
    setupDialogChrome(ctlDialog.el);
    f.applicable.addEventListener("change", () => fillControlStatus(f.applicable.value, ctlDialog.lastStatus));
    f.status.addEventListener("change", () => { ctlDialog.lastStatus = f.status.value; });
    f.addEventListener("submit", e => { e.preventDefault(); saveControlDialog(); });
  }

  function fillControlStatus(applicable, status) {
    const sel = ctlDialog.form.status;
    if (applicable === "No") {
      sel.innerHTML = `<option value="N/A">Not applicable</option>`;
      sel.disabled = true;
    } else {
      sel.innerHTML = CONTROL_STATUSES.map(s => `<option value="${s}">${s} — ${esc(STATUS_DESC[s].toLowerCase())}</option>`).join("");
      sel.disabled = false;
      sel.value = CONTROL_STATUSES.includes(status) ? status : "Planned";
    }
  }

  function openControlDialog(id) {
    const c = Controls.find(id);
    if (!c) return;
    const f = ctlDialog.form;
    ctlDialog.editingId = c.id;
    ctlDialog.lastStatus = c.status === "N/A" ? "Planned" : c.status;

    f.reset();
    clearErrors(f);
    $("#control-dialog-title").textContent = `${c.id} · ${c.title}`;
    $("#control-dialog-sub").textContent = `${c.theme} control · ISO/IEC 27001:2022 Annex A`;
    f.applicable.value = c.applicable;
    fillControlStatus(c.applicable, c.status);
    f.justification.value = c.justification;

    const usedBy = Gaps.items.filter(g => g.controls.includes(c.id));
    $("#control-gaps").innerHTML = usedBy.length
      ? `<span class="label">Key control in</span> ${usedBy.map(g => `<a class="ref-link" href="#/gaps?focus=${encodeURIComponent(g.id)}">${prioHTML(g.priority)} ${esc(g.id)} ${esc(g.theme)}</a>`).join(" ")}`
      : `<span class="label">Key control in</span> <span class="muted">No gap references this control.</span>`;
    $$("#control-gaps a", ctlDialog.el).forEach(a => a.addEventListener("click", () => ctlDialog.el.close()));

    tooltip.hide();
    ctlDialog.el.showModal();
    f.justification.focus();
  }

  function saveControlDialog() {
    const f = ctlDialog.form;
    const c = Controls.find(ctlDialog.editingId);
    if (!c) return;
    const data = {
      ...c,
      applicable: f.applicable.value,
      status: f.applicable.value === "No" ? "N/A" : f.status.value,
      justification: f.justification.value
    };
    const errors = {};
    if (!data.justification.trim()) errors.justification = "The SoA needs a justification for every control.";
    if (!showErrors(f, errors, ["justification"])) return;

    const ok = Controls.upsert(data, c.id);
    ctlDialog.el.close();
    render();
    toast(savedMsg(ok, `${c.id} updated`));
  }

  /* =========================================================
   * Gaps
   * ======================================================= */

  const gapState = {
    sort: { key: "priority", dir: "asc" },
    priority: "", owner: "", q: "", group: true, focus: null
  };

  const GAP_COLUMNS = [
    { key: "id",       label: "ID" },
    { key: "theme",    label: "Gap" },
    { key: "controls", label: "Key controls", sortable: false },
    { key: "risks",    label: "Risks left open", sortable: false },
    { key: "priority", label: "Priority" },
    { key: "owner",    label: "Owner" },
    { key: "phase",    label: "Phase" },
    { key: "progress", label: "Progress" }
  ];

  const prioRank = p => GAP_PRIORITIES.findIndex(x => x.key === p);

  function compareGaps(a, b, key) {
    switch (key) {
      case "id": return idNum(a.id) - idNum(b.id);
      case "priority": return prioRank(a.priority) - prioRank(b.priority);
      case "phase": return a.phase - b.phase;
      case "progress": return gapProgress(a).pct - gapProgress(b).pct;
      default: return String(a[key]).localeCompare(String(b[key]));
    }
  }

  function filteredGaps() {
    const q = gapState.q.trim().toLowerCase();
    const { key, dir } = gapState.sort;
    return Gaps.items
      .filter(g => !gapState.priority || g.priority === gapState.priority)
      .filter(g => !gapState.owner || g.owner === gapState.owner)
      .filter(g => !q || [g.id, g.theme, g.missing, g.owner, g.controls.join(" "), g.risks.join(" ")].join(" ").toLowerCase().includes(q))
      .sort((a, b) => {
        const c = compareGaps(a, b, key);
        return (dir === "asc" ? c : -c) || idNum(a.id) - idNum(b.id);
      });
  }

  function renderGaps(view, params) {
    if (params.has("focus")) {
      gapState.priority = ""; gapState.owner = ""; gapState.q = "";
      gapState.focus = params.get("focus");
      history.replaceState(null, "", "#/gaps");
    }
    const owners = Gaps.owners();
    if (gapState.owner && !owners.includes(gapState.owner)) gapState.owner = "";

    view.innerHTML = `
      <div class="page-head">
        <div>
          <h1>Gaps</h1>
          <div class="sub">Gap assessment and remediation roadmap · ISO/IEC 27001 clauses 6.1.3, 9 and 10 · owner: CISO</div>
        </div>
        <div class="page-actions">
          ${resetButtonHTML(Gaps)}
        </div>
      </div>

      <section class="card">
        <div class="toolbar">
          <input type="search" class="input search" id="f-q" placeholder="Search gaps" aria-label="Search gaps" value="${esc(gapState.q)}">
          <label class="control">Priority
            <select class="select" id="f-priority">
              <option value="">All priorities</option>
              ${GAP_PRIORITIES.map(p => `<option value="${p.key}" ${gapState.priority === p.key ? "selected" : ""}>${p.key} — ${esc(p.label)}</option>`).join("")}
            </select>
          </label>
          <label class="control">Owner
            <select class="select" id="f-owner">
              <option value="">All owners</option>
              ${owners.map(o => `<option ${gapState.owner === o ? "selected" : ""}>${esc(o)}</option>`).join("")}
            </select>
          </label>
          <label class="control check">
            <input type="checkbox" id="f-group" ${gapState.group ? "checked" : ""}> Group by priority
          </label>
          <span class="spacer"></span>
          <span class="result-count" id="f-count" aria-live="polite"></span>
        </div>
        <div class="table-wrap">
          <table class="data" id="gap-table">
            <thead><tr>${headerHTML(GAP_COLUMNS)}</tr></thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="table-foot">
          <span>Progress = share of each gap's key controls marked Implemented in the Control Library. Click a row to edit; click a risk or control to open it.</span>
          <span>Source: 04-gap-assessment · owners derived</span>
        </div>
      </section>
    `;

    $("#f-q").addEventListener("input", e => { gapState.q = e.target.value; drawGaps(); });
    $("#f-priority").addEventListener("change", e => { gapState.priority = e.target.value; drawGaps(); });
    $("#f-owner").addEventListener("change", e => { gapState.owner = e.target.value; drawGaps(); });
    $("#f-group").addEventListener("change", e => { gapState.group = e.target.checked; drawGaps(); });
    bindSort($("#gap-table"), gapState, ["progress"], drawGaps);
    bindReset(Gaps, "gaps");

    drawGaps();

    if (gapState.focus) {
      const id = gapState.focus;
      gapState.focus = null;
      if (!focusRow($("#gap-table tbody"), id)) toast(`${id} is not in the gap list`);
    }
  }

  function gapRowHTML(g) {
    const p = gapProgress(g);
    const phase = ROADMAP_PHASES.find(x => x.phase === g.phase) || {};
    return `
      <tr tabindex="0" data-id="${esc(g.id)}" class="${g.status === "Closed" ? "closed" : ""}" aria-label="Edit ${esc(g.id)}">
        <td class="id">${esc(g.id)}</td>
        <td class="desc gap-desc">
          <div class="risk-title">${esc(g.theme)}</div>
          <div class="risk-desc" title="${esc(g.missing)}">${esc(g.missing)}</div>
        </td>
        <td class="refs"><div class="ref-links">${g.controls.map(controlLinkHTML).join("")}</div></td>
        <td class="refs risks"><div class="ref-links">${g.risks.length ? g.risks.map(riskLinkHTML).join("") : `<span class="muted">${esc(g.risksNote || "—")}</span>`}</div></td>
        <td>${prioHTML(g.priority)}</td>
        <td class="owner">${esc(g.owner)}</td>
        <td class="nowrap">Phase ${g.phase}<span class="lvl">${esc(phase.timeframe || "")}</span></td>
        <td class="progress-cell">
          ${progressBarHTML(p)}
          <div class="progress-text"><b>${p.Implemented}</b> of ${p.total} implemented</div>
          ${gapStatusHTML(g.status)}
        </td>
      </tr>`;
  }

  function drawGaps() {
    const table = $("#gap-table");
    if (!table) return;
    const rows = filteredGaps();
    const tbody = $("tbody", table);
    paintSort(table, gapState);

    let html = "";
    if (!rows.length) {
      html = `<tr><td colspan="${GAP_COLUMNS.length}"><div class="empty-state">No gaps match these filters.</div></td></tr>`;
    } else if (gapState.group) {
      GAP_PRIORITIES.forEach(pr => {
        const inGroup = rows.filter(g => g.priority === pr.key);
        if (!inGroup.length) return;
        html += `<tr class="group-row"><th colspan="${GAP_COLUMNS.length}" scope="rowgroup">
            ${prioHTML(pr.key)} <span class="group-label">${esc(pr.label)}</span>
            <span class="group-meta">${inGroup.length} gap${inGroup.length > 1 ? "s" : ""}${pr.meaning && pr.meaning !== pr.label ? ` · ${esc(pr.meaning)}` : ""}</span>
          </th></tr>`;
        html += inGroup.map(gapRowHTML).join("");
      });
    } else {
      html = rows.map(gapRowHTML).join("");
    }
    tbody.innerHTML = html;

    bindRows(tbody, openGapDialog);
    const open = rows.filter(g => g.status !== "Closed").length;
    $("#f-count").textContent = `Showing ${rows.length} of ${Gaps.items.length} gaps · ${open} open`;
  }

  /* ---------- Gap dialog ---------- */

  const gapDialog = { el: null, form: null, editingId: null };

  function setupGapDialog() {
    gapDialog.el = $("#gap-dialog");
    gapDialog.form = $("#gap-form");
    const f = gapDialog.form;
    f.status.innerHTML = GAP_STATUSES.map(s => `<option>${esc(s)}</option>`).join("");
    f.priority.innerHTML = GAP_PRIORITIES.map(p => `<option value="${p.key}">${p.key} — ${esc(p.label)}</option>`).join("");
    f.phase.innerHTML = ROADMAP_PHASES.map(p => `<option value="${p.phase}">Phase ${p.phase} — ${esc(p.name)} (${esc(p.timeframe)})</option>`).join("");
    setupDialogChrome(gapDialog.el);
    f.addEventListener("submit", e => { e.preventDefault(); saveGapDialog(); });
  }

  function openGapDialog(id) {
    const g = Gaps.find(id);
    if (!g) return;
    const f = gapDialog.form;
    gapDialog.editingId = g.id;

    f.reset();
    clearErrors(f);
    $("#gap-dialog-title").textContent = `${g.id} · ${g.theme}`;
    $("#gap-dialog-sub").textContent = "Gap assessment · remediation roadmap";
    $("#gap-missing").textContent = g.missing;
    f.status.value = g.status;
    f.priority.value = g.priority;
    f.phase.value = String(g.phase);
    f.owner.value = g.owner;
    $("#gap-owner-list").innerHTML = uniqSorted([...Risks.owners(), ...Gaps.owners()]).map(o => `<option value="${esc(o)}">`).join("");

    const p = gapProgress(g);
    $("#gap-refs").innerHTML = `
      <div><span class="label">Key controls</span> <span class="ref-links">${g.controls.map(controlLinkHTML).join("")}</span></div>
      <div><span class="label">Risks left open</span> <span class="ref-links">${g.risks.length ? g.risks.map(riskLinkHTML).join("") : `<span class="muted">${esc(g.risksNote || "—")}</span>`}</span></div>
      <div><span class="label">Progress</span> ${p.Implemented} of ${p.total} key controls implemented (${p.pct}%). Update control status in the Control Library.</div>`;
    $$("#gap-refs a", gapDialog.el).forEach(a => a.addEventListener("click", () => gapDialog.el.close()));

    tooltip.hide();
    gapDialog.el.showModal();
    f.status.focus();
  }

  function saveGapDialog() {
    const f = gapDialog.form;
    const g = Gaps.find(gapDialog.editingId);
    if (!g) return;
    const data = { ...g, status: f.status.value, priority: f.priority.value, phase: f.phase.value, owner: f.owner.value };
    const errors = {};
    if (!data.owner.trim()) errors.owner = "Assign an owner.";
    if (!showErrors(f, errors, ["owner"])) return;

    const ok = Gaps.upsert(data, g.id);
    gapDialog.el.close();
    render();
    toast(savedMsg(ok, `${g.id} updated`));
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
    COLLECTIONS.forEach(c => c.init());
    setupRiskDialog();
    setupControlDialog();
    setupGapDialog();
    window.addEventListener("hashchange", render);
    window.addEventListener("scroll", () => tooltip.hide(), { passive: true });
    if (!location.hash) history.replaceState(null, "", "#/dashboard");
    render();
  });
})();
