# 01 Gap Assessment and Remediation Roadmap

> **Fictional content.** Meridiaan ICT Services BV, its clients, people, figures and sites are invented for this portfolio project. Any resemblance to a real organisation is unintended.

| | |
| --- | --- |
| **Document** | Gap assessment against ISO/IEC 27001:2022 and prioritised remediation roadmap |
| **ISO/IEC 27001 reference** | Clauses 6.1.3, 9 and 10 (control selection, evaluation, improvement) |
| **Version / status** | 0.1 / Draft |
| **Date** | 2026-09-30 |
| **Owner** | Chief Information Security Officer (CISO) |
| **Approver** | Chief Executive Officer (CEO) |
| **Review** | Quarterly against the roadmap; fully at each management review |

## 1. Purpose

This document compares Meridiaan's current control implementation against the target of a fully implemented, evidenced ISMS. It takes the implementation status recorded in the Statement of Applicability (`02-iso27001-soa/`), identifies where Meridiaan falls short, prioritises the gaps by the risks they leave open (`01-risk-register/`), and sets out a phased roadmap to close them. It is the bridge between "which controls apply" and the policies and evidence that follow (`05-policies/`, `06-evidence/`).

## 2. Current posture

Across the 92 applicable Annex A controls (A.8.30 is excluded):

| Status | Meaning | Count |
| --- | --- | ---: |
| Implemented | Operating and evidenced | 25 |
| Partial | In place but incomplete or not consistently evidenced | 62 |
| Planned | Accepted as needed, not yet in place | 5 |
| **Total applicable** | | **92** |

**What this shows.** Meridiaan's *technical* controls are relatively mature — most Implemented controls sit in the technological and physical themes, consistent with a capable, security-focused MSP. The weakness is concentrated in **governance, documentation and evidence**: many controls are performed in practice but not formalised, so they score *Partial*. In audit terms, Meridiaan largely *does* the right things but cannot yet consistently *prove* them. Closing that "prove it" gap is the core of the roadmap below.

## 3. Priority gaps

Priority is driven by the highest risk each gap leaves open and by regulatory urgency. **P1** = close now (maps to Critical/High risks or hard regulatory deadlines); **P2** = close next; **P3** = foundational or lower-risk, close as the programme matures.

| # | Gap theme | What is missing | Key controls | Risks left open | Priority |
| --- | --- | --- | --- | --- | :--: |
| G-01 | Privileged access management | Privileged rights not fully inventoried, least-privilege and separation-of-duties not consistently enforced or evidenced | A.8.2, A.8.18, A.5.3, A.5.18 | R-03, R-10, R-07 | P1 |
| G-02 | Vulnerability and patch management | Patching inconsistent under 24/7 uptime pressure; no evidenced SLA for critical fixes | A.8.8, A.8.9, A.8.19 | R-09 | P1 |
| G-03 | Phishing resistance and authentication | Security awareness training informal; MFA not proven across all privileged access | A.6.3, A.8.5, A.8.23 | R-07 | P1 |
| G-04 | Incident management and regulatory reporting | Incident process not documented against NIS2/DORA deadlines; reporting playbook and evidence trail incomplete | A.5.24, A.5.25, A.5.26, A.5.28, A.6.8 | R-12, R-06 | P1 |
| G-05 | Backup assurance and continuity | Backup runs, but recovery testing and continuity plans are not regularly exercised or evidenced | A.5.29, A.5.30, A.8.13 | R-05, R-08 | P2 |
| G-06 | Supplier and ICT supply-chain risk | Supplier security assessment and contract clauses not formalised; DORA flow-down not fully mapped to suppliers | A.5.19, A.5.20, A.5.21, A.5.22 | R-11, R-03 | P2 |
| G-07 | Tenant segregation and data protection | Segregation controls and data-leakage/masking measures not fully implemented or evidenced | A.8.3, A.8.22, A.8.12, A.8.11, A.5.34 | R-04, R-14 | P2 |
| G-08 | Logging and monitoring coverage | Logging and monitoring exist but coverage, retention and alerting are not consistently defined or evidenced | A.8.15, A.8.16, A.5.33 | R-03, R-06 | P2 |
| G-09 | ISMS governance and documentation | Policies, asset inventory, classification, procedures and internal review not fully documented — the certification-readiness gap | A.5.1, A.5.2, A.5.9, A.5.12, A.5.35, A.5.36, A.5.37, A.5.27 | Underpins all | P2 |
| G-10 | Physical, environmental and climate resilience | Physical monitoring and environmental/climate protections at sites not fully evidenced | A.7.4, A.7.5, A.7.11 | R-16, R-08 | P3 |

## 4. Remediation roadmap

The gaps are sequenced into three phases. Phase 1 targets the controls sitting on Meridiaan's Critical and High risks and its hardest regulatory obligations; later phases build out assurance and documentation toward a certification decision.

| Phase | Timeframe | Focus | Gaps addressed |
| --- | --- | --- | --- |
| Phase 1 — Contain the sharpest risks | 0–3 months | Lock down privileged access; enforce and evidence MFA; establish a critical-patch SLA; document the incident and regulatory-reporting playbook; run phishing awareness training | G-01, G-02, G-03, G-04 |
| Phase 2 — Build assurance | 3–9 months | Formalise supplier assessment and DORA flow-down; exercise and evidence backup recovery and continuity; complete segregation and data-protection controls; define logging and monitoring coverage | G-05, G-06, G-07, G-08 |
| Phase 3 — Formalise and certify | 9–18 months | Complete ISMS documentation, internal audit and management review; close environmental/climate gaps; prepare for the ISO/IEC 27001 certification decision | G-09, G-10 |

## 5. How progress is tracked

- Each gap has an owner (per the risk register and SoA) and is reviewed quarterly against the roadmap.
- As a control moves from *Partial* or *Planned* to *Implemented*, its status is updated in the SoA and the evidence filed in `06-evidence/`.
- New risks or incidents can re-prioritise the roadmap; the gap assessment is re-baselined at each management review.

## 6. Assumptions

- Current status reflects the SoA as at the date above and management's stated view of maturity.
- Timeframes are indicative and depend on resourcing, which is a known constraint (small governance team).
- Phase 1 items are treated as the minimum needed to meet current NIS2 obligations and financial-client contractual expectations.