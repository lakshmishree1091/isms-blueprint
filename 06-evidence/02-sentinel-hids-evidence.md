# 02 Real Control Evidence — Sentinel HIDS

> **Note on scope.** Meridiaan is fictional, but the detection capability described here is real. Sentinel HIDS is a working host-based intrusion detection system built by the project author. It is used here as genuine, demonstrable evidence that the detection, logging and monitoring controls in the SoA can operate in practice. It runs on a single host in a lab, so it illustrates *host-level* capability, not a full production deployment across Meridiaan's estate.

| | |
| --- | --- |
| **Document** | Evidence of detection, logging and monitoring controls via Sentinel HIDS |
| **ISO/IEC 27001 reference** | A.8.15, A.8.16, A.5.25, A.5.26, A.5.28, A.5.7, A.8.17 |
| **Version / status** | 0.1 / Draft |
| **Date** | 2026-09-30 |
| **Owner** | Chief Information Security Officer (CISO) |

## 1. What Sentinel HIDS is
A host-based intrusion detection system that scans a host every 10 minutes via a scheduled timer, using five detection modules (system health, user activity, process and network, file integrity, and alerting) over a baseline-learning core. It produces structured findings, classifies them by severity, tags them with MITRE ATT&CK techniques, writes them to a tamper-evident log, and sends alerts for high and critical findings. Findings are also shipped to a monitoring dashboard for visualisation.

## 2. What it evidences

| Sentinel capability | Annex A control | What it demonstrates |
| --- | --- | --- |
| Structured, timestamped security findings written to a log | A.8.15 Logging | Security-relevant events are captured in a consistent, reviewable form |
| Automatic 10-minute scanning across five detection modules | A.8.16 Monitoring activities | Systems are actively and continuously monitored for anomalies |
| Severity classification of each finding | A.5.25 Assessment and decision on security events | Events are triaged, not just collected |
| Alerting on high/critical findings (swappable email/webhook hook) | A.5.26 Response to incidents | Detection feeds a response trigger, not a silent log |
| Tamper-evident, hash-chained log with self-integrity checking | A.5.28 Collection of evidence | Records are protected against undetected alteration — evidential integrity |
| MITRE ATT&CK technique tagging (9 techniques across 7 tactics) | A.5.7 Threat intelligence | Detection is mapped to a recognised adversary-behaviour framework |
| Consistent timestamps across findings | A.8.17 Clock synchronization | Events can be correlated reliably over time |
| File-integrity detection module | Supports A.8.9 / integrity monitoring | Unauthorised change to monitored files is detected |

## 3. The standout: evidence integrity
The most GRC-relevant feature is the **tamper-evident, hash-chained log**. In audit and incident terms, evidence is only trustworthy if it cannot be quietly altered after the fact. By chaining each record to the previous one and self-checking integrity, Sentinel demonstrates the control objective behind A.5.28 (collection of evidence) — not just *that* events are logged, but that the log itself can be *trusted*. This is a governance concept realised in a technical control.

## 4. How to view the evidence
## 4. How to view the evidence
The Sentinel HIDS source and technical report live in a separate repository. To make this evidence viewable to a reviewer of this portfolio, the intended artefacts are: the architecture diagram, a sample structured finding (JSON), and an extract of the tamper-evident log. A visualisation of findings by severity and module can be regenerated locally from the structured findings; an earlier cloud-hosted dashboard is no longer live, so the durable evidence is the structured findings and log extract themselves, which do not depend on any one visualisation tool.

## 5. Honesty and limitations
- Sentinel runs on one host; it evidences host-level detection, not network, backup or tenant-segregation controls.
- It is a lab and portfolio artefact, not a certified product.
- Its value here is as concrete proof that the author can implement and reason about detection, logging, monitoring and evidence-integrity controls — the bridge between GRC and hands-on security.