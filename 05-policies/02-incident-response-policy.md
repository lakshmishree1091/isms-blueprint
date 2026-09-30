# 02 Incident Response Policy

> **Fictional content.** Meridiaan ICT Services BV, its clients, people, figures and sites are invented for this portfolio project. Any resemblance to a real organisation is unintended.

| | |
| --- | --- |
| **Document** | Information Security Incident Response Policy |
| **ISO/IEC 27001 reference** | A.5.24–A.5.28, A.6.8 |
| **Regulatory drivers** | NIS2 Art. 23 (via Belgian NIS2 Act / CCB); DORA Arts. 17–19 (via financial clients); GDPR Art. 33 |
| **Version / status** | 0.1 / Draft |
| **Date** | 2026-09-30 |
| **Owner** | Head of Legal and Compliance |
| **Approver** | Chief Information Security Officer (CISO) |
| **Review** | Annually, and after any significant incident |
| **Applies to** | All staff, contractors and third parties acting for Meridiaan |

## 1. Purpose
To ensure information security incidents are detected, reported, managed and learned from consistently, and that Meridiaan meets its statutory and contractual notification obligations within their deadlines.

## 2. Scope
All suspected or confirmed information security events and incidents affecting Meridiaan's or its clients' information, systems or services.

## 3. Definitions
- **Event** — an observed occurrence that may be security-relevant.
- **Incident** — an event, or series of events, that compromises or threatens the confidentiality, integrity or availability of information or services.
- **Significant incident** — an incident meeting NIS2 or client/DORA thresholds for notification (see section 6).

## 4. Roles
- **First responders (NOC / service desk)** — detect, log and triage events 24/7; escalate suspected incidents.
- **Incident Manager (CISO or delegate)** — leads response, classification and communication.
- **Head of Legal and Compliance** — owns regulatory and contractual notifications and deadlines.
- **DPO** — assesses personal-data breaches and GDPR notification.
- **Executive management** — informed of significant incidents; makes business decisions.

## 5. Incident response lifecycle
1. **Detect and record** — capture the event with time, source and initial detail (A.5.25).
2. **Assess and classify** — determine severity, scope and whether it is a significant incident (section 6).
3. **Contain** — limit spread, especially across tenant boundaries and privileged access.
4. **Eradicate and recover** — remove the cause and restore services, using backups where needed (A.8.13).
5. **Notify** — make regulatory and client notifications within the deadlines below.
6. **Review and learn** — post-incident review; feed improvements back into the ISMS (A.5.27).

## 6. Notification deadlines

Deadlines run from the moment Meridiaan (or the client, where Meridiaan acts for them) becomes aware of a significant incident.

| Recipient | Trigger | Deadline |
| --- | --- | --- |
| CCB (NIS2) — early warning | Significant incident affecting Meridiaan as an important entity | **Within 24 hours** of awareness |
| CCB (NIS2) — incident notification | Same incident, with an initial assessment | **Within 72 hours** of awareness |
| CCB (NIS2) — final report | Same incident, full analysis and remediation | **Within one month**