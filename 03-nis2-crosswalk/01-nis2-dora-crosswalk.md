# 01 NIS2 and DORA to ISO/IEC 27001 Crosswalk

> **Fictional content.** Meridiaan ICT Services BV, its clients, people, figures and sites are invented for this portfolio project. Any resemblance to a real organisation is unintended.

| | |
| --- | --- |
| **Document** | Mapping of NIS2 and DORA requirements to ISO/IEC 27001:2022 controls |
| **ISO/IEC 27001 reference** | Supports clause 5.31 (legal and regulatory requirements) and the Statement of Applicability |
| **Version / status** | 0.1 / Draft |
| **Date** | 2026-09-30 |
| **Owner** | Head of Legal and Compliance |
| **Approver** | Chief Information Security Officer (CISO) |
| **Review** | Annually, and on any change to the regulations or their national transposition |

## 1. Purpose and thesis

Meridiaan is subject to three frameworks at once: ISO/IEC 27001 (voluntary, the chosen backbone), NIS2 (mandatory, as an important entity), and DORA (reaching Meridiaan indirectly, as an ICT third-party provider to financial clients). This document maps the obligations of NIS2 and DORA to the ISO 27001 controls in the Statement of Applicability (`02-iso27001-soa/`).

**Thesis:** a single ISO 27001 ISMS satisfies the large majority of both regulations, because both are built on the same idea of risk-based information security management. It is therefore the efficient way to comply once rather than three times. However, ISO 27001 is not a complete substitute for either law: each imposes specific procedural and contractual obligations that sit *outside* the Annex A controls and must be added deliberately. Section 5 sets out those deltas.

## 2. NIS2 risk-management measures to ISO 27001

NIS2 Article 21(2) lists ten minimum cybersecurity risk-management measures. All ten map cleanly onto ISO 27001 controls.

| NIS2 Art. 21(2) measure | What it requires | ISO 27001 controls | Coverage |
| --- | --- | --- | --- |
| (a) Risk analysis and information system security policies | A risk-based security policy set | A.5.1, A.5.2; ISMS risk process (Clause 6.1) | Full |
| (b) Incident handling | Detect, respond to and learn from incidents | A.5.24–A.5.28, A.6.8 | Full |
| (c) Business continuity, backup and crisis management | Backup, disaster recovery, continuity | A.5.29, A.5.30, A.8.13, A.8.14 | Full |
| (d) Supply chain security | Manage security of suppliers and the ICT supply chain | A.5.19–A.5.22 | Full |
| (e) Security in acquisition, development and maintenance; vulnerability handling | Secure the system lifecycle; handle vulnerabilities | A.8.8, A.8.9, A.8.25–A.8.29, A.8.32 | Full |
| (f) Assessing effectiveness of measures | Check that controls actually work | A.5.35, A.5.36; monitoring and internal audit (Clause 9) | Full |
| (g) Basic cyber hygiene and training | Everyday good practice and awareness | A.6.3, A.8.1, A.8.7 | Full |
| (h) Cryptography and encryption | Policies on use of cryptography | A.8.24 | Full |
| (i) HR security, access control and asset management | Screen staff; control access; manage assets | A.6.1–A.6.6, A.5.15–A.5.18, A.5.9–A.5.13, A.8.2, A.8.3 | Full |
| (j) Multi-factor authentication and secure communications | MFA and secured comms where appropriate | A.8.5, A.5.14, A.5.17 | Full |

**Result:** ISO 27001 substantively covers every one of the ten NIS2 measures. A certified ISMS is strong evidence of NIS2 Article 21 compliance.

## 3. DORA requirements to ISO 27001

DORA is built on five pillars. Meridiaan is not a financial entity, so it is not directly bound by all of DORA; the obligations reach it through its financial clients' contracts and their third-party risk management. The mapping below shows where ISO 27001 already answers DORA and where it only partly does.

| DORA pillar | What it requires | ISO 27001 controls | Coverage |
| --- | --- | --- | --- |
| ICT risk management (Arts. 5–16) | A governed ICT risk-management framework | Whole ISMS; A.5.1, A.5.2, A.8.x control set | Substantial |
| ICT incident management and reporting (Arts. 17–23) | Classify, manage and report ICT incidents | A.5.24–A.5.28, A.6.8 | Partial — ISO covers handling; DORA adds specific classification and reporting rules |
| Digital operational resilience testing (Arts. 24–27) | Regular testing, incl. threat-led penetration testing for significant entities | A.8.8, A.8.29 | Partial — ISO covers routine testing; DORA's advanced testing regime goes further |
| ICT third-party risk (Arts. 28–44) | Contractual controls, register of information, audit and exit rights over ICT providers | A.5.19–A.5.22 | Partial — ISO covers supplier management; DORA prescribes specific contract content Meridiaan must be able to meet |
| Information sharing (Art. 45) | Voluntary sharing of cyber threat information | A.5.6 | Full (voluntary) |

**Result:** ISO 27001 gives Meridiaan most of what its financial clients need to see, especially the risk-management and control foundation. The residual DORA-specific obligations are the province of section 5.

## 4. The relationship between the frameworks (lex specialis)

Where an organisation is subject to both NIS2 and DORA, DORA prevails on ICT risk management, because it is the more specific law (*lex specialis*) and NIS2 defers to equivalent sector-specific requirements. Meridiaan itself is a NIS2 important entity, not a financial entity, so NIS2 governs it directly and DORA reaches it only through client contracts. The principle still matters to Meridiaan's clients and shapes what they demand of it, so it is recorded here.

## 5. Regulatory deltas — what ISO 27001 does NOT cover

These obligations are not satisfied by implementing Annex A controls alone. They must be added on top of the ISMS.

| Delta | Source | Why ISO 27001 is not enough | Where Meridiaan addresses it |
| --- | --- | --- | --- |
| Incident reporting deadlines: early warning within 24 hours, notification within 72 hours, final report within one month | NIS2 Art. 23, via the Belgian NIS2 Act and the CCB | ISO requires an incident process but sets no statutory deadlines or authority | Incident response policy and playbook (`05-policies/`); gap G-04 |
| Registration as an important entity with the CCB | Belgian NIS2 Act | A registration duty, not a control | Company profile assumptions; compliance register |
| Management body accountability and training | NIS2 Art. 20 | ISO assigns roles but not personal management-body liability | Governance policy; A.5.4 supplemented |
| Register of information on ICT third-party arrangements | DORA Art. 28 | A specific client-facing record ISO does not define | Supplier management; client assurance pack |
| Mandatory contractual clauses (audit rights, sub-outsourcing, exit strategies) | DORA Art. 30 | ISO requires supplier agreements but not DORA's prescribed content | Supplier agreements; client contract responses; gap G-06 |
| DORA incident classification thresholds and templates | DORA Art. 18 and technical standards | More prescriptive than ISO's event assessment | Incident policy aligned to client requirements |
| Support for clients' resilience and threat-led testing | DORA Arts. 24–27 | Meridiaan may have to participate in client testing and audits | Testing and audit-support procedures |

## 6. Conclusion

ISO 27001 is the right backbone: it satisfies all ten NIS2 risk-management measures and the substance of DORA's ICT risk-management and control expectations, letting Meridiaan comply with both largely through one system. The remaining work is not another framework but a defined set of regulatory add-ons — reporting deadlines, registration, contractual content and testing support — tracked as gaps in `04-gap-assessment/` and implemented through `05-policies/`.

## 7. Assumptions

- Mappings are at the level of control-to-requirement fit; detailed audit evidence lives in `06-evidence/`.
- NIS2 obligations are as transposed by the Belgian NIS2 Act; specifics are confirmed against CCB guidance.
- DORA obligations reach Meridiaan through client contracts; the exact contractual content is per client.