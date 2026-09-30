# 01 Statement of Applicability (SoA)

> **Fictional content.** Meridiaan ICT Services BV, its clients, people, figures and sites are invented for this portfolio project. Any resemblance to a real organisation is unintended.

| | |
| --- | --- |
| **Document** | Statement of Applicability for ISO/IEC 27001:2022 Annex A controls |
| **ISO/IEC 27001 reference** | Clause 6.1.3 d), Statement of Applicability |
| **Version / status** | 0.1 / Draft |
| **Date** | 2026-09-30 |
| **Owner** | Chief Information Security Officer (CISO) |
| **Approver** | Chief Executive Officer (CEO) |
| **Review** | At least annually, and on any significant change to risks, services or controls |

## 1. Purpose

This Statement of Applicability records a decision on every one of the 93 controls in Annex A of ISO/IEC 27001:2022. For each control it states whether the control is **applicable** to Meridiaan, gives a **justification**, and records the current **implementation status**. It is derived from the risk register (`01-risk-register/`) and the context and scope in `00-scope-context/`, and it feeds the gap assessment (`04-gap-assessment/`), where implementation status is tested in detail.

Risk references (R-xx) point to entries in the risk register that the control helps treat.

## 2. How to read this document

- **Applicable** — Yes means the control is within Meridiaan's ISMS; No means it is excluded, with a justification.
- **Status** — *Implemented* (operating and evidenced), *Partial* (in place but not complete or not consistently evidenced), *Planned* (accepted as needed, not yet in place). The distribution of these is deliberately realistic: Meridiaan is building its ISMS ahead of certification, and its own context notes that some practices are informal and undocumented.
- Given Meridiaan's exposure as a multi-tenant MSP in scope of NIS2 and DORA, almost all controls are applicable. Exclusions are limited and justified individually.

## 3. Organizational controls (Annex A 5)

| Control | Title | Applicable | Justification | Status |
| --- | --- | --- | --- | --- |
| A.5.1 | Policies for information security | Yes | Sets ISMS direction; required by NIS2 governance duties | Partial |
| A.5.2 | Information security roles and responsibilities | Yes | Accountability across a 120-person, 24/7 operation | Partial |
| A.5.3 | Segregation of duties | Yes | Concentrated privileged access makes this critical (R-10) | Partial |
| A.5.4 | Management responsibilities | Yes | Management body accountable under NIS2 | Partial |
| A.5.5 | Contact with authorities | Yes | Statutory incident reporting to the CCB (R-12) | Implemented |
| A.5.6 | Contact with special interest groups | Yes | Threat and vulnerability awareness for a targeted sector | Implemented |
| A.5.7 | Threat intelligence | Yes | MSPs are actively targeted; informs defence (R-03) | Partial |
| A.5.8 | Information security in project management | Yes | New client onboarding and platform changes carry risk | Partial |
| A.5.9 | Inventory of information and other associated assets | Yes | Cannot protect what is not inventoried; basis of risk work | Partial |
| A.5.10 | Acceptable use of information and other associated assets | Yes | Governs staff use of powerful tooling and client data | Partial |
| A.5.11 | Return of assets | Yes | Leavers hold privileged access and devices (R-02, R-10) | Implemented |
| A.5.12 | Classification of information | Yes | Client and financial data need differentiated handling | Partial |
| A.5.13 | Labelling of information | Yes | Follows from classification | Planned |
| A.5.14 | Information transfer | Yes | Data moves between Meridiaan, clients and sites | Partial |
| A.5.15 | Access control | Yes | Core control for a multi-tenant provider (R-04, R-07) | Partial |
| A.5.16 | Identity management | Yes | Identities span staff, clients and platforms | Implemented |
| A.5.17 | Authentication information | Yes | Credential theft is a top entry route (R-07) | Implemented |
| A.5.18 | Access rights | Yes | Provisioning and revocation of privileged rights (R-10) | Partial |
| A.5.19 | Information security in supplier relationships | Yes | Depends on colocation and other critical suppliers (R-11) | Partial |
| A.5.20 | Addressing information security within supplier agreements | Yes | Security terms needed in supplier contracts (R-11) | Partial |
| A.5.21 | Managing information security in the ICT supply chain | Yes | Supply-chain compromise reaches clients (R-03, R-11) | Partial |
| A.5.22 | Monitoring, review and change management of supplier services | Yes | Ongoing assurance over critical suppliers (R-08, R-11) | Partial |
| A.5.23 | Information security for use of cloud services | Yes | Operates and consumes cloud services | Partial |
| A.5.24 | Information security incident management planning and preparation | Yes | Tight NIS2/DORA reporting deadlines (R-12) | Partial |
| A.5.25 | Assessment and decision on information security events | Yes | NOC triages events around the clock | Partial |
| A.5.26 | Response to information security incidents | Yes | Multi-client blast radius demands strong response (R-03, R-06) | Partial |
| A.5.27 | Learning from information security incidents | Yes | Continuous improvement of the ISMS | Planned |
| A.5.28 | Collection of evidence | Yes | Needed for investigations and regulatory reporting | Partial |
| A.5.29 | Information security during disruption | Yes | Resilience commitments to financial clients (R-05, R-08) | Partial |
| A.5.30 | ICT readiness for business continuity | Yes | DORA-driven operational resilience expectations (R-05) | Partial |
| A.5.31 | Identification of legal, statutory, regulatory and contractual requirements | Yes | NIS2, DORA flow-down, GDPR all apply | Implemented |
| A.5.32 | Intellectual property rights | Yes | Licensed software across the estate | Implemented |
| A.5.33 | Protection of records | Yes | Logs and records needed for compliance and evidence | Partial |
| A.5.34 | Privacy and protection of personal identifiable information (PII) | Yes | Processor and controller duties under GDPR (R-14) | Partial |
| A.5.35 | Independent review of information security | Yes | Client audit rights and certification readiness | Planned |
| A.5.36 | Compliance with policies, rules and standards for information security | Yes | Demonstrable compliance for supervisors and clients | Partial |
| A.5.37 | Documented operating procedures | Yes | Consistency across 24/7 shift operations | Partial |

## 4. People controls (Annex A 6)

| Control | Title | Applicable | Justification | Status |
| --- | --- | --- | --- | --- |
| A.6.1 | Screening | Yes | Staff hold privileged access to client environments (R-10) | Implemented |
| A.6.2 | Terms and conditions of employment | Yes | Security duties in employment terms | Implemented |
| A.6.3 | Information security awareness, education and training | Yes | Human error and phishing are top entry routes (R-07) | Partial |
| A.6.4 | Disciplinary process | Yes | Deterrent and response to insider misuse (R-10) | Implemented |
| A.6.5 | Responsibilities after termination or change of employment | Yes | Revoking privileged access on exit (R-02, R-10) | Partial |
| A.6.6 | Confidentiality or non-disclosure agreements | Yes | Handles confidential client and financial data | Implemented |
| A.6.7 | Remote working | Yes | Hybrid working and remote privileged administration | Partial |
| A.6.8 | Information security event reporting | Yes | Staff are first responders; feeds incident process (R-12) | Partial |

## 5. Physical controls (Annex A 7)

| Control | Title | Applicable | Justification | Status |
| --- | --- | --- | --- | --- |
| A.7.1 | Physical security perimeters | Yes | HQ and equipment in colocation facilities | Implemented |
| A.7.2 | Physical entry | Yes | Access control at HQ; facility operator controls colo entry (R-08) | Implemented |
| A.7.3 | Securing offices, rooms and facilities | Yes | Protects NOC, offices and equipment | Implemented |
| A.7.4 | Physical security monitoring | Yes | Detects unauthorised physical access | Partial |
| A.7.5 | Protecting against physical and environmental threats | Yes | Climate determination: heat, flooding, storms (R-16) | Partial |
| A.7.6 | Working in secure areas | Yes | NOC and sensitive areas at HQ | Implemented |
| A.7.7 | Clear desk and clear screen | Yes | Reduces exposure of client data in shared spaces | Partial |
| A.7.8 | Equipment siting and protection | Yes | Hosting equipment in colocation racks | Implemented |
| A.7.9 | Security of assets off-premises | Yes | Laptops and devices used in hybrid working | Partial |
| A.7.10 | Storage media | Yes | Backup media and disposal | Partial |
| A.7.11 | Supporting utilities | Yes | Dependence on power and cooling; continuity (R-01, R-16) | Partial |
| A.7.12 | Cabling security | Yes | Protects network and power cabling in facilities | Implemented |
| A.7.13 | Equipment maintenance | Yes | Availability of hosting hardware | Implemented |
| A.7.14 | Secure disposal or re-use of equipment | Yes | Client data must not persist on retired hardware | Partial |

## 6. Technological controls (Annex A 8)

| Control | Title | Applicable | Justification | Status |
| --- | --- | --- | --- | --- |
| A.8.1 | User endpoint devices | Yes | Staff endpoints access management tooling (R-07) | Partial |
| A.8.2 | Privileged access rights | Yes | The highest-impact control at an MSP (R-03, R-10) | Partial |
| A.8.3 | Information access restriction | Yes | Tenant separation and least privilege (R-04) | Partial |
| A.8.4 | Access to source code | Yes | Limited scope: internal automation and infrastructure-as-code | Partial |
| A.8.5 | Secure authentication | Yes | MFA against credential theft (R-07) | Partial |
| A.8.6 | Capacity management | Yes | Availability of shared hosting platforms | Implemented |
| A.8.7 | Protection against malware | Yes | Ransomware is a top risk (R-06) | Implemented |
| A.8.8 | Management of technical vulnerabilities | Yes | Unpatched systems are a critical entry point (R-09) | Partial |
| A.8.9 | Configuration management | Yes | Secure, consistent configuration across the estate | Partial |
| A.8.10 | Information deletion | Yes | Data minimisation and client exit/return of data | Partial |
| A.8.11 | Data masking | Yes | Limited scope: protecting personal data in non-production use | Planned |
| A.8.12 | Data leakage prevention | Yes | Prevents client/financial data exfiltration (R-04, R-14) | Planned |
| A.8.13 | Information backup | Yes | Backup and recovery is a core service (R-05) | Implemented |
| A.8.14 | Redundancy of information processing facilities | Yes | Two-site design for resilience (R-01, R-05, R-08) | Implemented |
| A.8.15 | Logging | Yes | Detection and evidence across services (R-06) | Partial |
| A.8.16 | Monitoring activities | Yes | 24/7 NOC monitoring; detects compromise (R-03) | Partial |
| A.8.17 | Clock synchronization | Yes | Reliable timestamps for logs and investigations | Implemented |
| A.8.18 | Use of privileged utility programs | Yes | Powerful tooling restricted and monitored (R-10) | Partial |
| A.8.19 | Installation of software on operational systems | Yes | Controls what runs on production systems | Partial |
| A.8.20 | Networks security | Yes | Managed network and security is a core service | Implemented |
| A.8.21 | Security of network services | Yes | VPN, firewalls and remote access | Implemented |
| A.8.22 | Segregation of networks | Yes | Separation between clients and environments (R-04) | Partial |
| A.8.23 | Web filtering | Yes | Reduces malware and phishing exposure (R-06, R-07) | Partial |
| A.8.24 | Use of cryptography | Yes | Protecting data in transit and at rest | Partial |
| A.8.25 | Secure development life cycle | Yes | Limited scope: internal automation and tooling | Partial |
| A.8.26 | Application security requirements | Yes | Limited scope: internal and client-facing portals | Partial |
| A.8.27 | Secure system architecture and engineering principles | Yes | Applies to hosting platform design | Partial |
| A.8.28 | Secure coding | Yes | Limited scope: internal scripting and automation | Partial |
| A.8.29 | Security testing in development and acceptance | Yes | Testing of changes before production | Partial |
| A.8.30 | Outsourced development | No | Meridiaan does not outsource software development; it operates infrastructure and uses vendor software rather than commissioning bespoke development | N/A |
| A.8.31 | Separation of development, test and production environments | Yes | Protects production hosting from change risk | Partial |
| A.8.32 | Change management | Yes | Change is a common cause of outage and exposure | Partial |
| A.8.33 | Test information | Yes | Client data must not be misused in testing | Partial |
| A.8.34 | Protection of information systems during audit testing | Yes | Client and regulator audits must not disrupt services | Partial |

## 7. Summary

Of the 93 Annex A controls, **92 are applicable** and **1 is excluded** (A.8.30, with justification above). The high applicability reflects Meridiaan's exposure as a multi-tenant MSP in scope of NIS2 and, through its financial clients, DORA. Implementation status is a deliberate mix — many controls are *Partial* or *Planned* — because this ISMS is being built ahead of an ISO/IEC 27001 certification decision. Closing those gaps is the subject of the gap assessment (`04-gap-assessment/`).