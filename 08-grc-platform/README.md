# 08 Lattice: GRC platform

Lattice is a self-contained GRC web app built on the ISMS data for Meridiaan ICT
Services BV in this repository. Plain HTML, CSS
and JavaScript, no frameworks and no build step.

**Open `index.html` in a browser.** No server is needed.

| File | Purpose |
| --- | --- |
| `index.html` | App shell: sidebar, main view, edit dialogs and the document detail panel |
| `styles.css` | All styling |
| `app.js` | Routing, dashboard, the four working modules, storage |
| `data.js` | Source data: risks, Annex A controls, gaps, documents, scales and bands |

## Modules

- **Dashboard**: risk counts by band, a 5×5 likelihood × impact heatmap (click
  a cell to filter the register), control implementation status from the SoA,
  and open gaps by priority.
- **Risk Register**: sortable, filterable table (band, owner, free-text search).
  Add, edit and delete risks. Score and band are calculated from likelihood ×
  impact using the bands in `01-risk-register`.
- **Control Library** (stage 2): all 93 Annex A controls with theme,
  applicability, justification and status. Filters for theme, status and
  applicability, plus search. The summary strip doubles as one-click filters.
  The one excluded control (A.8.30) is visibly marked. Edit status,
  applicability and justification.
- **Gaps** (stage 2): the 10 gaps from the gap assessment, grouped or filtered
  by priority. Linked risks and controls open the matching row in their module.
  Progress is the share of each gap's key controls marked Implemented in the
  Control Library, so it updates as controls are updated. Edit status, owner,
  priority and phase.
- **Documents** (stage 3): the 21 documents the ISMS needs (the 7 policies, the
  core ISMS records in this repo, and the registers and records a real ISMS
  keeps), with owner, approver, version, status and review dates. Review
  status is calculated from last reviewed + review frequency against today's
  date: **Overdue**, **Due soon** (within 60 days) or **Current**. Only
  Overdue and Due soon are highlighted, overdue items sort first, and the
  sidebar shows the overdue count. Clicking a document opens a detail panel
  with the next step to take, the controls, risks and gaps it links to, and
  the markdown file where it is in this repo. Gap and control panels link
  back to their documents.
- **Incidents** (stage 4): log an incident (title, description, time of
  awareness, severity, affected services, personal data, financial client) and
  see straight away which reporting clocks it starts, each with its authority,
  deadline, live countdown and status (Upcoming, Due soon, Overdue,
  Completed, or Not triggered with the reason):
  - NIS2 early warning, incident notification and final report to the CCB
    (24 h, 72 h, one month after the notification) for significant incidents
  - GDPR breach notification to the GBA/APD (72 h) if personal data is involved
  - Notice to the affected financial client (DORA-driven, contractual) if a
    financial client is affected
  The panel spells out that DORA reporting to the supervisor is the client's
  obligation and Meridiaan's role is to support it. Reports can be marked as
  sent (the final-report clock then counts from the real notification time),
  incidents can be closed, and the sidebar shows overdue reports. A worked
  example (phishing compromise touching Client B's hosted data) is pre-loaded.
- Evidence and Client Assurance are placeholders for later stages.

## Data

- Risks come from `01-risk-register/01-risk-register.md`. **R-13 is left out**
  because the source flags it as a duplicate of R-02, which leaves 15 risks.
  New risks are numbered from R-17 so R-13 is never reused.
- Controls (93, of which 92 apply) come verbatim from `02-iso27001-soa/`.
  Gaps (10) come from `04-gap-assessment/`.
- **Gap owners are derived**, because the gap assessment does not name them.
  Each owner is the owner of the policy in `05-policies/` that governs the gap.
  Where no policy covers the gap, it is the owner of the main risk the gap
  leaves open. Comments in `data.js` give the reason for each one.
- **Document dates are partly illustrative.** Every document in this repo is a
  0.1 draft dated September 2026, so on those dates alone nothing would be
  overdue. To reflect the governance weakness the gap assessment describes
  (G-09), five policies are given an older approved version still in force,
  four of them past review; the 0.1 drafts in `05-policies/` are their
  rewrites. The incident register, supplier register, training records,
  internal audit report and management review minutes are illustrative
  records kept outside the repo; the internal audit and management review are
  "Not started" (roadmap phase 3). `data.js` comments say which fields come
  from the source.
- Because review status uses today's date, documents move to Due soon and
  Overdue over time without any data changing. At 16 Nov 2026: 5 overdue
  (4 policies and the supplier register), 2 due soon.
- **Incident deadlines:** the NIS2 deadlines come from the Incident Response
  Policy. That file stops partway through its deadline table, so the GDPR and
  client rows follow GDPR Art. 33 and the DORA position in the company
  profile. "Without undue delay" has no fixed period; the app counts down to
  an internal target of 4 hours (`CLIENT_NOTIFY_TARGET_HOURS`), to be
  confirmed per client contract.
- The worked example incident is dated relative to the first time a browser
  opens Lattice, so its clocks are live. That moment is saved and the clocks
  keep running from it; **Reset to source data** restarts the example.
- Changes made in the app are saved to browser `localStorage`, separately for
  risks, controls, gaps, documents and incidents. If storage is unavailable, the app still works but
  shows a notice that changes will not survive a refresh. **Reset to source
  data** discards saved changes for that module only.
- After editing `RISKS`, `CONTROLS`, `GAPS` or `DOCUMENTS` in `data.js`, bump
  `DATA_VERSION`. Browsers with an older saved copy will then show a notice
  telling users to reset.

All content is fictional, like the rest of this repository.
