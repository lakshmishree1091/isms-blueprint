# 08 Lattice: GRC platform (stage 1)

Lattice is a self-contained GRC web app built on the ISMS data for Meridiaan ICT
Services BV in this repository. Plain HTML, CSS
and JavaScript, no frameworks and no build step.

**Open `index.html` in a browser.** No server is needed.

| File | Purpose |
| --- | --- |
| `index.html` | App shell: sidebar, main view, add/edit risk dialog |
| `styles.css` | All styling |
| `app.js` | Routing, dashboard, risk register, storage |
| `data.js` | Source data: risks, Annex A controls, gaps, scales and bands |

## Stage 1 scope

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
- Documents, Evidence, Incidents and Client Assurance are placeholders for later
  stages.

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
- Changes made in the app are saved to browser `localStorage`, separately for
  risks, controls and gaps. If storage is unavailable, the app still works but
  shows a notice that changes will not survive a refresh. **Reset to source
  data** discards saved changes for that module only.
- After editing `RISKS`, `CONTROLS` or `GAPS` in `data.js`, bump
  `DATA_VERSION`. Browsers with an older saved copy will then show a notice
  telling users to reset.

All content is fictional, like the rest of this repository.
