/*
 * Lattice GRC Platform - source data
 * -------------------------------------------------------------
 * Extracted from the ISMS markdown in this repository:
 *   01-risk-register/01-risk-register.md          -> risks
 *   02-iso27001-soa/01-statement-of-applicability.md -> controls
 *   04-gap-assessment/01-gap-assessment.md         -> gaps
 *
 * Edit this file to change the baseline data. User changes made in the
 * app are stored in browser localStorage on top of this baseline; use
 * "Reset to source data" in the Risk Register to discard them.
 *
 * If you change the risks array here, bump DATA_VERSION so browsers
 * holding an older saved copy are told the source has changed.
 *
 * Fictional content: Meridiaan ICT Services BV, its clients and people
 * are invented for this portfolio project.
 */

const DATA_VERSION = "2026-09-30.1";

const ORG = {
  name: "Meridiaan ICT Services BV",
  shortName: "Meridiaan",
  location: "Mechelen, Belgium",
  staff: 120,
  ismsVersion: "0.1 (Draft)",
  dataDate: "2026-09-30",
  regimes: ["ISO/IEC 27001:2022", "NIS2 (important entity)", "DORA (via financial clients)"]
};

/* Scales from 01-risk-register sections 2-4 */
const LIKELIHOOD_SCALE = [
  { score: 1, level: "Rare" },
  { score: 2, level: "Unlikely" },
  { score: 3, level: "Possible" },
  { score: 4, level: "Likely" },
  { score: 5, level: "Almost certain" }
];

const IMPACT_SCALE = [
  { score: 1, level: "Negligible" },
  { score: 2, level: "Minor" },
  { score: 3, level: "Moderate" },
  { score: 4, level: "Major" },
  { score: 5, level: "Severe" }
];

/* Bands, highest first. Score = likelihood x impact (1-25). */
const RISK_BANDS = [
  { name: "Critical", min: 16, max: 25, action: "Urgent; senior attention and prompt treatment required" },
  { name: "High",     min: 10, max: 15, action: "Priority; treatment required and tracked" },
  { name: "Medium",   min: 5,  max: 9,  action: "Manage; treat where reasonably practicable" },
  { name: "Low",      min: 1,  max: 4,  action: "Acceptable; monitor" }
];

const TREATMENT_OPTIONS = [
  "Treat", "Tolerate", "Transfer", "Terminate",
  "Treat / Transfer", "Treat / Tolerate"
];

/*
 * Risk register (section 6). R-13 is omitted: the source register flags it
 * as a duplicate of R-02 ("delete one before finalising"), leaving 15 risks.
 * `title` is a short label for table display; `description` is verbatim
 * from the register (asset -> threat -> vulnerability -> consequence).
 */
const RISKS = [
  {
    id: "R-01", title: "Hosting site power outage",
    description: "Power supply → outage or grid disruption at one hosting site → dependence on external power and not-yet-proven failover → temporary loss or degradation of hosted services, felt by clients including the financial ones",
    likelihood: 3, impact: 3, treatment: "Treat", owner: "Head of Operations"
  },
  {
    id: "R-02", title: "Loss of key specialist",
    description: "People → loss or unavailability of a key specialist (departure, illness, hard-to-refill role) → small teams, key-person dependency, Belgian security-skills shortage → knowledge and cover gaps that slow work and weaken security oversight",
    likelihood: 4, impact: 2, treatment: "Treat", owner: "CISO"
  },
  {
    id: "R-03", title: "MSP compromise as route into clients",
    description: "Management tooling and privileged access → attacker compromises Meridiaan deliberately as a route into clients (supply-chain attack) → MSPs are actively targeted; concentrated privileged access; multi-tenant shared platforms → simultaneous breach of multiple client environments, potentially including the financial clients",
    likelihood: 3, impact: 5, treatment: "Treat", owner: "CISO"
  },
  {
    id: "R-04", title: "Tenant segregation failure",
    description: "Multi-tenant platforms → data or access crosses between clients (segregation failure) → shared platforms where tenant separation is a load-bearing control; misconfiguration or software flaw → one client's confidential data exposed to another, GDPR-reportable, severe trust damage if a financial client is involved",
    likelihood: 2, impact: 5, treatment: "Treat", owner: "Head of Cloud & Infrastructure Engineering"
  },
  {
    id: "R-05", title: "Backup and recovery failure",
    description: "Backup and DR → backups fail, are incomplete, or cannot be restored when needed → recovery practices partly informal and not consistently tested; replication between two sites relied upon → inability to recover client services after an incident, breaching resilience commitments to financial clients",
    likelihood: 3, impact: 4, treatment: "Treat", owner: "Head of Operations"
  },
  {
    id: "R-06", title: "Ransomware",
    description: "Ransomware → client and/or Meridiaan systems encrypted and held to ransom → internet-exposed services, privileged access, and MSP-wide reach make it high-value; phishing and unpatched systems as entry routes → multi-client outage and data loss, major regulatory and financial impact",
    likelihood: 3, impact: 5, treatment: "Treat", owner: "CISO"
  },
  {
    id: "R-07", title: "Phishing and credential theft",
    description: "Phishing / credential theft → staff tricked into revealing credentials or running malware → 120 staff, 24/7 shift work, privileged accounts; human error is constant → initial foothold that can escalate to privileged access and onward to clients",
    likelihood: 4, impact: 4, treatment: "Treat", owner: "CISO"
  },
  {
    id: "R-08", title: "Colocation facility failure",
    description: "Colocation facility failure → loss of building, power, cooling or physical access at a hosting site → dependence on third-party facility operators (critical suppliers) outside Meridiaan's direct control → service outage; single-site loss should be absorbed by DR, dual-site loss would be severe",
    likelihood: 2, impact: 4, treatment: "Treat / Transfer", owner: "Head of Operations"
  },
  {
    id: "R-09", title: "Unpatched systems",
    description: "Unpatched systems / known vulnerabilities → attacker exploits a known flaw Meridiaan hasn't yet fixed → large, complex estate; patching competes with 24/7 uptime pressure → system compromise as an entry point, especially on internet-facing services",
    likelihood: 4, impact: 4, treatment: "Treat", owner: "Heads of Engineering"
  },
  {
    id: "R-10", title: "Insider misuse of privileged access",
    description: "Insider threat → a trusted employee misuses privileged access, maliciously or by serious error → concentrated privileged access; separation of duties not yet fully formalised → data theft, sabotage or accidental damage across client environments",
    likelihood: 2, impact: 5, treatment: "Treat", owner: "CISO"
  },
  {
    id: "R-11", title: "Supplier or sub-processor compromise",
    description: "Supplier / sub-processor compromise → a supplier (connectivity, software, sub-processor) is breached or fails → reliance on external suppliers; assurance over them not yet fully formalised → disrupted service or a breach reaching Meridiaan and its clients through the supply chain",
    likelihood: 3, impact: 3, treatment: "Treat", owner: "Head of Legal & Compliance"
  },
  {
    id: "R-12", title: "Late or non-compliant incident reporting",
    description: "Late or non-compliant incident reporting → Meridiaan misses a statutory or contractual reporting deadline after an incident → NIS2 and client/DORA deadlines are tight; processes still maturing → regulatory penalty, breach of client contract, damage to standing with supervisors' registers",
    likelihood: 3, impact: 4, treatment: "Treat", owner: "Head of Legal & Compliance"
  },
  {
    id: "R-14", title: "GDPR personal data breach",
    description: "GDPR breach of personal data → personal data (employee, client-contact, prospect, or client-held) exposed, lost or mishandled → processor and controller duties; large volume of personal data → data-subject harm, GBA/APD notification, fines and reputational damage",
    likelihood: 3, impact: 4, treatment: "Treat", owner: "Data Protection Officer (DPO)"
  },
  {
    id: "R-15", title: "Financial client concentration",
    description: "Client concentration → loss of, or a failed audit by, a major financial client → two financial clients are ~25% of revenue → significant revenue loss and reputational harm with financial supervisors; both a commercial and a regulatory risk",
    likelihood: 2, impact: 4, treatment: "Treat / Tolerate", owner: "CEO"
  },
  {
    id: "R-16", title: "Climate-driven disruption",
    description: "Climate-driven disruption → extreme heat, flooding, storms or grid disruption affect hosting sites or power → services depend on physical facilities and stable power (ISO 27001 climate determination) → availability loss and higher operating cost; overlaps with R-08 and R-05",
    likelihood: 2, impact: 3, treatment: "Treat", owner: "Head of Operations"
  }
];

/*
 * Statement of Applicability - all 93 Annex A controls.
 * status: Implemented | Partial | Planned | N/A (not applicable)
 */
const CONTROLS = [
  // Annex A 5 - Organizational
  { id: "A.5.1",  theme: "Organizational", title: "Policies for information security", status: "Partial" },
  { id: "A.5.2",  theme: "Organizational", title: "Information security roles and responsibilities", status: "Partial" },
  { id: "A.5.3",  theme: "Organizational", title: "Segregation of duties", status: "Partial" },
  { id: "A.5.4",  theme: "Organizational", title: "Management responsibilities", status: "Partial" },
  { id: "A.5.5",  theme: "Organizational", title: "Contact with authorities", status: "Implemented" },
  { id: "A.5.6",  theme: "Organizational", title: "Contact with special interest groups", status: "Implemented" },
  { id: "A.5.7",  theme: "Organizational", title: "Threat intelligence", status: "Partial" },
  { id: "A.5.8",  theme: "Organizational", title: "Information security in project management", status: "Partial" },
  { id: "A.5.9",  theme: "Organizational", title: "Inventory of information and other associated assets", status: "Partial" },
  { id: "A.5.10", theme: "Organizational", title: "Acceptable use of information and other associated assets", status: "Partial" },
  { id: "A.5.11", theme: "Organizational", title: "Return of assets", status: "Implemented" },
  { id: "A.5.12", theme: "Organizational", title: "Classification of information", status: "Partial" },
  { id: "A.5.13", theme: "Organizational", title: "Labelling of information", status: "Planned" },
  { id: "A.5.14", theme: "Organizational", title: "Information transfer", status: "Partial" },
  { id: "A.5.15", theme: "Organizational", title: "Access control", status: "Partial" },
  { id: "A.5.16", theme: "Organizational", title: "Identity management", status: "Implemented" },
  { id: "A.5.17", theme: "Organizational", title: "Authentication information", status: "Implemented" },
  { id: "A.5.18", theme: "Organizational", title: "Access rights", status: "Partial" },
  { id: "A.5.19", theme: "Organizational", title: "Information security in supplier relationships", status: "Partial" },
  { id: "A.5.20", theme: "Organizational", title: "Addressing information security within supplier agreements", status: "Partial" },
  { id: "A.5.21", theme: "Organizational", title: "Managing information security in the ICT supply chain", status: "Partial" },
  { id: "A.5.22", theme: "Organizational", title: "Monitoring, review and change management of supplier services", status: "Partial" },
  { id: "A.5.23", theme: "Organizational", title: "Information security for use of cloud services", status: "Partial" },
  { id: "A.5.24", theme: "Organizational", title: "Information security incident management planning and preparation", status: "Partial" },
  { id: "A.5.25", theme: "Organizational", title: "Assessment and decision on information security events", status: "Partial" },
  { id: "A.5.26", theme: "Organizational", title: "Response to information security incidents", status: "Partial" },
  { id: "A.5.27", theme: "Organizational", title: "Learning from information security incidents", status: "Planned" },
  { id: "A.5.28", theme: "Organizational", title: "Collection of evidence", status: "Partial" },
  { id: "A.5.29", theme: "Organizational", title: "Information security during disruption", status: "Partial" },
  { id: "A.5.30", theme: "Organizational", title: "ICT readiness for business continuity", status: "Partial" },
  { id: "A.5.31", theme: "Organizational", title: "Identification of legal, statutory, regulatory and contractual requirements", status: "Implemented" },
  { id: "A.5.32", theme: "Organizational", title: "Intellectual property rights", status: "Implemented" },
  { id: "A.5.33", theme: "Organizational", title: "Protection of records", status: "Partial" },
  { id: "A.5.34", theme: "Organizational", title: "Privacy and protection of personal identifiable information (PII)", status: "Partial" },
  { id: "A.5.35", theme: "Organizational", title: "Independent review of information security", status: "Planned" },
  { id: "A.5.36", theme: "Organizational", title: "Compliance with policies, rules and standards for information security", status: "Partial" },
  { id: "A.5.37", theme: "Organizational", title: "Documented operating procedures", status: "Partial" },

  // Annex A 6 - People
  { id: "A.6.1", theme: "People", title: "Screening", status: "Implemented" },
  { id: "A.6.2", theme: "People", title: "Terms and conditions of employment", status: "Implemented" },
  { id: "A.6.3", theme: "People", title: "Information security awareness, education and training", status: "Partial" },
  { id: "A.6.4", theme: "People", title: "Disciplinary process", status: "Implemented" },
  { id: "A.6.5", theme: "People", title: "Responsibilities after termination or change of employment", status: "Partial" },
  { id: "A.6.6", theme: "People", title: "Confidentiality or non-disclosure agreements", status: "Implemented" },
  { id: "A.6.7", theme: "People", title: "Remote working", status: "Partial" },
  { id: "A.6.8", theme: "People", title: "Information security event reporting", status: "Partial" },

  // Annex A 7 - Physical
  { id: "A.7.1",  theme: "Physical", title: "Physical security perimeters", status: "Implemented" },
  { id: "A.7.2",  theme: "Physical", title: "Physical entry", status: "Implemented" },
  { id: "A.7.3",  theme: "Physical", title: "Securing offices, rooms and facilities", status: "Implemented" },
  { id: "A.7.4",  theme: "Physical", title: "Physical security monitoring", status: "Partial" },
  { id: "A.7.5",  theme: "Physical", title: "Protecting against physical and environmental threats", status: "Partial" },
  { id: "A.7.6",  theme: "Physical", title: "Working in secure areas", status: "Implemented" },
  { id: "A.7.7",  theme: "Physical", title: "Clear desk and clear screen", status: "Partial" },
  { id: "A.7.8",  theme: "Physical", title: "Equipment siting and protection", status: "Implemented" },
  { id: "A.7.9",  theme: "Physical", title: "Security of assets off-premises", status: "Partial" },
  { id: "A.7.10", theme: "Physical", title: "Storage media", status: "Partial" },
  { id: "A.7.11", theme: "Physical", title: "Supporting utilities", status: "Partial" },
  { id: "A.7.12", theme: "Physical", title: "Cabling security", status: "Implemented" },
  { id: "A.7.13", theme: "Physical", title: "Equipment maintenance", status: "Implemented" },
  { id: "A.7.14", theme: "Physical", title: "Secure disposal or re-use of equipment", status: "Partial" },

  // Annex A 8 - Technological
  { id: "A.8.1",  theme: "Technological", title: "User endpoint devices", status: "Partial" },
  { id: "A.8.2",  theme: "Technological", title: "Privileged access rights", status: "Partial" },
  { id: "A.8.3",  theme: "Technological", title: "Information access restriction", status: "Partial" },
  { id: "A.8.4",  theme: "Technological", title: "Access to source code", status: "Partial" },
  { id: "A.8.5",  theme: "Technological", title: "Secure authentication", status: "Partial" },
  { id: "A.8.6",  theme: "Technological", title: "Capacity management", status: "Implemented" },
  { id: "A.8.7",  theme: "Technological", title: "Protection against malware", status: "Implemented" },
  { id: "A.8.8",  theme: "Technological", title: "Management of technical vulnerabilities", status: "Partial" },
  { id: "A.8.9",  theme: "Technological", title: "Configuration management", status: "Partial" },
  { id: "A.8.10", theme: "Technological", title: "Information deletion", status: "Partial" },
  { id: "A.8.11", theme: "Technological", title: "Data masking", status: "Planned" },
  { id: "A.8.12", theme: "Technological", title: "Data leakage prevention", status: "Planned" },
  { id: "A.8.13", theme: "Technological", title: "Information backup", status: "Implemented" },
  { id: "A.8.14", theme: "Technological", title: "Redundancy of information processing facilities", status: "Implemented" },
  { id: "A.8.15", theme: "Technological", title: "Logging", status: "Partial" },
  { id: "A.8.16", theme: "Technological", title: "Monitoring activities", status: "Partial" },
  { id: "A.8.17", theme: "Technological", title: "Clock synchronization", status: "Implemented" },
  { id: "A.8.18", theme: "Technological", title: "Use of privileged utility programs", status: "Partial" },
  { id: "A.8.19", theme: "Technological", title: "Installation of software on operational systems", status: "Partial" },
  { id: "A.8.20", theme: "Technological", title: "Networks security", status: "Implemented" },
  { id: "A.8.21", theme: "Technological", title: "Security of network services", status: "Implemented" },
  { id: "A.8.22", theme: "Technological", title: "Segregation of networks", status: "Partial" },
  { id: "A.8.23", theme: "Technological", title: "Web filtering", status: "Partial" },
  { id: "A.8.24", theme: "Technological", title: "Use of cryptography", status: "Partial" },
  { id: "A.8.25", theme: "Technological", title: "Secure development life cycle", status: "Partial" },
  { id: "A.8.26", theme: "Technological", title: "Application security requirements", status: "Partial" },
  { id: "A.8.27", theme: "Technological", title: "Secure system architecture and engineering principles", status: "Partial" },
  { id: "A.8.28", theme: "Technological", title: "Secure coding", status: "Partial" },
  { id: "A.8.29", theme: "Technological", title: "Security testing in development and acceptance", status: "Partial" },
  { id: "A.8.30", theme: "Technological", title: "Outsourced development", status: "N/A" },
  { id: "A.8.31", theme: "Technological", title: "Separation of development, test and production environments", status: "Partial" },
  { id: "A.8.32", theme: "Technological", title: "Change management", status: "Partial" },
  { id: "A.8.33", theme: "Technological", title: "Test information", status: "Partial" },
  { id: "A.8.34", theme: "Technological", title: "Protection of information systems during audit testing", status: "Partial" }
];

/* Gap assessment section 3. status is "Open" for all at baseline. */
const GAPS = [
  { id: "G-01", theme: "Privileged access management", priority: "P1", phase: 1, status: "Open",
    controls: ["A.8.2", "A.8.18", "A.5.3", "A.5.18"], risks: ["R-03", "R-10", "R-07"] },
  { id: "G-02", theme: "Vulnerability and patch management", priority: "P1", phase: 1, status: "Open",
    controls: ["A.8.8", "A.8.9", "A.8.19"], risks: ["R-09"] },
  { id: "G-03", theme: "Phishing resistance and authentication", priority: "P1", phase: 1, status: "Open",
    controls: ["A.6.3", "A.8.5", "A.8.23"], risks: ["R-07"] },
  { id: "G-04", theme: "Incident management and regulatory reporting", priority: "P1", phase: 1, status: "Open",
    controls: ["A.5.24", "A.5.25", "A.5.26", "A.5.28", "A.6.8"], risks: ["R-12", "R-06"] },
  { id: "G-05", theme: "Backup assurance and continuity", priority: "P2", phase: 2, status: "Open",
    controls: ["A.5.29", "A.5.30", "A.8.13"], risks: ["R-05", "R-08"] },
  { id: "G-06", theme: "Supplier and ICT supply-chain risk", priority: "P2", phase: 2, status: "Open",
    controls: ["A.5.19", "A.5.20", "A.5.21", "A.5.22"], risks: ["R-11", "R-03"] },
  { id: "G-07", theme: "Tenant segregation and data protection", priority: "P2", phase: 2, status: "Open",
    controls: ["A.8.3", "A.8.22", "A.8.12", "A.8.11", "A.5.34"], risks: ["R-04", "R-14"] },
  { id: "G-08", theme: "Logging and monitoring coverage", priority: "P2", phase: 2, status: "Open",
    controls: ["A.8.15", "A.8.16", "A.5.33"], risks: ["R-03", "R-06"] },
  { id: "G-09", theme: "ISMS governance and documentation", priority: "P2", phase: 3, status: "Open",
    controls: ["A.5.1", "A.5.2", "A.5.9", "A.5.12", "A.5.35", "A.5.36", "A.5.37", "A.5.27"], risks: [] },
  { id: "G-10", theme: "Physical, environmental and climate resilience", priority: "P3", phase: 3, status: "Open",
    controls: ["A.7.4", "A.7.5", "A.7.11"], risks: ["R-16", "R-08"] }
];
