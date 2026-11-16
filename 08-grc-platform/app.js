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

  const DOC_REVIEW_OPTIONS = [
    { months: 3, label: "Quarterly" },
    { months: 6, label: "Six-monthly" },
    { months: 12, label: "Annually" },
    { months: 24, label: "Every 2 years" }
  ];
  const isISODate = v => /^\d{4}-\d{2}-\d{2}$/.test(v || "") && !isNaN(Date.parse(v));
  const strList = v => Array.isArray(v) ? v.map(String) : [];

  function normaliseDocument(d) {
    const months = parseInt(d.reviewMonths, 10);
    return {
      id: String(d.id || "").trim(),
      name: String(d.name || "").trim(),
      purpose: String(d.purpose || "").trim(),
      type: DOC_TYPES.includes(d.type) ? d.type : "Record",
      owner: String(d.owner || "").trim(),
      approver: String(d.approver || "").trim(),
      version: String(d.version || "").trim(),
      status: DOC_STATUSES.includes(d.status) ? d.status : "Draft",
      lastReviewed: isISODate(d.lastReviewed) ? d.lastReviewed : "",
      firstDue: isISODate(d.firstDue) ? d.firstDue : "",
      reviewMonths: DOC_REVIEW_OPTIONS.some(o => o.months === months) ? months : 12,
      reviewNote: String(d.reviewNote || "").trim(),
      path: String(d.path || "").trim(),
      rewrite: String(d.rewrite || "").trim(),
      module: String(d.module || "").trim(),
      clauses: String(d.clauses || "").trim(),
      controls: strList(d.controls), controlsNote: String(d.controlsNote || "").trim(),
      risks: strList(d.risks), risksNote: String(d.risksNote || "").trim(),
      gaps: strList(d.gaps), gapsNote: String(d.gapsNote || "").trim()
    };
  }

  const bool = v => v === true || v === "Yes" || v === "true";
  const isTimestamp = v => typeof v === "string" && !isNaN(Date.parse(v));

  function normaliseIncident(i) {
    const obligations = {};
    REPORTING_OBLIGATIONS.forEach(o => {
      const done = i.obligations && i.obligations[o.key];
      if (done && isTimestamp(done.doneAt)) obligations[o.key] = { doneAt: new Date(done.doneAt).toISOString() };
    });
    const financialClient = bool(i.financialClient);
    return {
      id: String(i.id || "").trim(),
      title: String(i.title || "").trim(),
      description: String(i.description || "").trim(),
      awareAt: isTimestamp(i.awareAt) ? new Date(i.awareAt).toISOString() : new Date().toISOString(),
      severity: INCIDENT_SEVERITIES.includes(i.severity) ? i.severity : "Medium",
      significant: bool(i.significant),
      services: strList(i.services).filter(s => INCIDENT_SERVICES.includes(s)),
      personalData: bool(i.personalData),
      financialClient,
      clients: financialClient ? strList(i.clients).filter(c => FINANCIAL_CLIENTS.includes(c)) : [],
      status: INCIDENT_STATUSES.includes(i.status) ? i.status : "Open",
      closedAt: isTimestamp(i.closedAt) ? new Date(i.closedAt).toISOString() : "",
      risks: strList(i.risks),
      example: !!i.example,
      obligations
    };
  }

  /* =========================================================
   * Dates - ISO yyyy-mm-dd strings, compared as whole days (UTC)
   * ======================================================= */

  const DAY_MS = 86400000;
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const isoToUTC = iso => { const [y, m, d] = iso.split("-").map(Number); return Date.UTC(y, m - 1, d); };
  const utcToISO = ms => new Date(ms).toISOString().slice(0, 10);
  function todayISO() {
    const n = new Date();
    return utcToISO(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
  }
  function addMonths(iso, months) {
    const [y, m, d] = iso.split("-").map(Number);
    const target = new Date(Date.UTC(y, m - 1 + months, 1));
    const lastDay = new Date(Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0)).getUTCDate();
    target.setUTCDate(Math.min(d, lastDay));
    return utcToISO(target.getTime());
  }
  const daysBetween = (fromISO, toISO) => Math.round((isoToUTC(toISO) - isoToUTC(fromISO)) / DAY_MS);
  function fmtDate(iso) {
    if (!iso) return "";
    const [y, m, d] = iso.split("-").map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  }
  const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

  /* Timestamps (incidents) - stored as ISO UTC, shown in local time */
  const HOUR_MS = 3600000;
  const pad2 = n => String(n).padStart(2, "0");
  function fmtDateTime(iso) {
    const d = new Date(iso);
    return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }
  function toLocalInput(iso) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }
  function addMonthsMs(ms, months) {
    const d = new Date(ms);
    const day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + months);
    d.setDate(Math.min(day, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()));
    return d.getTime();
  }
  /* 2 d 04 h 10 m · 20 h 39 m 12 s · 39 m 12 s */
  function fmtDuration(ms) {
    const s = Math.floor(Math.abs(ms) / 1000);
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    if (d) return `${d} d ${pad2(h)} h ${pad2(m)} m`;
    if (h) return `${h} h ${pad2(m)} m ${pad2(sec)} s`;
    return `${m} m ${pad2(sec)} s`;
  }
  /* Coarser wording for sentences: "3 h", "2 d 4 h", "25 min" */
  function fmtSpan(ms) {
    const mins = Math.round(Math.abs(ms) / 60000);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    if (h < 48) return `${h} h${mins % 60 && h < 10 ? ` ${mins % 60} min` : ""}`;
    return `${Math.floor(h / 24)} d ${h % 24} h`;
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
  const Documents = createCollection("documents", DOCUMENTS, normaliseDocument);
  /* Incidents: the worked example is dated relative to the first time this
   * browser opens Lattice (saved as an anchor), so its clocks are live and
   * keep running across reloads. Reset restarts it from "now". */
  const INCIDENT_ANCHOR_KEY = STORAGE_PREFIX + "incidents.anchor";
  const INCIDENT_SEED = [];
  function seedIncidents(fresh) {
    let anchor = 0;
    if (storage.available) {
      try {
        if (fresh) window.localStorage.removeItem(INCIDENT_ANCHOR_KEY);
        anchor = parseInt(window.localStorage.getItem(INCIDENT_ANCHOR_KEY), 10) || 0;
        if (!anchor) { anchor = Date.now(); window.localStorage.setItem(INCIDENT_ANCHOR_KEY, String(anchor)); }
      } catch (e) { anchor = 0; }
    }
    if (!anchor) anchor = Date.now();
    INCIDENT_SEED.splice(0, INCIDENT_SEED.length, ...INCIDENTS.map(i => {
      const { awareMinutesAgo, ...rest } = i;
      return { ...rest, awareAt: rest.awareAt || new Date(anchor - (awareMinutesAgo || 0) * 60000).toISOString() };
    }));
  }
  seedIncidents(false);
  const Incidents = createCollection("incidents", INCIDENT_SEED, normaliseIncident);
  const resetIncidents = Incidents.reset.bind(Incidents);
  Incidents.reset = function () { seedIncidents(true); resetIncidents(); };

  const COLLECTIONS = [Risks, Controls, Gaps, Documents, Incidents];

  Risks.nextId = function () {
    const max = this.items.reduce((m, r) => Math.max(m, idNum(r.id)), 0);
    // R-13 was removed from the source as a duplicate; never reuse it.
    return "R-" + String(Math.max(max + 1, 17)).padStart(2, "0");
  };
  const uniqSorted = arr => Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b));
  Risks.owners = function () { return uniqSorted(this.items.map(r => r.owner)); };
  Gaps.owners = function () { return uniqSorted(this.items.map(g => g.owner)); };
  Documents.owners = function () { return uniqSorted(this.items.map(d => d.owner)); };
  const allPeople = () => uniqSorted([...Risks.owners(), ...Gaps.owners(), ...Documents.owners(), ...Documents.items.map(d => d.approver)]);

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

  function gapLinkHTML(id) {
    const g = Gaps.find(id);
    if (!g) return `<span class="ref-link missing">${esc(id)}</span>`;
    return `<a class="ref-link" href="#/gaps?focus=${encodeURIComponent(id)}" title="${esc(`${g.id} · ${g.theme} · ${g.status}`)}">${prioHTML(g.priority)} ${esc(g.id)} ${esc(g.theme)}</a>`;
  }
  function docLinkHTML(d) {
    const rv = docReview(d);
    const flag = rv.state === "Current" ? "" : `<span class="dot rv-${rv.cls}"></span>`;
    return `<a class="ref-link" href="#/documents?focus=${encodeURIComponent(d.id)}" title="${esc(`${d.name} · ${rv.text}`)}">${flag}${esc(d.name)}</a>`;
  }

  function docsFor(pred) {
    const list = Documents.items.filter(pred);
    return list.length ? list.map(docLinkHTML).join("") : '<span class="muted">No document references this.</span>';
  }

  /* Documents review status: Overdue / Due soon (within 60 days) / Current */
  const DUE_SOON_DAYS = 60;
  const REVIEW_STATES = ["Overdue", "Due soon", "Current"];

  function docDueDate(d) {
    return d.lastReviewed ? addMonths(d.lastReviewed, d.reviewMonths) : d.firstDue;
  }
  function docReview(d) {
    const due = docDueDate(d);
    if (!due) return { state: "Overdue", cls: "overdue", due: "", days: -Infinity, text: "No review date set" };
    const days = daysBetween(todayISO(), due);
    if (days < 0) return { state: "Overdue", cls: "overdue", due, days, text: `Overdue by ${plural(-days, "day")}` };
    if (days <= DUE_SOON_DAYS) return { state: "Due soon", cls: "due-soon", due, days, text: days === 0 ? "Due today" : `Due in ${plural(days, "day")}` };
    return { state: "Current", cls: "current", due, days, text: "Current" };
  }

  const ICON_WARN = '<svg class="rv-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 2.5 18.5 17h-17z"/><path d="M10 8v4.2M10 14.6v.4"/></svg>';
  const ICON_CLOCK = '<svg class="rv-icon" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4.5l3 2"/></svg>';

  function reviewStatusHTML(rv) {
    if (rv.state === "Overdue") {
      return `<span class="rv overdue">${ICON_WARN}Overdue</span><span class="rv-days">${rv.due ? esc(plural(-rv.days, "day")) + " overdue" : "No review date"}</span>`;
    }
    if (rv.state === "Due soon") return `<span class="rv due-soon">${ICON_CLOCK}${esc(rv.text)}</span>`;
    return `<span class="rv current">Current</span>`;
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
    evidence:  { title: "Evidence", text: "Link evidence records to controls and audit clauses, and see where evidence is missing or out of date.", icon: '<path d="M5 5h16v16H5zM9 3v4M17 3v4M9 14l3 3 5-5"/>' },
    assurance: { title: "Client Assurance", text: "Prepare assurance packs and track audit requests from the financial-sector clients under their DORA obligations.", icon: '<path d="M4 22V11l9-7 9 7v11zM10 22v-6h6v6"/>' }
  };

  const VIEWS = {
    dashboard: { title: "Dashboard",       render: (v) => renderDashboard(v) },
    risks:     { title: "Risk Register",   render: (v, p) => renderRisks(v, p) },
    controls:  { title: "Control Library", render: (v, p) => renderControls(v, p) },
    gaps:      { title: "Gaps",            render: (v, p) => renderGaps(v, p) },
    documents: { title: "Documents",       render: (v, p) => renderDocuments(v, p) },
    incidents: { title: "Incidents",       render: (v, p) => renderIncidents(v, p) }
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
    updateNavCounts();
  }

  /* Flag by exception in the sidebar: overdue document reviews and reports */
  function setNavCount(sel, n, title) {
    const el = $(sel);
    if (!el) return;
    el.textContent = n;
    el.hidden = !n;
    el.title = title;
  }
  function updateNavCounts() {
    const docs = Documents.items.filter(d => docReview(d).state === "Overdue").length;
    setNavCount("#nav-doc-count", docs, `${plural(docs, "document")} overdue for review`);
    const reports = overdueObligationCount();
    setNavCount("#nav-inc-count", reports, `${plural(reports, "reporting obligation")} overdue`);
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
    $("#control-gaps").innerHTML = `
      <div><span class="label">Key control in</span> ${usedBy.length
        ? `<span class="ref-links">${usedBy.map(g => gapLinkHTML(g.id)).join("")}</span>`
        : `<span class="muted">No gap references this control.</span>`}</div>
      <div><span class="label">Documents</span> <span class="ref-links">${docsFor(d => d.controls.includes(c.id))}</span></div>`;
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
      <div><span class="label">Documents</span> <span class="ref-links">${docsFor(d => d.gaps.includes(g.id))}</span></div>
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
   * Documents
   * ======================================================= */

  const docState = {
    sort: { key: "review", dir: "asc" },   // most overdue first
    type: "", owner: "", review: "", status: "", q: "", focus: null
  };

  const DOC_COLUMNS = [
    { key: "name",         label: "Document" },
    { key: "type",         label: "Type" },
    { key: "owner",        label: "Owner" },
    { key: "approver",     label: "Approver" },
    { key: "version",      label: "Version" },
    { key: "status",       label: "Status" },
    { key: "lastReviewed", label: "Reviewed" },
    { key: "reviewMonths", label: "Frequency" },
    { key: "due",          label: "Next due" },
    { key: "review",       label: "Review status" }
  ];

  const freqLabel = m => (DOC_REVIEW_OPTIONS.find(o => o.months === m) || {}).label || `Every ${m} months`;
  const notApproved = d => d.status !== "Approved";

  function compareDocs(a, b, key) {
    switch (key) {
      case "review": case "due": {
        const da = docReview(a).days, db = docReview(b).days;
        return da === db ? 0 : da < db ? -1 : 1;
      }
      case "type": return DOC_TYPES.indexOf(a.type) - DOC_TYPES.indexOf(b.type);
      case "status": return DOC_STATUSES.indexOf(a.status) - DOC_STATUSES.indexOf(b.status);
      case "reviewMonths": return a.reviewMonths - b.reviewMonths;
      case "version": return (parseFloat(a.version) || 0) - (parseFloat(b.version) || 0);
      case "lastReviewed": return (a.lastReviewed || "0").localeCompare(b.lastReviewed || "0");
      default: return String(a[key]).localeCompare(String(b[key]));
    }
  }

  function filteredDocs() {
    const q = docState.q.trim().toLowerCase();
    const { key, dir } = docState.sort;
    return Documents.items
      .filter(d => !docState.type || d.type === docState.type)
      .filter(d => !docState.owner || d.owner === docState.owner)
      .filter(d => !docState.review || docReview(d).state === docState.review)
      .filter(d => !docState.status || (docState.status === "!Approved" ? notApproved(d) : d.status === docState.status))
      .filter(d => !q || [d.id, d.name, d.purpose, d.type, d.owner, d.approver, d.status, d.path].join(" ").toLowerCase().includes(q))
      .sort((a, b) => {
        const c = compareDocs(a, b, key);
        return (dir === "asc" ? c : -c) || idNum(a.id) - idNum(b.id);
      });
  }

  /* Summary strip: exceptions first; each item is also a one-click filter */
  function docSummary() {
    const all = Documents.items;
    const by = s => all.filter(d => docReview(d).state === s).length;
    const overdue = by("Overdue"), soon = by("Due soon");
    const policies = all.filter(d => d.type === "Policy").length;
    return [
      { label: "Overdue", n: overdue, note: overdue ? "Review and re-approve now" : "Nothing overdue", cls: overdue ? "alert" : "", icon: overdue ? ICON_WARN : "", filter: { review: "Overdue", status: "" } },
      { label: "Due soon", n: soon, note: `Due within ${DUE_SOON_DAYS} days`, cls: soon ? "warn" : "", icon: soon ? ICON_CLOCK : "", filter: { review: "Due soon", status: "" } },
      { label: "Current", n: by("Current"), note: "No action needed", filter: { review: "Current", status: "" } },
      { label: "Not yet approved", n: all.filter(notApproved).length, note: "Draft or not started", filter: { review: "", status: "!Approved" } },
      { label: "All documents", n: all.length, note: `${policies} policies · ${all.length - policies} other`, filter: { review: "", status: "" } }
    ];
  }

  function renderDocuments(view, params) {
    if (params.has("focus")) {
      docState.type = ""; docState.owner = ""; docState.review = ""; docState.status = ""; docState.q = "";
      docState.focus = params.get("focus");
      history.replaceState(null, "", "#/documents");
    }
    const owners = Documents.owners();
    if (docState.owner && !owners.includes(docState.owner)) docState.owner = "";

    view.innerHTML = `
      <div class="page-head">
        <div>
          <h1>Documents</h1>
          <div class="sub">ISMS documented information · ISO/IEC 27001 clause 7.5 · review status as at ${esc(fmtDate(todayISO()))}</div>
        </div>
        <div class="page-actions">
          ${resetButtonHTML(Documents)}
        </div>
      </div>

      <section class="card summary-strip docs" id="doc-summary" aria-label="Document review summary"></section>

      <section class="card">
        <div class="toolbar">
          <input type="search" class="input search" id="f-q" placeholder="Search documents" aria-label="Search documents" value="${esc(docState.q)}">
          <label class="control">Type
            <select class="select" id="f-type">
              <option value="">All types</option>
              ${DOC_TYPES.map(t => `<option ${docState.type === t ? "selected" : ""}>${t}</option>`).join("")}
            </select>
          </label>
          <label class="control">Owner
            <select class="select" id="f-owner">
              <option value="">All owners</option>
              ${owners.map(o => `<option ${docState.owner === o ? "selected" : ""}>${esc(o)}</option>`).join("")}
            </select>
          </label>
          <label class="control">Review
            <select class="select" id="f-review">
              <option value="">All review states</option>
              ${REVIEW_STATES.map(s => `<option ${docState.review === s ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </label>
          <label class="control">Status
            <select class="select" id="f-status">
              <option value="">All statuses</option>
              ${DOC_STATUSES.map(s => `<option ${docState.status === s ? "selected" : ""}>${s}</option>`).join("")}
              <option value="!Approved" ${docState.status === "!Approved" ? "selected" : ""}>Not yet approved</option>
            </select>
          </label>
          <span class="spacer"></span>
          <span class="result-count" id="f-count" aria-live="polite"></span>
        </div>
        <div class="table-wrap">
          <table class="data" id="doc-table">
            <thead><tr>${headerHTML(DOC_COLUMNS)}</tr></thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="table-foot">
          <span>Next review due = last reviewed + review frequency. Due soon = within ${DUE_SOON_DAYS} days. Click a document for its controls, risks, gaps and next step.</span>
          <span>Source: document headers in 00–07 · older versions and records outside the repo are illustrative</span>
        </div>
      </section>
    `;

    const bindSelect = (sel, field) => $(sel).addEventListener("change", e => { docState[field] = e.target.value; drawDocuments(); });
    $("#f-q").addEventListener("input", e => { docState.q = e.target.value; drawDocuments(); });
    bindSelect("#f-type", "type");
    bindSelect("#f-owner", "owner");
    bindSelect("#f-review", "review");
    bindSelect("#f-status", "status");
    bindSort($("#doc-table"), docState, [], drawDocuments);
    bindReset(Documents, "document register");

    drawDocuments();

    if (docState.focus) {
      const id = docState.focus;
      docState.focus = null;
      if (!focusRow($("#doc-table tbody"), id)) toast(`${id} is not in the document register`);
    }
  }

  function docRowHTML(d) {
    const rv = docReview(d);
    return `
      <tr tabindex="0" data-id="${esc(d.id)}" class="rv-row-${rv.cls}" aria-label="Open ${esc(d.name)}: ${esc(rv.text)}">
        <td class="desc doc-desc">
          <div class="risk-title">${esc(d.name)}</div>
          <div class="risk-desc" title="${esc(d.purpose)}">${esc(d.purpose)}</div>
        </td>
        <td>${esc(d.type)}</td>
        <td class="owner">${esc(d.owner)}</td>
        <td class="owner">${d.approver ? esc(d.approver) : '<span class="muted">Not assigned</span>'}</td>
        <td class="mono-cell">${d.version ? esc(d.version) : '<span class="muted">—</span>'}</td>
        <td class="nowrap doc-status ${d.status === "Approved" ? "" : "unapproved"}">${esc(d.status)}${d.rewrite ? '<span class="lvl">Rewrite drafted</span>' : ""}</td>
        <td class="nowrap">${d.lastReviewed ? esc(fmtDate(d.lastReviewed)) : '<span class="muted">Never</span>'}</td>
        <td class="nowrap">${esc(freqLabel(d.reviewMonths))}</td>
        <td class="nowrap due-cell ${rv.cls}">${rv.due ? esc(fmtDate(rv.due)) : "—"}${d.lastReviewed ? "" : '<span class="lvl">First issue</span>'}</td>
        <td class="nowrap rv-cell">${reviewStatusHTML(rv)}</td>
      </tr>`;
  }

  function drawDocuments() {
    const table = $("#doc-table");
    if (!table) return;
    const rows = filteredDocs();
    const tbody = $("tbody", table);
    paintSort(table, docState);

    const strip = $("#doc-summary");
    strip.innerHTML = docSummary().map(s => {
      const active = docState.review === s.filter.review && docState.status === s.filter.status;
      return `<button type="button" class="sum-item ${s.cls || ""}" aria-pressed="${active}" data-review="${esc(s.filter.review)}" data-status="${esc(s.filter.status)}">
          <span class="sum-label">${s.icon || ""}${esc(s.label)}</span>
          <span class="sum-value">${s.n}</span>
          <span class="sum-note">${esc(s.note)}</span>
        </button>`;
    }).join("");
    $$(".sum-item", strip).forEach(b => b.addEventListener("click", () => {
      docState.review = b.dataset.review;
      docState.status = b.dataset.status;
      $("#f-review").value = docState.review;
      $("#f-status").value = docState.status;
      drawDocuments();
    }));

    tbody.innerHTML = rows.length ? rows.map(docRowHTML).join("")
      : `<tr><td colspan="${DOC_COLUMNS.length}"><div class="empty-state">No documents match these filters.</div></td></tr>`;

    bindRows(tbody, openDocDialog);
    $("#f-count").textContent = `Showing ${rows.length} of ${Documents.items.length} documents`;
  }

  /* ---------- Document detail panel ---------- */

  const docDialog = { el: null, form: null, editingId: null };

  function setupDocDialog() {
    docDialog.el = $("#doc-dialog");
    docDialog.form = $("#doc-form");
    const f = docDialog.form;
    f.status.innerHTML = DOC_STATUSES.map(s => `<option>${esc(s)}</option>`).join("");
    f.reviewMonths.innerHTML = DOC_REVIEW_OPTIONS.map(o => `<option value="${o.months}">${esc(o.label)}</option>`).join("");
    setupDialogChrome(docDialog.el);
    ["lastReviewed", "reviewMonths", "firstDue"].forEach(k => f[k].addEventListener("input", updateDocDuePreview));
    f.reviewMonths.addEventListener("change", updateDocDuePreview);
    f.addEventListener("submit", e => { e.preventDefault(); saveDocDialog(); });
    $("#doc-reviewed").addEventListener("click", () => {
      f.lastReviewed.value = todayISO();
      saveDocDialog(`review recorded ${fmtDate(todayISO())}`);
    });
  }

  /* Values in the form, as a document record (used for the live preview and save) */
  function docFromForm(base) {
    const f = docDialog.form;
    return normaliseDocument({
      ...base,
      owner: f.owner.value, approver: f.approver.value, version: f.version.value,
      status: f.status.value, lastReviewed: f.lastReviewed.value,
      reviewMonths: f.reviewMonths.value, firstDue: f.firstDue.value
    });
  }

  function updateDocDuePreview() {
    const base = Documents.find(docDialog.editingId);
    if (!base) return;
    const f = docDialog.form;
    $("#doc-first-due").hidden = !!f.lastReviewed.value;
    const d = docFromForm(base);
    const rv = docReview(d);
    $("#doc-due-preview").innerHTML = rv.due
      ? `Next review due <b>${esc(fmtDate(rv.due))}</b> · ${reviewStatusHTML(rv)}`
      : `<span class="muted">Set a last-reviewed date or a first-issue due date.</span>`;
  }

  /* The "what to do next" callout: every document leads somewhere */
  function docNextStepHTML(d) {
    const rv = docReview(d);
    const approver = d.approver || "an approver (none assigned yet)";
    const due = rv.due ? fmtDate(rv.due) : "";
    const fileLink = d.path ? ` (<a href="../${esc(d.path)}" target="_blank" rel="noopener">${esc(d.path.split("/").pop())}</a>)` : "";
    let kind, title, body;

    if (d.status === "Not started") {
      kind = rv.state === "Current" ? "info" : rv.cls;
      title = `Produce the first version — owner: ${esc(d.owner)}`;
      body = `This document does not exist yet. The first issue is due ${esc(due)}${rv.state === "Overdue" ? `, ${plural(-rv.days, "day")} ago` : ""}. Once it is drafted, ${esc(approver)} approves it.`;
    } else if (rv.state === "Overdue") {
      kind = "overdue";
      title = `Review and re-approve — owner: ${esc(d.owner)}`;
      body = `The review was due ${esc(due)}, ${plural(-rv.days, "day")} ago, so this version can no longer be shown to an auditor as current. ` +
        (d.rewrite
          ? `A ${esc(d.rewrite)} already exists${fileLink}. Finish it and take it to ${esc(approver)} for approval, rather than re-approving the old version.`
          : `${esc(d.owner)} reviews it and ${esc(approver)} re-approves it. Then use <b>Mark reviewed today</b>.`);
    } else if (rv.state === "Due soon") {
      kind = "due-soon";
      title = `Schedule the review — owner: ${esc(d.owner)}`;
      body = `The review is due ${esc(due)} (in ${plural(rv.days, "day")}). Book time with ${esc(approver)} for sign-off before then.` +
        (d.rewrite ? ` A ${esc(d.rewrite)} is ready to review${fileLink}.` : "");
    } else if (!d.approver) {
      kind = "info";
      title = "Assign an approver";
      body = `No approver is named in this document's header, so it cannot be formally approved. Name one below, then send version ${esc(d.version || "—")} for approval.`;
    } else if (d.status === "Draft") {
      kind = "info";
      title = `Approve the draft — approver: ${esc(d.approver)}`;
      body = `Version ${esc(d.version)} is still a draft, so it does not yet count as approved documented information. ${esc(d.owner)} submits it to ${esc(d.approver)}. Next review due ${esc(due)}.`;
    } else {
      kind = "quiet";
      title = "No action needed";
      body = `Approved and in date. Next review due ${esc(due)} (in ${plural(rv.days, "day")}).`;
    }
    const icon = kind === "overdue" ? ICON_WARN : kind === "due-soon" ? ICON_CLOCK : "";
    return `<div class="next-step ${kind}"><div class="next-title">${icon}${title}</div><p>${body}</p></div>`;
  }

  function docRefsHTML(d) {
    const moduleNames = { risks: "Risk Register", controls: "Control Library", gaps: "Gaps", incidents: "Incidents" };
    const row = (label, content) => `<div><span class="label">${label}</span> <span class="ref-links">${content}</span></div>`;
    const note = t => `<span class="muted">${esc(t || "None recorded")}</span>`;
    const parts = [];
    parts.push(row("Supports controls", d.controls.length ? d.controls.map(controlLinkHTML).join("") : note(d.controlsNote || (d.clauses ? "Management-system clause, no Annex A control" : ""))));
    if (d.clauses) parts.push(row("ISO clauses", `<span>${esc(d.clauses)}</span>`));
    parts.push(row("Helps treat risks", d.risks.length ? d.risks.map(riskLinkHTML).join("") : note(d.risksNote)));
    parts.push(row("Gaps that depend on it", d.gaps.length ? d.gaps.map(gapLinkHTML).join("") : note(d.gapsNote)));
    parts.push(row("Source document",
      (d.path ? `<a class="ref-link mono" href="../${esc(d.path)}" target="_blank" rel="noopener" title="Open the markdown file">${esc(d.path)} ↗</a>`
        : note("Kept outside this repository (illustrative record)")) +
      (d.module ? ` <a class="ref-link" href="#/${esc(d.module)}">Open ${esc(moduleNames[d.module] || d.module)} in Lattice</a>` : "")));
    return parts.join("");
  }

  function openDocDialog(id) {
    const d = Documents.find(id);
    if (!d) return;
    const f = docDialog.form;
    docDialog.editingId = d.id;

    f.reset();
    clearErrors(f);
    $("#doc-dialog-title").textContent = d.name;
    $("#doc-dialog-sub").textContent = `${d.id} · ${d.type} · review rule: ${d.reviewNote || freqLabel(d.reviewMonths)}`;
    $("#doc-next").innerHTML = docNextStepHTML(d);
    $("#doc-purpose").textContent = d.purpose;
    $("#doc-refs").innerHTML = docRefsHTML(d);

    f.owner.value = d.owner;
    f.approver.value = d.approver;
    f.version.value = d.version;
    f.status.value = d.status;
    f.lastReviewed.value = d.lastReviewed;
    f.lastReviewed.max = todayISO();
    f.reviewMonths.value = String(d.reviewMonths);
    f.firstDue.value = d.firstDue;
    $("#doc-reviewed").hidden = d.status === "Not started";
    $("#doc-people").innerHTML = allPeople().map(o => `<option value="${esc(o)}">`).join("");
    updateDocDuePreview();

    // In-app links close the panel; the markdown file opens in a new tab
    $$("#doc-dialog a:not([target])", docDialog.el).forEach(a => a.addEventListener("click", () => docDialog.el.close()));

    tooltip.hide();
    docDialog.el.showModal();
    $("#doc-next").scrollIntoView({ block: "nearest" });
    f.owner.focus({ preventScroll: true });
  }

  function saveDocDialog(action) {
    const f = docDialog.form;
    const d = Documents.find(docDialog.editingId);
    if (!d) return;
    const data = docFromForm(d);
    const today = todayISO();
    const errors = {};
    if (!data.owner) errors.owner = "Assign an owner.";
    if (data.status !== "Not started" && !data.version) errors.version = "Give the version.";
    if (f.lastReviewed.value && !data.lastReviewed) errors.lastReviewed = "Enter a valid date.";
    else if (data.lastReviewed && data.lastReviewed > today) errors.lastReviewed = "A review date cannot be in the future.";
    else if (!data.lastReviewed && data.status !== "Not started") errors.lastReviewed = "Enter the date it was last reviewed.";
    else if (!data.lastReviewed && !data.firstDue) errors.firstDue = "Set when the first version is due.";
    if (!showErrors(f, errors, ["owner", "version", "lastReviewed", "firstDue"])) return;

    const ok = Documents.upsert(data, d.id);
    docDialog.el.close();
    render();
    toast(savedMsg(ok, `${d.name}: ${action || "updated"}`));
  }

  /* =========================================================
   * Incidents - register and regulatory reporting clocks
   * ======================================================= */

  const CLOCK_STATES = ["Overdue", "Due soon", "Upcoming", "Completed", "Not triggered"];
  const clockCls = s => s.replace(/\s+/g, "-").toLowerCase();
  const TRIGGER_TEXT = {
    significant: { on: "Significant incident under NIS2", off: "Not a significant incident under NIS2" },
    personalData: { on: "Personal data involved", off: "No personal data involved" },
    financialClient: { on: "Financial client affected", off: "No financial client affected" }
  };

  function clockState(deadline, dueSoonHours, now) {
    if (now > deadline) return "Overdue";
    if (deadline - now <= dueSoonHours * HOUR_MS) return "Due soon";
    return "Upcoming";
  }

  /* Every reporting obligation for an incident, triggered or not */
  function incidentClocks(inc, now = Date.now()) {
    const aware = Date.parse(inc.awareAt);
    const clocks = {};
    REPORTING_OBLIGATIONS.forEach(def => {
      const triggered = !!inc[def.trigger];
      let base = aware, provisional = false;
      if (def.from !== "awareness") {
        const prior = clocks[def.from];
        if (prior && prior.doneAt) base = Date.parse(prior.doneAt);
        else { base = prior ? prior.deadline : aware; provisional = true; }
      }
      const deadline = def.months ? addMonthsMs(base, def.months) : base + def.hours * HOUR_MS;
      const doneAt = (inc.obligations[def.key] || {}).doneAt || "";
      const state = !triggered ? "Not triggered" : doneAt ? "Completed" : clockState(deadline, def.dueSoonHours, now);
      clocks[def.key] = { def, triggered, deadline, provisional, doneAt, state, cls: clockCls(state) };
    });
    return REPORTING_OBLIGATIONS.map(d => clocks[d.key]);
  }

  /* Register-level roll-up: counts per state and the next open deadline */
  function incidentSummary(inc, now = Date.now()) {
    const clocks = incidentClocks(inc, now);
    const live = clocks.filter(c => c.triggered);
    const count = s => live.filter(c => c.state === s).length;
    const open = live.filter(c => !c.doneAt).sort((a, b) => a.deadline - b.deadline);
    const worst = CLOCK_STATES.find(s => count(s) > 0) || "Not triggered";
    return { clocks, live, count, next: open[0] || null, worst, worstRank: CLOCK_STATES.indexOf(worst) };
  }

  function overdueObligationCount() {
    const now = Date.now();
    return Incidents.items.reduce((n, inc) => n + incidentClocks(inc, now).filter(c => c.state === "Overdue").length, 0);
  }

  const CLOCK_ICON = { Overdue: ICON_WARN, "Due soon": ICON_CLOCK };
  function clockStateHTML(state) {
    return `<span class="clock-state ${clockCls(state)}">${CLOCK_ICON[state] || ""}${esc(state)}</span>`;
  }
  /* Live countdown: the 1-second ticker rewrites every [data-deadline] */
  function countdownHTML(c, extraCls = "") {
    const now = Date.now();
    const text = now > c.deadline ? `Overdue by ${fmtDuration(now - c.deadline)}` : `${fmtDuration(c.deadline - now)} left`;
    return `<span class="countdown ${extraCls}" data-deadline="${c.deadline}" data-soon="${c.def.dueSoonHours}" data-state="${esc(c.state)}">${text}</span>`;
  }

  const incState = {
    sort: { key: "next", dir: "asc" },
    status: "", clock: "", q: "", selected: null, focus: null
  };

  const INC_COLUMNS = [
    { key: "id",        label: "ID" },
    { key: "title",     label: "Incident" },
    { key: "awareAt",   label: "Aware" },
    { key: "severity",  label: "Severity" },
    { key: "triggers",  label: "Triggers", sortable: false },
    { key: "reporting", label: "Reporting" },
    { key: "next",      label: "Next deadline" },
    { key: "status",    label: "Status" }
  ];

  function compareIncidents(a, b, key, now) {
    switch (key) {
      case "awareAt": return Date.parse(a.awareAt) - Date.parse(b.awareAt);
      case "severity": return INCIDENT_SEVERITIES.indexOf(a.severity) - INCIDENT_SEVERITIES.indexOf(b.severity);
      case "status": return INCIDENT_STATUSES.indexOf(a.status) - INCIDENT_STATUSES.indexOf(b.status);
      case "reporting": return incidentSummary(a, now).worstRank - incidentSummary(b, now).worstRank;
      case "next": {
        const na = incidentSummary(a, now).next, nb = incidentSummary(b, now).next;
        const va = na ? na.deadline : Infinity, vb = nb ? nb.deadline : Infinity;
        return va === vb ? 0 : va < vb ? -1 : 1;
      }
      default: return String(a[key]).localeCompare(String(b[key]));
    }
  }

  function filteredIncidents() {
    const q = incState.q.trim().toLowerCase();
    const { key, dir } = incState.sort;
    const now = Date.now();
    return Incidents.items
      .filter(i => !incState.status || (incState.status === "!Closed" ? i.status !== "Closed" : i.status === incState.status))
      .filter(i => !incState.clock || incidentSummary(i, now).count(incState.clock) > 0)
      .filter(i => !q || [i.id, i.title, i.description, i.severity, i.services.join(" "), i.clients.join(" "), i.status].join(" ").toLowerCase().includes(q))
      .sort((a, b) => {
        const c = compareIncidents(a, b, key, now);
        return (dir === "asc" ? c : -c) || Date.parse(b.awareAt) - Date.parse(a.awareAt);
      });
  }

  function incSummaryItems() {
    const now = Date.now();
    const all = Incidents.items.map(i => incidentSummary(i, now));
    const sum = s => all.reduce((n, x) => n + x.count(s), 0);
    const overdue = sum("Overdue"), soon = sum("Due soon");
    const open = Incidents.items.filter(i => i.status !== "Closed").length;
    return [
      { label: "Open incidents", n: open, note: `${Incidents.items.length - open} closed`, filter: { status: "!Closed", clock: "" } },
      { label: "Reports overdue", n: overdue, note: overdue ? "Report now and record it" : "Nothing overdue", cls: overdue ? "alert" : "", icon: overdue ? ICON_WARN : "", filter: { status: "", clock: "Overdue" } },
      { label: "Reports due soon", n: soon, note: "Inside the warning window", cls: soon ? "warn" : "", icon: soon ? ICON_CLOCK : "", filter: { status: "", clock: "Due soon" } },
      { label: "Upcoming", n: sum("Upcoming"), note: "Clock running", filter: { status: "", clock: "Upcoming" } },
      { label: "Reports sent", n: sum("Completed"), note: "Marked completed", filter: { status: "", clock: "Completed" } }
    ];
  }

  function defaultSelectedIncident() {
    const now = Date.now();
    const open = Incidents.items.filter(i => i.status !== "Closed");
    const pool = open.length ? open : Incidents.items;
    return pool.slice().sort((a, b) => compareIncidents(a, b, "next", now) || Date.parse(b.awareAt) - Date.parse(a.awareAt))[0] || null;
  }

  function renderIncidents(view, params) {
    if (params.has("focus")) {
      incState.status = ""; incState.clock = ""; incState.q = "";
      incState.selected = params.get("focus");
      incState.focus = params.get("focus");
      history.replaceState(null, "", "#/incidents");
    }

    view.innerHTML = `
      <div class="page-head">
        <div>
          <h1>Incidents</h1>
          <div class="sub">Incident register and reporting clocks · NIS2 Art. 23 · GDPR Art. 33 · DORA via financial clients · notifications owner: Head of Legal &amp; Compliance</div>
        </div>
        <div class="page-actions">
          ${resetButtonHTML(Incidents)}
          <button type="button" class="btn primary" id="log-incident">＋ Log incident</button>
        </div>
      </div>

      <section class="card summary-strip docs" id="inc-summary" aria-label="Reporting summary"></section>

      <section class="card inc-panel" id="inc-panel" aria-live="off"></section>

      <section class="card">
        <div class="toolbar">
          <input type="search" class="input search" id="f-q" placeholder="Search incidents" aria-label="Search incidents" value="${esc(incState.q)}">
          <label class="control">Status
            <select class="select" id="f-status">
              <option value="">All statuses</option>
              <option value="!Closed" ${incState.status === "!Closed" ? "selected" : ""}>Not closed</option>
              ${INCIDENT_STATUSES.map(s => `<option ${incState.status === s ? "selected" : ""}>${s}</option>`).join("")}
            </select>
          </label>
          <label class="control">Reporting
            <select class="select" id="f-clock">
              <option value="">Any reporting state</option>
              ${CLOCK_STATES.slice(0, 4).map(s => `<option value="${s}" ${incState.clock === s ? "selected" : ""}>Has ${s.toLowerCase()} report</option>`).join("")}
            </select>
          </label>
          <span class="spacer"></span>
          <span class="result-count" id="f-count" aria-live="polite"></span>
        </div>
        <div class="table-wrap">
          <table class="data" id="inc-table">
            <thead><tr>${headerHTML(INC_COLUMNS)}</tr></thead>
            <tbody></tbody>
          </table>
        </div>
        <div class="table-foot">
          <span>Click an incident to see its reporting clocks. Deadlines run from the moment Meridiaan became aware of the incident (Incident Response Policy, section 6).</span>
          <span>Source: 05-policies/02-incident-response-policy.md · example incident is illustrative</span>
        </div>
      </section>
    `;

    $("#f-q").addEventListener("input", e => { incState.q = e.target.value; drawIncidents(); });
    $("#f-status").addEventListener("change", e => { incState.status = e.target.value; drawIncidents(); });
    $("#f-clock").addEventListener("change", e => { incState.clock = e.target.value; drawIncidents(); });
    bindSort($("#inc-table"), incState, [], drawIncidents);
    $("#log-incident").addEventListener("click", () => openIncidentDialog(null));
    bindReset(Incidents, "incident register");

    drawIncidents();

    if (incState.focus) {
      const id = incState.focus;
      incState.focus = null;
      if (!focusRow($("#inc-table tbody"), id)) toast(`${id} is not in the incident register`);
    }
  }

  function incRowHTML(inc, now) {
    const s = incidentSummary(inc, now);
    const trig = [inc.significant && "NIS2", inc.personalData && "GDPR", inc.financialClient && "Client"].filter(Boolean);
    const flags = ["Overdue", "Due soon"].filter(st => s.count(st))
      .map(st => `<span class="clock-state ${clockCls(st)} sm">${CLOCK_ICON[st]}${s.count(st)} ${st.toLowerCase()}</span>`).join("");
    const selected = inc.id === incState.selected;
    return `
      <tr tabindex="0" data-id="${esc(inc.id)}" class="${inc.status === "Closed" ? "closed" : ""} ${selected ? "selected" : ""} ${s.count("Overdue") ? "rv-row-overdue" : ""}" aria-label="Show reporting clocks for ${esc(inc.id)}" ${selected ? 'aria-current="true"' : ""}>
        <td class="id">${esc(inc.id)}${inc.example ? '<span class="tag-new">Example</span>' : ""}</td>
        <td class="desc inc-desc">
          <div class="risk-title">${esc(inc.title)}</div>
          <div class="risk-desc">${esc(inc.services.join(" · ") || "No service recorded")}</div>
        </td>
        <td class="nowrap">${esc(fmtDateTime(inc.awareAt))}<span class="lvl">${esc(fmtSpan(now - Date.parse(inc.awareAt)))} ago</span></td>
        <td>${badgeHTML(inc.severity)}</td>
        <td class="nowrap">${trig.length ? trig.map(t => `<span class="trig">${t}</span>`).join("") : '<span class="muted">None</span>'}</td>
        <td class="nowrap"><div class="flag-stack">${flags}</div><span class="lvl">${s.count("Completed")} of ${s.live.length} sent</span></td>
        <td class="nowrap">${s.next ? `${countdownHTML(s.next, "sm")}<span class="lvl">${esc(s.next.def.title)}</span>` : '<span class="muted">All sent</span>'}</td>
        <td>${gapStatusHTML(inc.status)}</td>
      </tr>`;
  }

  function drawIncidents() {
    const table = $("#inc-table");
    if (!table) return;
    const now = Date.now();
    if (!incState.selected || !Incidents.find(incState.selected)) {
      const d = defaultSelectedIncident();
      incState.selected = d ? d.id : null;
    }
    const rows = filteredIncidents();
    const tbody = $("tbody", table);
    paintSort(table, incState);

    const strip = $("#inc-summary");
    strip.innerHTML = incSummaryItems().map(s => {
      const active = incState.status === s.filter.status && incState.clock === s.filter.clock;
      return `<button type="button" class="sum-item ${s.cls || ""}" aria-pressed="${active}" data-status="${esc(s.filter.status)}" data-clock="${esc(s.filter.clock)}">
          <span class="sum-label">${s.icon || ""}${esc(s.label)}</span>
          <span class="sum-value">${s.n}</span>
          <span class="sum-note">${esc(s.note)}</span>
        </button>`;
    }).join("");
    $$(".sum-item", strip).forEach(b => b.addEventListener("click", () => {
      incState.status = b.dataset.status;
      incState.clock = b.dataset.clock;
      $("#f-status").value = incState.status;
      $("#f-clock").value = incState.clock;
      drawIncidents();
    }));

    tbody.innerHTML = rows.length ? rows.map(i => incRowHTML(i, now)).join("")
      : `<tr><td colspan="${INC_COLUMNS.length}"><div class="empty-state">${Incidents.items.length ? "No incidents match these filters." : "No incidents logged. Use “Log incident” to start the reporting clocks."}</div></td></tr>`;
    bindRows(tbody, selectIncident);
    $("#f-count").textContent = `Showing ${rows.length} of ${Incidents.items.length} incidents`;

    drawIncidentPanel();
  }

  function selectIncident(id) {
    incState.selected = id;
    drawIncidents();
    const panel = $("#inc-panel");
    if (panel) panel.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function clockCardHTML(c, inc) {
    const d = c.def;
    const now = Date.now();
    let body;
    if (!c.triggered) {
      body = `<div class="clock-off">Not triggered: ${esc(TRIGGER_TEXT[d.trigger].off.toLowerCase())}.</div>`;
    } else if (c.doneAt) {
      const done = Date.parse(c.doneAt);
      const margin = c.deadline - done;
      body = `
        <div class="countdown-done">Sent ${esc(fmtDateTime(c.doneAt))}</div>
        <div class="clock-line">${margin >= 0 ? `${esc(fmtSpan(margin))} before the deadline` : `<b class="late">${esc(fmtSpan(-margin))} late</b>`} (${esc(fmtDateTime(new Date(c.deadline).toISOString()))})</div>`;
    } else {
      body = `
        ${countdownHTML(c, "big")}
        <div class="clock-line">Deadline <b>${esc(fmtDateTime(new Date(c.deadline).toISOString()))}</b></div>
        ${c.provisional ? `<div class="clock-line provisional">Provisional: counted from the notification deadline until the notification is marked sent.</div>` : ""}`;
    }
    const action = !c.triggered ? ""
      : c.doneAt
        ? `<button type="button" class="btn ghost sm" data-undo="${d.key}">Undo</button>`
        : `<button type="button" class="btn sm ${c.state === "Overdue" ? "danger" : ""}" data-complete="${d.key}">Mark as sent</button>`;
    return `
      <article class="clock ${c.cls}" aria-label="${esc(`${d.title}: ${c.state}`)}">
        <div class="clock-head">
          <span class="clock-title">${esc(d.title)}${d.key === "client" ? '<span class="clock-tag">DORA-driven, contractual</span>' : ""}</span>
          ${clockStateHTML(c.state)}
        </div>
        <div class="clock-auth">To <b>${esc(d.authority)}</b> · ${esc(d.authorityName)}${d.key === "client" && inc.clients.length ? `: ${esc(inc.clients.join(", "))}` : ""}</div>
        ${body}
        <div class="clock-rule">${esc(d.rule)} · ${esc(d.basis)}</div>
        ${c.triggered ? `<div class="clock-owner">Owner: ${esc(d.owner)}</div>` : ""}
        ${c.triggered ? `<details class="clock-note"><summary>What this report needs</summary><p>${esc(d.note)}</p></details>` : ""}
        ${action ? `<div class="clock-actions">${action}</div>` : ""}
      </article>`;
  }

  function drawIncidentPanel() {
    const panel = $("#inc-panel");
    if (!panel) return;
    const inc = incState.selected ? Incidents.find(incState.selected) : null;
    if (!inc) {
      panel.innerHTML = `<div class="empty-state">No incident selected. Log an incident to see which reporting obligations it triggers.</div>`;
      return;
    }
    const s = incidentSummary(inc);
    const closed = inc.status === "Closed";
    const doraNote = inc.financialClient
      ? `<div class="dora-note">
          <div class="dora-title">DORA: reporting to the financial supervisor is the client's obligation, not Meridiaan's</div>
          <p>${esc(inc.clients.join(" and ") || "The affected client")} ${inc.clients.length > 1 ? "are financial entities" : "is a financial entity"} under DORA. ${inc.clients.length > 1 ? "Each classifies" : "It classifies"} the incident and, if it is major, reports it to ${inc.clients.length > 1 ? "its" : "its"} supervisor (the National Bank of Belgium) under DORA Art. 19.
          Meridiaan is ${inc.clients.length > 1 ? "their" : "its"} ICT third-party service provider and does <b>not</b> report to the supervisor. Meridiaan's role is to <b>support</b>: notify the client without undue delay (the client clock above), then give the facts, updates and evidence the client needs for its own reports, as the contract requires.</p>
        </div>`
      : `<div class="dora-note quiet"><p>No financial client is affected, so there is no DORA-driven client notification. If a financial client is later found to be affected, edit the incident to start that clock.</p></div>`;
    const refs = [
      ...["DOC-02", "DOC-17"].map(id => Documents.find(id)).filter(Boolean).map(docLinkHTML),
      gapLinkHTML("G-04"),
      ...uniqSorted(["R-12", ...inc.risks]).map(riskLinkHTML)
    ].join("");

    panel.innerHTML = `
      <div class="inc-head">
        <div class="inc-head-main">
          <div class="inc-id">${esc(inc.id)} · ${badgeHTML(inc.severity)} ${gapStatusHTML(inc.status)}${inc.example ? '<span class="tag-new">Worked example</span>' : ""}</div>
          <h2>${esc(inc.title)}</h2>
          <div class="inc-meta">
            <span>Aware <b>${esc(fmtDateTime(inc.awareAt))}</b> (${esc(fmtSpan(Date.now() - Date.parse(inc.awareAt)))} ago)</span>
            <span>Services: ${esc(inc.services.join(", ") || "none recorded")}</span>
          </div>
        </div>
        <div class="page-actions">
          <button type="button" class="btn" id="inc-edit">Edit</button>
          <button type="button" class="btn ${closed ? "" : "primary"}" id="inc-close">${closed ? "Reopen incident" : "Close incident"}</button>
        </div>
      </div>
      <p class="inc-desc-full">${esc(inc.description)}</p>
      <div class="trigger-row" aria-label="Answers that decide which clocks run">
        ${["significant", "personalData", "financialClient"].map(k => `<span class="trigger ${inc[k] ? "on" : "off"}">${inc[k] ? "✓" : "–"} ${esc(TRIGGER_TEXT[k][inc[k] ? "on" : "off"])}</span>`).join("")}
        <span class="trigger-sum">${s.live.length} of ${REPORTING_OBLIGATIONS.length} reporting obligations triggered</span>
      </div>
      <div class="clock-grid">${s.clocks.map(c => clockCardHTML(c, inc)).join("")}</div>
      ${doraNote}
      <div class="ref-block"><div><span class="label">Playbook &amp; links</span> <span class="ref-links">${refs}</span></div></div>`;

    $("#inc-edit").addEventListener("click", () => openIncidentDialog(inc.id));
    $("#inc-close").addEventListener("click", () => toggleIncidentClosed(inc.id));
    $$("[data-complete]", panel).forEach(b => b.addEventListener("click", () => setObligation(inc.id, b.dataset.complete, true)));
    $$("[data-undo]", panel).forEach(b => b.addEventListener("click", () => setObligation(inc.id, b.dataset.undo, false)));
  }

  function setObligation(id, key, done) {
    const inc = Incidents.find(id);
    if (!inc) return;
    const def = REPORTING_OBLIGATIONS.find(o => o.key === key);
    const obligations = { ...inc.obligations };
    if (done) obligations[key] = { doneAt: new Date().toISOString() };
    else delete obligations[key];
    const ok = Incidents.upsert({ ...inc, obligations }, id);
    drawIncidents();
    updateNavCounts();
    toast(savedMsg(ok, `${def.title} ${done ? "marked as sent" : "reopened"}`));
  }

  function toggleIncidentClosed(id) {
    const inc = Incidents.find(id);
    if (!inc) return;
    if (inc.status === "Closed") {
      const ok = Incidents.upsert({ ...inc, status: "Open", closedAt: "" }, id);
      drawIncidents();
      toast(savedMsg(ok, `${id} reopened`));
      return;
    }
    const pending = incidentClocks(inc).filter(c => c.triggered && !c.doneAt);
    if (pending.length && !confirm(`${plural(pending.length, "reporting obligation")} not marked as sent (${pending.map(c => c.def.title).join(", ")}).\n\nClose ${id} anyway? The clocks keep running until each report is marked as sent.`)) return;
    const ok = Incidents.upsert({ ...inc, status: "Closed", closedAt: new Date().toISOString() }, id);
    drawIncidents();
    toast(savedMsg(ok, `${id} closed`));
  }

  /* One-second ticker: live countdowns; redraws when a clock changes state */
  function tickClocks() {
    const els = $$("[data-deadline]");
    if (!els.length) return;
    const now = Date.now();
    let changed = false;
    els.forEach(el => {
      const deadline = +el.dataset.deadline;
      el.textContent = now > deadline ? `Overdue by ${fmtDuration(now - deadline)}` : `${fmtDuration(deadline - now)} left`;
      if (clockState(deadline, +el.dataset.soon, now) !== el.dataset.state) changed = true;
    });
    if (changed) { drawIncidents(); updateNavCounts(); }
  }

  /* ---------- Log / edit incident dialog ---------- */

  const incDialog = { el: null, form: null, editingId: null };

  function setupIncidentDialog() {
    incDialog.el = $("#inc-dialog");
    incDialog.form = $("#inc-form");
    const f = incDialog.form;
    f.severity.innerHTML = INCIDENT_SEVERITIES.map(s => `<option>${s}</option>`).join("");
    f.status.innerHTML = INCIDENT_STATUSES.map(s => `<option>${s}</option>`).join("");
    $("#inc-services").innerHTML = INCIDENT_SERVICES.map(s => `<label class="check-item"><input type="checkbox" name="services" value="${esc(s)}"> ${esc(s)}</label>`).join("");
    $("#inc-clients").innerHTML = FINANCIAL_CLIENTS.map(c => `<label class="check-item"><input type="checkbox" name="clients" value="${esc(c)}"> ${esc(c)}</label>`).join("");
    setupDialogChrome(incDialog.el);

    // Severity proposes the NIS2 significance answer; the user can override it
    f.severity.addEventListener("change", () => {
      f.significant.value = ["High", "Critical"].includes(f.severity.value) ? "Yes" : "No";
      updateIncidentPreview();
    });
    ["significant", "personalData", "financialClient", "awareAt"].forEach(k => f[k].addEventListener("change", updateIncidentPreview));
    f.awareAt.addEventListener("input", updateIncidentPreview);
    $("#inc-clients").addEventListener("change", updateIncidentPreview);
    f.addEventListener("submit", e => { e.preventDefault(); saveIncidentDialog(); });
    $("#delete-incident").addEventListener("click", () => {
      const id = incDialog.editingId;
      if (!id || !confirm(`Delete ${id} from the incident register? This also removes its reporting record.`)) return;
      const ok = Incidents.remove(id);
      if (incState.selected === id) incState.selected = null;
      incDialog.el.close();
      render();
      toast(savedMsg(ok, `${id} deleted`));
    });
  }

  const checkedValues = name => $$(`#inc-form input[name="${name}"]:checked`).map(i => i.value);

  function incidentFromForm(base) {
    const f = incDialog.form;
    const aware = f.awareAt.value ? new Date(f.awareAt.value) : null;
    return {
      ...(base || {}),
      title: f.title.value, description: f.description.value,
      awareAt: aware && !isNaN(aware) ? aware.toISOString() : "",
      severity: f.severity.value, significant: f.significant.value === "Yes",
      services: checkedValues("services"),
      personalData: f.personalData.value === "Yes",
      financialClient: f.financialClient.value === "Yes",
      clients: checkedValues("clients"),
      status: base ? f.status.value : "Open",
      obligations: base ? base.obligations : {}
    };
  }

  /* Shows, before saving, which clocks these answers will start */
  function updateIncidentPreview() {
    const f = incDialog.form;
    $("#inc-clients-field").hidden = f.financialClient.value !== "Yes";
    const draft = incidentFromForm(incDialog.editingId ? Incidents.find(incDialog.editingId) : null);
    if (!draft.awareAt) {
      $("#inc-preview").innerHTML = `<span class="muted">Enter the date and time of awareness to see the deadlines.</span>`;
      return;
    }
    const clocks = incidentClocks(normaliseIncident(draft));
    $("#inc-preview").innerHTML = `<div class="label">Reporting clocks these answers start</div>
      <ul class="preview-list">${clocks.map(c => `<li class="${c.triggered ? "on" : "off"}">
        <span>${c.triggered ? "✓" : "–"} ${esc(c.def.title)} <span class="muted">to ${esc(c.def.authority)}</span></span>
        <span>${c.triggered ? `due ${esc(fmtDateTime(new Date(c.deadline).toISOString()))}` : "not triggered"}</span></li>`).join("")}</ul>`;
  }

  function openIncidentDialog(id) {
    const inc = id ? Incidents.find(id) : null;
    const f = incDialog.form;
    incDialog.editingId = inc ? inc.id : null;
    f.reset();
    clearErrors(f);
    $("#inc-dialog-title").textContent = inc ? `Edit ${inc.id}` : "Log incident";
    $("#inc-dialog-sub").textContent = inc ? inc.title : "Deadlines start from the moment Meridiaan became aware of the incident.";
    $("#save-incident").textContent = inc ? "Save changes" : "Log incident and start clocks";
    $("#delete-incident").hidden = !inc;
    $("#inc-status-field").hidden = !inc;

    f.title.value = inc ? inc.title : "";
    f.description.value = inc ? inc.description : "";
    f.awareAt.value = toLocalInput(inc ? inc.awareAt : new Date().toISOString());
    f.awareAt.max = toLocalInput(new Date(Date.now() + 5 * 60000).toISOString());
    f.severity.value = inc ? inc.severity : "Medium";
    f.significant.value = inc ? (inc.significant ? "Yes" : "No") : "No";
    f.personalData.value = inc && inc.personalData ? "Yes" : "No";
    f.financialClient.value = inc && inc.financialClient ? "Yes" : "No";
    f.status.value = inc ? inc.status : "Open";
    $$('#inc-form input[name="services"]').forEach(i => { i.checked = !!inc && inc.services.includes(i.value); });
    $$('#inc-form input[name="clients"]').forEach(i => { i.checked = !!inc && inc.clients.includes(i.value); });
    updateIncidentPreview();

    tooltip.hide();
    incDialog.el.showModal();
    f.title.focus();
  }

  function nextIncidentId(awareISO) {
    const year = new Date(awareISO).getFullYear();
    const prefix = `INC-${year}-`;
    const max = Incidents.items.filter(i => i.id.startsWith(prefix)).reduce((m, i) => Math.max(m, idNum(i.id.slice(prefix.length))), 0);
    return prefix + String(max + 1).padStart(3, "0");
  }

  function saveIncidentDialog() {
    const f = incDialog.form;
    const existing = incDialog.editingId ? Incidents.find(incDialog.editingId) : null;
    const data = incidentFromForm(existing);
    const errors = {};
    if (!data.title.trim()) errors.title = "Give the incident a short title.";
    if (!data.awareAt) errors.awareAt = "Enter when Meridiaan became aware of it.";
    else if (Date.parse(data.awareAt) > Date.now() + 5 * 60000) errors.awareAt = "Awareness cannot be in the future.";
    if (!data.services.length) errors.services = "Select at least one affected service.";
    if (data.financialClient && !data.clients.length) errors.clients = "Select the affected financial client.";
    $("#inc-services").classList.toggle("invalid", !!errors.services);
    $("#inc-clients").classList.toggle("invalid", !!errors.clients);
    $$(".err", f).forEach(e => { e.textContent = errors[e.dataset.err] || ""; });
    ["title", "awareAt"].forEach(k => f[k].classList.toggle("invalid", !!errors[k]));
    const first = Object.keys(errors)[0];
    if (first) {
      const target = first === "services" ? $('#inc-form input[name="services"]') : first === "clients" ? $('#inc-form input[name="clients"]') : f[first];
      target.focus();
      return;
    }

    if (existing && data.status === "Closed" && existing.status !== "Closed") data.closedAt = new Date().toISOString();
    if (data.status !== "Closed") data.closedAt = "";
    data.id = existing ? existing.id : nextIncidentId(data.awareAt);
    const ok = Incidents.upsert(data, existing ? existing.id : null);
    incState.selected = data.id;
    incDialog.el.close();
    render();
    const live = incidentClocks(Incidents.find(data.id)).filter(c => c.triggered).length;
    toast(savedMsg(ok, existing ? `${data.id} updated` : `${data.id} logged · ${plural(live, "reporting clock")} started`));
    if (!existing) { const p = $("#inc-panel"); if (p) p.scrollIntoView({ block: "start" }); }
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
    setupDocDialog();
    setupIncidentDialog();
    setInterval(tickClocks, 1000);
    setInterval(updateNavCounts, 60000);
    window.addEventListener("hashchange", render);
    window.addEventListener("scroll", () => tooltip.hide(), { passive: true });
    if (!location.hash) history.replaceState(null, "", "#/dashboard");
    render();
  });
})();
