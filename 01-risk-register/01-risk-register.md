# 01 Risk Register

> **Fictional content.** Meridiaan ICT Services BV, its clients, people, figures and sites are invented for this portfolio project. Any resemblance to a real organisation is unintended.

| | |
| --- | --- |
| **Document** | Information security risk register |
| **ISO/IEC 27001 reference** | Clauses 6.1.2 and 8.2, Information security risk assessment |
| **Version / status** | 0.1 / Draft |
| **Date** | 2026-09-30 |
| **Owner** | Chief Information Security Officer (CISO) |
| **Approver** | Chief Executive Officer (CEO) |
| **Review** | At least annually, and after any major incident or significant change |

## 1. Purpose and method

This register identifies information security risks to Meridiaan, assesses each one, and records how it is being treated. It follows the context, interested parties and scope established in `00-scope-context/`.

Each risk is assessed on two axes — **likelihood** and **impact** — each scored 1 to 5. The two are multiplied to give a **risk score from 1 to 25**, which places the risk in a band. Scores are assigned before deciding treatment (this is the *inherent* risk, judged against controls already in place today).

## 2. Likelihood scale

| Score | Level | Meaning |
| ---: | --- | --- |
| 1 | Rare | Not expected to occur; no known occurrences in the sector |
| 2 | Unlikely | Could occur but not expected; occasional in the sector |
| 3 | Possible | Might well occur at some point; seen regularly in the sector |
| 4 | Likely | Expected to occur at least once in the near term |
| 5 | Almost certain | Expected to occur repeatedly or is already occurring |

## 3. Impact scale

Impact is judged on the worst realistic outcome across confidentiality, integrity, availability, and wider legal, financial and reputational effects.

| Score | Level | Meaning for Meridiaan |
| ---: | --- | --- |
| 1 | Negligible | Minor disruption; no client, regulatory or data impact |
| 2 | Minor | Limited internal impact; easily absorbed; no reporting needed |
| 3 | Moderate | Noticeable service or data impact; some client concern; possible minor breach reporting |
| 4 | Major | Significant client harm, regulatory notification, or breach of a key service commitment; financial and reputational damage |
| 5 | Severe | Multi-client or systemic compromise; regulator action; loss of a financial client; serious lasting reputational or financial harm |

## 4. Risk bands

| Score range | Band | What it means for action |
| --- | --- | --- |
| 1–4 | Low | Acceptable; monitor. No action beyond existing controls unless cheap to improve |
| 5–9 | Medium | Manage; treat where reasonably practicable |
| 10–15 | High | Priority; treatment required and tracked |
| 16–25 | Critical | Urgent; senior attention and prompt treatment required |

## 5. Treatment options

Each risk is assigned one of four responses (ISO/IEC 27001 language):

- **Treat (modify)** — apply or improve controls to reduce likelihood or impact.
- **Tolerate (accept)** — knowingly accept the risk, with sign-off, where it is already low or treatment is not justified.
- **Transfer (share)** — shift some impact to another party, e.g. insurance or a contractual clause.
- **Terminate (avoid)** — stop the activity that creates the risk.

## 6. Risk register

Risks are numbered R-01 onward. **L** = likelihood, **I** = impact, **Score** = L × I.

| ID | Risk (asset → threat → vulnerability → what happens) | L | I | Score | Band | Treatment | Owner |
| --- | --- | ---: | ---: | ---: | --- | --- | --- |
| R-01 | Power supply → outage or grid disruption at one hosting site → dependence on external power and not-yet-proven failover → temporary loss or degradation of hosted services, felt by clients including the financial ones | 3 | 3 | 9 | Medium | Treat | Head of Operations |
| R-02 | People → loss or unavailability of a key specialist (departure, illness, hard-to-refill role) → small teams, key-person dependency, Belgian security-skills shortage → knowledge and cover gaps that slow work and weaken security oversight | 4 | 2 | 8 | Medium | Treat | CISO |
| R-03 | Management tooling and privileged access → attacker compromises Meridiaan deliberately as a route into clients (supply-chain attack) → MSPs are actively targeted; concentrated privileged access; multi-tenant shared platforms → simultaneous breach of multiple client environments, potentially including the financial clients | 3 | 5 | 15 | High | Treat | CISO |
| R-04 | Multi-tenant platforms → data or access crosses between clients (segregation failure) → shared platforms where tenant separation is a load-bearing control; misconfiguration or software flaw → one client's confidential data exposed to another, GDPR-reportable, severe trust damage if a financial client is involved | 2 | 5 | 10 | High | Treat | Head of Cloud & Infrastructure Engineering |
| R-05 | Backup and DR → backups fail, are incomplete, or cannot be restored when needed → recovery practices partly informal and not consistently tested; replication between two sites relied upon → inability to recover client services after an incident, breaching resilience commitments to financial clients | 3 | 4 | 12 | High | Treat | Head of Operations |
| R-06 | Ransomware → client and/or Meridiaan systems encrypted and held to ransom → internet-exposed services, privileged access, and MSP-wide reach make it high-value; phishing and unpatched systems as entry routes → multi-client outage and data loss, major regulatory and financial impact | 3 | 5 | 15 | High | Treat | CISO |
| R-07 | Phishing / credential theft → staff tricked into revealing credentials or running malware → 120 staff, 24/7 shift work, privileged accounts; human error is constant → initial foothold that can escalate to privileged access and onward to clients | 4 | 4 | 16 | Critical | Treat | CISO |
| R-08 | Colocation facility failure → loss of building, power, cooling or physical access at a hosting site → dependence on third-party facility operators (critical suppliers) outside Meridiaan's direct control → service outage; single-site loss should be absorbed by DR, dual-site loss would be severe | 2 | 4 | 8 | Medium | Treat / Transfer | Head of Operations |
| R-09 | Unpatched systems / known vulnerabilities → attacker exploits a known flaw Meridiaan hasn't yet fixed → large, complex estate; patching competes with 24/7 uptime pressure → system compromise as an entry point, especially on internet-facing services | 4 | 4 | 16 | Critical | Treat | Heads of Engineering |
| R-10 | Insider threat → a trusted employee misuses privileged access, maliciously or by serious error → concentrated privileged access; separation of duties not yet fully formalised → data theft, sabotage or accidental damage across client environments | 2 | 5 | 10 | High | Treat | CISO |
| R-11 | Supplier / sub-processor compromise → a supplier (connectivity, software, sub-processor) is breached or fails → reliance on external suppliers; assurance over them not yet fully formalised → disrupted service or a breach reaching Meridiaan and its clients through the supply chain | 3 | 3 | 9 | Medium | Treat | Head of Legal & Compliance |
| R-12 | Late or non-compliant incident reporting → Meridiaan misses a statutory or contractual reporting deadline after an incident → NIS2 and client/DORA deadlines are tight; processes still maturing → regulatory penalty, breach of client contract, damage to standing with supervisors' registers | 3 | 4 | 12 | High | Treat | Head of Legal & Compliance |
| R-13 | Loss of a key person → departure or unavailability of a critical specialist → small teams, key-person dependency, Belgian skills shortage (also captured as R-02) → knowledge and cover gaps weakening security operations *(duplicate of R-02 — delete one before finalising)* | 4 | 2 | 8 | Medium | Treat | CISO |
| R-14 | GDPR breach of personal data → personal data (employee, client-contact, prospect, or client-held) exposed, lost or mishandled → processor and controller duties; large volume of personal data → data-subject harm, GBA/APD notification, fines and reputational damage | 3 | 4 | 12 | High | Treat | Data Protection Officer (DPO) |
| R-15 | Client concentration → loss of, or a failed audit by, a major financial client → two financial clients are ~25% of revenue → significant revenue loss and reputational harm with financial supervisors; both a commercial and a regulatory risk | 2 | 4 | 8 | Medium | Treat / Tolerate | CEO |
| R-16 | Climate-driven disruption → extreme heat, flooding, storms or grid disruption affect hosting sites or power → services depend on physical facilities and stable power (ISO 27001 climate determination) → availability loss and higher operating cost; overlaps with R-08 and R-05 | 2 | 3 | 6 | Medium | Treat | Head of Operations |