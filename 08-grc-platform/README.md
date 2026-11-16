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
- Control Library, Documents, Gaps, Evidence, Incidents and Client Assurance are
  placeholders for later stages.

## Data

- Risks come from `01-risk-register/01-risk-register.md`. **R-13 is left out**
  because the source flags it as a duplicate of R-02, which leaves 15 risks.
  New risks are numbered from R-17 so R-13 is never reused.
- Controls (93, of which 92 apply) come from `02-iso27001-soa/`. Gaps (10) come
  from `04-gap-assessment/`.
- Changes made in the app are saved to browser `localStorage`. If storage is
  unavailable, the app still works but shows a notice that changes will not
  survive a refresh. **Reset to source data** in the Risk Register discards
  saved changes.
- After editing the `RISKS` array in `data.js`, bump `DATA_VERSION`. Browsers
  with an older saved copy will then show a notice telling users to reset.

All content is fictional, like the rest of this repository.
