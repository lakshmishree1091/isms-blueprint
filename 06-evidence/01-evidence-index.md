# 01 Evidence Index

> **Fictional content.** Meridiaan ICT Services BV, its clients, people, figures and sites are invented for this portfolio project. Any resemblance to a real organisation is unintended.

| | |
| --- | --- |
| **Document** | Index of evidence that ISMS controls operate |
| **ISO/IEC 27001 reference** | A.5.28 Collection of evidence; Clause 9 (monitoring, measurement, audit) |
| **Version / status** | 0.1 / Draft |
| **Date** | 2026-09-30 |
| **Owner** | Chief Information Security Officer (CISO) |
| **Review** | Continuously as controls mature; formally at each management review |

## 1. Purpose
Controls are only credible if they can be shown to operate. This folder indexes the evidence that Meridiaan's controls are working, supporting internal review, client assurance and a future certification audit. It complements the Statement of Applicability (`02-iso27001-soa/`): as a control's status moves toward *Implemented*, its evidence is recorded here.

## 2. A note on what is real and what is illustrative
Meridiaan is a fictional company, so most evidence below is **illustrative** — it describes the artefact an auditor would expect to see. One category is **real**: the detection, logging and monitoring capability is demonstrated by a working host-based intrusion detection system, Sentinel HIDS, built by the author (`02-sentinel-hids-evidence.md`). Distinguishing genuine evidence from illustrative placeholders is itself part of running an honest ISMS.

## 3. Evidence by control area

| Control area | Key controls | Evidence expected | Type | Location / status |
| --- | --- | --- | --- | --- |
| Detection, logging and monitoring | A.8.15, A.8.16, A.5.25, A.5.26 | Structured security logs, alerts, severity classification, monitoring dashboard | **Real** | `02-sentinel-hids-evidence.md` |
| Evidence integrity | A.5.28 | Tamper-evident, integrity-checked log of security findings | **Real** | `02-sentinel-hids-evidence.md` |
| Access control and privileged access | A.5.15–A.5.18, A.8.2 | Access-request approvals, six-monthly access reviews, PAM session logs | Illustrative | Planned |
| Incident management | A.5.24–A.5.28 | Incident register entries, notification records against deadlines, post-incident reviews | Illustrative | Planned |
| Vulnerability and patch management | A.8.8, A.8.9 | Vulnerability scan reports, patch SLA records | Illustrative | Planned |
| Backup and continuity | A.8.13, A.5.29, A.5.30 | Backup logs, recovery test results, continuity exercise reports | Illustrative | Planned |
| Awareness and training | A.6.3 | Training completion records, phishing simulation results | Illustrative | Planned |
| Supplier assurance | A.5.19–A.5.22 | Supplier risk assessments, contract security clauses, review minutes | Illustrative | Planned |
| Governance | A.5.1, A.5.35, A.5.36, Clause 9 | Approved policies, internal audit reports, management review minutes | Illustrative | Planned |

## 4. How evidence is maintained
Evidence is dated, attributable and version-controlled. As controls move from *Partial* or *Planned* to *Implemented* in the SoA, the corresponding evidence is added here and referenced from the gap assessment (`04-gap-assessment/`).