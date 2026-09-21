# isms-blueprint

An end-to-end Information Security Management System (ISMS) for a fictional
Belgian managed-services company, built on ISO/IEC 27001 and covering NIS2 and
DORA. A hands-on GRC portfolio project.

## About the project

The subject is a fictional Belgian managed-services provider (MSP). An MSP is a
useful case study because it sits under several regimes at once. It is a
managed service provider in scope of NIS2, and it is an ICT third-party service
provider to financial-sector clients, which brings it into the DORA supply
chain. One organisation therefore has to satisfy three overlapping frameworks.

The aim is to work through a full ISMS from scoping to executive reporting, and
to show how the frameworks relate to each other rather than treating each as a
separate checklist. Every artefact is written for this one company, not lifted
from a generic template.

The company, its people, and all evidence in this repository are fictional.

## Frameworks covered

- **ISO/IEC 27001**: the backbone of the ISMS. Scope, risk assessment,
  Statement of Applicability, and Annex A controls.
- **NIS2** (Directive (EU) 2022/2555): EU cybersecurity risk-management and
  incident-reporting obligations, as transposed into Belgian law.
- **DORA** (Regulation (EU) 2022/2554): digital operational resilience
  requirements for the financial sector and its ICT providers.

## Repository structure

The folders are numbered in the order the work is done. Each stage feeds the
next.

| Folder | What it contains | Status |
| --- | --- | --- |
| `00-scope-context` | Company profile, interested parties and their requirements, regulatory context, and the ISMS scope statement. | Planned |
| `01-risk-register` | Asset inventory, threats and vulnerabilities, likelihood and impact scoring, and risk treatment decisions. | Planned |
| `02-iso27001-soa` | Statement of Applicability: each Annex A control marked applicable or not, with justification and implementation status. | Planned |
| `03-nis2-crosswalk` | NIS2 and DORA requirements mapped to ISO 27001 controls, showing where existing controls already cover them. | Planned |
| `04-gap-assessment` | Current state compared with the target, the gaps found, and a prioritised remediation roadmap. | Planned |
| `05-policies` | Core policies and procedures, such as information security, access control, incident response, business continuity, and supplier management. | Planned |
| `06-evidence` | Simulated evidence that the controls operate: logs, meeting minutes, training and audit records. | Planned |
| `07-exec-summary` | A short, non-technical summary for leadership: overall posture, top risks, compliance status, and recommendations. | Planned |

DORA is handled within these folders, mainly the crosswalk and the gap
assessment, rather than in a folder of its own.

## Where to start

Read `07-exec-summary` first for the overall picture. Then follow the numbered
folders from `00` onward to see how each conclusion was reached.

## Skills demonstrated

- Risk assessment and treatment
- Control selection and Statement of Applicability
- Regulatory interpretation and cross-framework mapping
- Gap analysis and remediation planning
- Policy and procedure writing
- Communicating security posture to non-technical stakeholders

## Author

**[LAKSHMI SHREE BALAKRISHNAN]** · [LinkedIn](https://www.linkedin.com/in/lakshmi-shree-96b21b50/)