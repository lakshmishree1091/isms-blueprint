/*
 * Lattice GRC Platform - source data
 * -------------------------------------------------------------
 * Extracted from the ISMS markdown in this repository:
 *   01-risk-register/01-risk-register.md          -> risks
 *   02-iso27001-soa/01-statement-of-applicability.md -> controls
 *   04-gap-assessment/01-gap-assessment.md         -> gaps
 *   header tables of 00-07 documents               -> documents
 *   05-policies/02-incident-response-policy.md     -> incident reporting clocks
 *
 * Edit this file to change the baseline data. User changes made in the
 * app are stored in browser localStorage on top of this baseline; use
 * "Reset to source data" in each module to discard them.
 *
 * If you change the RISKS, CONTROLS, GAPS or DOCUMENTS arrays, bump DATA_VERSION
 * so browsers holding an older saved copy are told the source has changed.
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
 * Statement of Applicability - all 93 Annex A controls, verbatim from the SoA.
 * applicable: Yes | No
 * status: Implemented | Partial | Planned | N/A (only for applicable: "No")
 */
const CONTROLS = [
  // Annex A 5 - Organizational
  { id: "A.5.1", theme: "Organizational", title: "Policies for information security", applicable: "Yes", status: "Partial",
    justification: "Sets ISMS direction; required by NIS2 governance duties" },
  { id: "A.5.2", theme: "Organizational", title: "Information security roles and responsibilities", applicable: "Yes", status: "Partial",
    justification: "Accountability across a 120-person, 24/7 operation" },
  { id: "A.5.3", theme: "Organizational", title: "Segregation of duties", applicable: "Yes", status: "Partial",
    justification: "Concentrated privileged access makes this critical (R-10)" },
  { id: "A.5.4", theme: "Organizational", title: "Management responsibilities", applicable: "Yes", status: "Partial",
    justification: "Management body accountable under NIS2" },
  { id: "A.5.5", theme: "Organizational", title: "Contact with authorities", applicable: "Yes", status: "Implemented",
    justification: "Statutory incident reporting to the CCB (R-12)" },
  { id: "A.5.6", theme: "Organizational", title: "Contact with special interest groups", applicable: "Yes", status: "Implemented",
    justification: "Threat and vulnerability awareness for a targeted sector" },
  { id: "A.5.7", theme: "Organizational", title: "Threat intelligence", applicable: "Yes", status: "Partial",
    justification: "MSPs are actively targeted; informs defence (R-03)" },
  { id: "A.5.8", theme: "Organizational", title: "Information security in project management", applicable: "Yes", status: "Partial",
    justification: "New client onboarding and platform changes carry risk" },
  { id: "A.5.9", theme: "Organizational", title: "Inventory of information and other associated assets", applicable: "Yes", status: "Partial",
    justification: "Cannot protect what is not inventoried; basis of risk work" },
  { id: "A.5.10", theme: "Organizational", title: "Acceptable use of information and other associated assets", applicable: "Yes", status: "Partial",
    justification: "Governs staff use of powerful tooling and client data" },
  { id: "A.5.11", theme: "Organizational", title: "Return of assets", applicable: "Yes", status: "Implemented",
    justification: "Leavers hold privileged access and devices (R-02, R-10)" },
  { id: "A.5.12", theme: "Organizational", title: "Classification of information", applicable: "Yes", status: "Partial",
    justification: "Client and financial data need differentiated handling" },
  { id: "A.5.13", theme: "Organizational", title: "Labelling of information", applicable: "Yes", status: "Planned",
    justification: "Follows from classification" },
  { id: "A.5.14", theme: "Organizational", title: "Information transfer", applicable: "Yes", status: "Partial",
    justification: "Data moves between Meridiaan, clients and sites" },
  { id: "A.5.15", theme: "Organizational", title: "Access control", applicable: "Yes", status: "Partial",
    justification: "Core control for a multi-tenant provider (R-04, R-07)" },
  { id: "A.5.16", theme: "Organizational", title: "Identity management", applicable: "Yes", status: "Implemented",
    justification: "Identities span staff, clients and platforms" },
  { id: "A.5.17", theme: "Organizational", title: "Authentication information", applicable: "Yes", status: "Implemented",
    justification: "Credential theft is a top entry route (R-07)" },
  { id: "A.5.18", theme: "Organizational", title: "Access rights", applicable: "Yes", status: "Partial",
    justification: "Provisioning and revocation of privileged rights (R-10)" },
  { id: "A.5.19", theme: "Organizational", title: "Information security in supplier relationships", applicable: "Yes", status: "Partial",
    justification: "Depends on colocation and other critical suppliers (R-11)" },
  { id: "A.5.20", theme: "Organizational", title: "Addressing information security within supplier agreements", applicable: "Yes", status: "Partial",
    justification: "Security terms needed in supplier contracts (R-11)" },
  { id: "A.5.21", theme: "Organizational", title: "Managing information security in the ICT supply chain", applicable: "Yes", status: "Partial",
    justification: "Supply-chain compromise reaches clients (R-03, R-11)" },
  { id: "A.5.22", theme: "Organizational", title: "Monitoring, review and change management of supplier services", applicable: "Yes", status: "Partial",
    justification: "Ongoing assurance over critical suppliers (R-08, R-11)" },
  { id: "A.5.23", theme: "Organizational", title: "Information security for use of cloud services", applicable: "Yes", status: "Partial",
    justification: "Operates and consumes cloud services" },
  { id: "A.5.24", theme: "Organizational", title: "Information security incident management planning and preparation", applicable: "Yes", status: "Partial",
    justification: "Tight NIS2/DORA reporting deadlines (R-12)" },
  { id: "A.5.25", theme: "Organizational", title: "Assessment and decision on information security events", applicable: "Yes", status: "Partial",
    justification: "NOC triages events around the clock" },
  { id: "A.5.26", theme: "Organizational", title: "Response to information security incidents", applicable: "Yes", status: "Partial",
    justification: "Multi-client blast radius demands strong response (R-03, R-06)" },
  { id: "A.5.27", theme: "Organizational", title: "Learning from information security incidents", applicable: "Yes", status: "Planned",
    justification: "Continuous improvement of the ISMS" },
  { id: "A.5.28", theme: "Organizational", title: "Collection of evidence", applicable: "Yes", status: "Partial",
    justification: "Needed for investigations and regulatory reporting" },
  { id: "A.5.29", theme: "Organizational", title: "Information security during disruption", applicable: "Yes", status: "Partial",
    justification: "Resilience commitments to financial clients (R-05, R-08)" },
  { id: "A.5.30", theme: "Organizational", title: "ICT readiness for business continuity", applicable: "Yes", status: "Partial",
    justification: "DORA-driven operational resilience expectations (R-05)" },
  { id: "A.5.31", theme: "Organizational", title: "Identification of legal, statutory, regulatory and contractual requirements", applicable: "Yes", status: "Implemented",
    justification: "NIS2, DORA flow-down, GDPR all apply" },
  { id: "A.5.32", theme: "Organizational", title: "Intellectual property rights", applicable: "Yes", status: "Implemented",
    justification: "Licensed software across the estate" },
  { id: "A.5.33", theme: "Organizational", title: "Protection of records", applicable: "Yes", status: "Partial",
    justification: "Logs and records needed for compliance and evidence" },
  { id: "A.5.34", theme: "Organizational", title: "Privacy and protection of personal identifiable information (PII)", applicable: "Yes", status: "Partial",
    justification: "Processor and controller duties under GDPR (R-14)" },
  { id: "A.5.35", theme: "Organizational", title: "Independent review of information security", applicable: "Yes", status: "Planned",
    justification: "Client audit rights and certification readiness" },
  { id: "A.5.36", theme: "Organizational", title: "Compliance with policies, rules and standards for information security", applicable: "Yes", status: "Partial",
    justification: "Demonstrable compliance for supervisors and clients" },
  { id: "A.5.37", theme: "Organizational", title: "Documented operating procedures", applicable: "Yes", status: "Partial",
    justification: "Consistency across 24/7 shift operations" },

  // Annex A 6 - People
  { id: "A.6.1", theme: "People", title: "Screening", applicable: "Yes", status: "Implemented",
    justification: "Staff hold privileged access to client environments (R-10)" },
  { id: "A.6.2", theme: "People", title: "Terms and conditions of employment", applicable: "Yes", status: "Implemented",
    justification: "Security duties in employment terms" },
  { id: "A.6.3", theme: "People", title: "Information security awareness, education and training", applicable: "Yes", status: "Partial",
    justification: "Human error and phishing are top entry routes (R-07)" },
  { id: "A.6.4", theme: "People", title: "Disciplinary process", applicable: "Yes", status: "Implemented",
    justification: "Deterrent and response to insider misuse (R-10)" },
  { id: "A.6.5", theme: "People", title: "Responsibilities after termination or change of employment", applicable: "Yes", status: "Partial",
    justification: "Revoking privileged access on exit (R-02, R-10)" },
  { id: "A.6.6", theme: "People", title: "Confidentiality or non-disclosure agreements", applicable: "Yes", status: "Implemented",
    justification: "Handles confidential client and financial data" },
  { id: "A.6.7", theme: "People", title: "Remote working", applicable: "Yes", status: "Partial",
    justification: "Hybrid working and remote privileged administration" },
  { id: "A.6.8", theme: "People", title: "Information security event reporting", applicable: "Yes", status: "Partial",
    justification: "Staff are first responders; feeds incident process (R-12)" },

  // Annex A 7 - Physical
  { id: "A.7.1", theme: "Physical", title: "Physical security perimeters", applicable: "Yes", status: "Implemented",
    justification: "HQ and equipment in colocation facilities" },
  { id: "A.7.2", theme: "Physical", title: "Physical entry", applicable: "Yes", status: "Implemented",
    justification: "Access control at HQ; facility operator controls colo entry (R-08)" },
  { id: "A.7.3", theme: "Physical", title: "Securing offices, rooms and facilities", applicable: "Yes", status: "Implemented",
    justification: "Protects NOC, offices and equipment" },
  { id: "A.7.4", theme: "Physical", title: "Physical security monitoring", applicable: "Yes", status: "Partial",
    justification: "Detects unauthorised physical access" },
  { id: "A.7.5", theme: "Physical", title: "Protecting against physical and environmental threats", applicable: "Yes", status: "Partial",
    justification: "Climate determination: heat, flooding, storms (R-16)" },
  { id: "A.7.6", theme: "Physical", title: "Working in secure areas", applicable: "Yes", status: "Implemented",
    justification: "NOC and sensitive areas at HQ" },
  { id: "A.7.7", theme: "Physical", title: "Clear desk and clear screen", applicable: "Yes", status: "Partial",
    justification: "Reduces exposure of client data in shared spaces" },
  { id: "A.7.8", theme: "Physical", title: "Equipment siting and protection", applicable: "Yes", status: "Implemented",
    justification: "Hosting equipment in colocation racks" },
  { id: "A.7.9", theme: "Physical", title: "Security of assets off-premises", applicable: "Yes", status: "Partial",
    justification: "Laptops and devices used in hybrid working" },
  { id: "A.7.10", theme: "Physical", title: "Storage media", applicable: "Yes", status: "Partial",
    justification: "Backup media and disposal" },
  { id: "A.7.11", theme: "Physical", title: "Supporting utilities", applicable: "Yes", status: "Partial",
    justification: "Dependence on power and cooling; continuity (R-01, R-16)" },
  { id: "A.7.12", theme: "Physical", title: "Cabling security", applicable: "Yes", status: "Implemented",
    justification: "Protects network and power cabling in facilities" },
  { id: "A.7.13", theme: "Physical", title: "Equipment maintenance", applicable: "Yes", status: "Implemented",
    justification: "Availability of hosting hardware" },
  { id: "A.7.14", theme: "Physical", title: "Secure disposal or re-use of equipment", applicable: "Yes", status: "Partial",
    justification: "Client data must not persist on retired hardware" },

  // Annex A 8 - Technological
  { id: "A.8.1", theme: "Technological", title: "User endpoint devices", applicable: "Yes", status: "Partial",
    justification: "Staff endpoints access management tooling (R-07)" },
  { id: "A.8.2", theme: "Technological", title: "Privileged access rights", applicable: "Yes", status: "Partial",
    justification: "The highest-impact control at an MSP (R-03, R-10)" },
  { id: "A.8.3", theme: "Technological", title: "Information access restriction", applicable: "Yes", status: "Partial",
    justification: "Tenant separation and least privilege (R-04)" },
  { id: "A.8.4", theme: "Technological", title: "Access to source code", applicable: "Yes", status: "Partial",
    justification: "Limited scope: internal automation and infrastructure-as-code" },
  { id: "A.8.5", theme: "Technological", title: "Secure authentication", applicable: "Yes", status: "Partial",
    justification: "MFA against credential theft (R-07)" },
  { id: "A.8.6", theme: "Technological", title: "Capacity management", applicable: "Yes", status: "Implemented",
    justification: "Availability of shared hosting platforms" },
  { id: "A.8.7", theme: "Technological", title: "Protection against malware", applicable: "Yes", status: "Implemented",
    justification: "Ransomware is a top risk (R-06)" },
  { id: "A.8.8", theme: "Technological", title: "Management of technical vulnerabilities", applicable: "Yes", status: "Partial",
    justification: "Unpatched systems are a critical entry point (R-09)" },
  { id: "A.8.9", theme: "Technological", title: "Configuration management", applicable: "Yes", status: "Partial",
    justification: "Secure, consistent configuration across the estate" },
  { id: "A.8.10", theme: "Technological", title: "Information deletion", applicable: "Yes", status: "Partial",
    justification: "Data minimisation and client exit/return of data" },
  { id: "A.8.11", theme: "Technological", title: "Data masking", applicable: "Yes", status: "Planned",
    justification: "Limited scope: protecting personal data in non-production use" },
  { id: "A.8.12", theme: "Technological", title: "Data leakage prevention", applicable: "Yes", status: "Planned",
    justification: "Prevents client/financial data exfiltration (R-04, R-14)" },
  { id: "A.8.13", theme: "Technological", title: "Information backup", applicable: "Yes", status: "Implemented",
    justification: "Backup and recovery is a core service (R-05)" },
  { id: "A.8.14", theme: "Technological", title: "Redundancy of information processing facilities", applicable: "Yes", status: "Implemented",
    justification: "Two-site design for resilience (R-01, R-05, R-08)" },
  { id: "A.8.15", theme: "Technological", title: "Logging", applicable: "Yes", status: "Partial",
    justification: "Detection and evidence across services (R-06)" },
  { id: "A.8.16", theme: "Technological", title: "Monitoring activities", applicable: "Yes", status: "Partial",
    justification: "24/7 NOC monitoring; detects compromise (R-03)" },
  { id: "A.8.17", theme: "Technological", title: "Clock synchronization", applicable: "Yes", status: "Implemented",
    justification: "Reliable timestamps for logs and investigations" },
  { id: "A.8.18", theme: "Technological", title: "Use of privileged utility programs", applicable: "Yes", status: "Partial",
    justification: "Powerful tooling restricted and monitored (R-10)" },
  { id: "A.8.19", theme: "Technological", title: "Installation of software on operational systems", applicable: "Yes", status: "Partial",
    justification: "Controls what runs on production systems" },
  { id: "A.8.20", theme: "Technological", title: "Networks security", applicable: "Yes", status: "Implemented",
    justification: "Managed network and security is a core service" },
  { id: "A.8.21", theme: "Technological", title: "Security of network services", applicable: "Yes", status: "Implemented",
    justification: "VPN, firewalls and remote access" },
  { id: "A.8.22", theme: "Technological", title: "Segregation of networks", applicable: "Yes", status: "Partial",
    justification: "Separation between clients and environments (R-04)" },
  { id: "A.8.23", theme: "Technological", title: "Web filtering", applicable: "Yes", status: "Partial",
    justification: "Reduces malware and phishing exposure (R-06, R-07)" },
  { id: "A.8.24", theme: "Technological", title: "Use of cryptography", applicable: "Yes", status: "Partial",
    justification: "Protecting data in transit and at rest" },
  { id: "A.8.25", theme: "Technological", title: "Secure development life cycle", applicable: "Yes", status: "Partial",
    justification: "Limited scope: internal automation and tooling" },
  { id: "A.8.26", theme: "Technological", title: "Application security requirements", applicable: "Yes", status: "Partial",
    justification: "Limited scope: internal and client-facing portals" },
  { id: "A.8.27", theme: "Technological", title: "Secure system architecture and engineering principles", applicable: "Yes", status: "Partial",
    justification: "Applies to hosting platform design" },
  { id: "A.8.28", theme: "Technological", title: "Secure coding", applicable: "Yes", status: "Partial",
    justification: "Limited scope: internal scripting and automation" },
  { id: "A.8.29", theme: "Technological", title: "Security testing in development and acceptance", applicable: "Yes", status: "Partial",
    justification: "Testing of changes before production" },
  { id: "A.8.30", theme: "Technological", title: "Outsourced development", applicable: "No", status: "N/A",
    justification: "Meridiaan does not outsource software development; it operates infrastructure and uses vendor software rather than commissioning bespoke development" },
  { id: "A.8.31", theme: "Technological", title: "Separation of development, test and production environments", applicable: "Yes", status: "Partial",
    justification: "Protects production hosting from change risk" },
  { id: "A.8.32", theme: "Technological", title: "Change management", applicable: "Yes", status: "Partial",
    justification: "Change is a common cause of outage and exposure" },
  { id: "A.8.33", theme: "Technological", title: "Test information", applicable: "Yes", status: "Partial",
    justification: "Client data must not be misused in testing" },
  { id: "A.8.34", theme: "Technological", title: "Protection of information systems during audit testing", applicable: "Yes", status: "Partial",
    justification: "Client and regulator audits must not disrupt services" }
];

/* Gap assessment section 4 - remediation roadmap phases */
const ROADMAP_PHASES = [
  { phase: 1, name: "Contain the sharpest risks", timeframe: "0–3 months" },
  { phase: 2, name: "Build assurance",            timeframe: "3–9 months" },
  { phase: 3, name: "Formalise and certify",      timeframe: "9–18 months" }
];

const GAP_PRIORITIES = [
  { key: "P1", label: "Close now",  meaning: "Maps to Critical/High risks or hard regulatory deadlines" },
  { key: "P2", label: "Close next", meaning: "" },
  { key: "P3", label: "Foundational", meaning: "Foundational or lower-risk; close as the programme matures" }
];

const GAP_STATUSES = ["Open", "In progress", "Closed"];

/*
 * Gap assessment section 3. `missing`, `controls`, `risks`, `priority` and
 * `phase` are from the source. `status` is "Open" for all at baseline.
 *
 * `owner` is DERIVED - the gap assessment says owners follow "the risk
 * register and SoA" but does not name them. Rule used: the owner of the
 * 05-policies policy that governs the gap where one exists, otherwise the
 * owner of the principal risk the gap leaves open. Edit freely.
 */
const GAPS = [
  { id: "G-01", theme: "Privileged access management", priority: "P1", phase: 1, status: "Open",
    missing: "Privileged rights not fully inventoried, least-privilege and separation-of-duties not consistently enforced or evidenced",
    controls: ["A.8.2", "A.8.18", "A.5.3", "A.5.18"], risks: ["R-03", "R-10", "R-07"],
    owner: "CISO" /* Access Control Policy owner; owns R-03, R-07, R-10 */ },
  { id: "G-02", theme: "Vulnerability and patch management", priority: "P1", phase: 1, status: "Open",
    missing: "Patching inconsistent under 24/7 uptime pressure; no evidenced SLA for critical fixes",
    controls: ["A.8.8", "A.8.9", "A.8.19"], risks: ["R-09"],
    owner: "Heads of Engineering" /* owns R-09 */ },
  { id: "G-03", theme: "Phishing resistance and authentication", priority: "P1", phase: 1, status: "Open",
    missing: "Security awareness training informal; MFA not proven across all privileged access",
    controls: ["A.6.3", "A.8.5", "A.8.23"], risks: ["R-07"],
    owner: "CISO" /* owns R-07 */ },
  { id: "G-04", theme: "Incident management and regulatory reporting", priority: "P1", phase: 1, status: "Open",
    missing: "Incident process not documented against NIS2/DORA deadlines; reporting playbook and evidence trail incomplete",
    controls: ["A.5.24", "A.5.25", "A.5.26", "A.5.28", "A.6.8"], risks: ["R-12", "R-06"],
    owner: "Head of Legal & Compliance" /* Incident Response Policy owner; owns R-12 */ },
  { id: "G-05", theme: "Backup assurance and continuity", priority: "P2", phase: 2, status: "Open",
    missing: "Backup runs, but recovery testing and continuity plans are not regularly exercised or evidenced",
    controls: ["A.5.29", "A.5.30", "A.8.13"], risks: ["R-05", "R-08"],
    owner: "Head of Operations" /* Business Continuity Policy owner; owns R-05, R-08 */ },
  { id: "G-06", theme: "Supplier and ICT supply-chain risk", priority: "P2", phase: 2, status: "Open",
    missing: "Supplier security assessment and contract clauses not formalised; DORA flow-down not fully mapped to suppliers",
    controls: ["A.5.19", "A.5.20", "A.5.21", "A.5.22"], risks: ["R-11", "R-03"],
    owner: "Head of Legal & Compliance" /* Supplier Security Policy owner; owns R-11 */ },
  { id: "G-07", theme: "Tenant segregation and data protection", priority: "P2", phase: 2, status: "Open",
    missing: "Segregation controls and data-leakage/masking measures not fully implemented or evidenced",
    controls: ["A.8.3", "A.8.22", "A.8.12", "A.8.11", "A.5.34"], risks: ["R-04", "R-14"],
    owner: "Head of Cloud & Infrastructure Engineering" /* owns R-04 */ },
  { id: "G-08", theme: "Logging and monitoring coverage", priority: "P2", phase: 2, status: "Open",
    missing: "Logging and monitoring exist but coverage, retention and alerting are not consistently defined or evidenced",
    controls: ["A.8.15", "A.8.16", "A.5.33"], risks: ["R-03", "R-06"],
    owner: "CISO" /* owns R-03, R-06 */ },
  { id: "G-09", theme: "ISMS governance and documentation", priority: "P2", phase: 3, status: "Open",
    missing: "Policies, asset inventory, classification, procedures and internal review not fully documented — the certification-readiness gap",
    controls: ["A.5.1", "A.5.2", "A.5.9", "A.5.12", "A.5.35", "A.5.36", "A.5.37", "A.5.27"], risks: [],
    risksNote: "Underpins all",
    owner: "CISO" /* Information Security Policy and ISMS owner */ },
  { id: "G-10", theme: "Physical, environmental and climate resilience", priority: "P3", phase: 3, status: "Open",
    missing: "Physical monitoring and environmental/climate protections at sites not fully evidenced",
    controls: ["A.7.4", "A.7.5", "A.7.11"], risks: ["R-16", "R-08"],
    owner: "Head of Operations" /* owns R-16, R-08 */ }
];

/*
 * ISMS document set (Documents module).
 *
 * From the source: name, owner, approver and review frequency come from
 * each document's header table where it is in this repo (`path`). Every
 * document in the repo is a 0.1 draft dated 2026-09-21 or 2026-09-30.
 *
 * ILLUSTRATIVE (not in the source), chosen to reflect the governance
 * weakness the gap assessment describes (G-09):
 *  - Five policies have an older approved version still in force from
 *    before the ISMS project. `version`, `status` and `lastReviewed`
 *    describe that version; `rewrite` notes the 0.1 draft in 05-policies
 *    that will replace it. Four of them are past their review date.
 *  - The incident register, supplier register, training records, internal
 *    audit report and management review minutes are records a real ISMS
 *    keeps outside this repo (`path` is empty). The internal audit and
 *    management review have not happened yet (roadmap phase 3), so they
 *    are "Not started" with a `firstDue` date instead of `lastReviewed`.
 *  - Approvers missing from a source header are left empty on purpose.
 *  - Links to controls, risks and gaps use the document's own references
 *    where it has them, otherwise the gap/SoA entries for the same topic.
 *
 * Review status is calculated in the app from lastReviewed + reviewMonths
 * (or firstDue) against today's date: Overdue, Due soon (<= 60 days) or
 * Current. `reviewNote` is the review rule as the source words it.
 */
const DOC_TYPES = ["Policy", "Register", "Record", "Report"];
const DOC_STATUSES = ["Approved", "Draft", "Not started"];

const DOCUMENTS = [
  /* ---- Policies (05-policies) ---- */
  { id: "DOC-01", name: "Information Security Policy", type: "Policy",
    purpose: "The top-level rulebook: management's commitment to security and the direction every other policy follows.",
    owner: "CISO", approver: "CEO", version: "1.0", status: "Approved",
    lastReviewed: "2025-05-20", reviewMonths: 12, reviewNote: "Annually, and on significant change",
    path: "05-policies/01-information-security-policy.md", rewrite: "0.1 draft rewrite dated 2026-09-30",
    clauses: "Clause 5.2", controls: ["A.5.1", "A.5.2", "A.5.4", "A.5.36"], risks: [], risksNote: "Underpins all", gaps: ["G-09"] },
  { id: "DOC-02", name: "Incident Response Policy", type: "Policy",
    purpose: "How incidents are reported, handled and notified to regulators and clients within the legal deadlines.",
    owner: "Head of Legal & Compliance", approver: "CISO", version: "0.1", status: "Draft",
    lastReviewed: "2026-09-30", reviewMonths: 12, reviewNote: "Annually, and after any significant incident",
    path: "05-policies/02-incident-response-policy.md",
    controls: ["A.5.24", "A.5.25", "A.5.26", "A.5.27", "A.5.28", "A.6.8"], risks: ["R-12", "R-06", "R-14"], gaps: ["G-04"] },
  { id: "DOC-03", name: "Access Control Policy", type: "Policy",
    purpose: "Who may access which systems, how access is granted and reviewed, and the extra rules for admin accounts.",
    owner: "CISO", approver: "CEO", version: "1.1", status: "Approved",
    lastReviewed: "2025-08-04", reviewMonths: 12, reviewNote: "Annually, and on significant change",
    path: "05-policies/03-access-control-policy.md", rewrite: "0.1 draft rewrite dated 2026-09-30",
    controls: ["A.5.15", "A.5.16", "A.5.17", "A.5.18", "A.8.2", "A.8.3", "A.8.5", "A.8.18"], risks: ["R-03", "R-04", "R-10", "R-07"], gaps: ["G-01", "G-03", "G-07"] },
  { id: "DOC-04", name: "Supplier Security Policy", type: "Policy",
    purpose: "The security checks and contract terms required before and while using suppliers and sub-processors.",
    owner: "Head of Legal & Compliance", approver: "CISO", version: "1.0", status: "Approved",
    lastReviewed: "2025-12-15", reviewMonths: 12, reviewNote: "Annually, and on significant change",
    path: "05-policies/04-supplier-security-policy.md", rewrite: "0.1 draft rewrite dated 2026-09-30",
    controls: ["A.5.19", "A.5.20", "A.5.21", "A.5.22"], risks: ["R-03", "R-11"], gaps: ["G-06"] },
  { id: "DOC-05", name: "Business Continuity and ICT Resilience Policy", type: "Policy",
    purpose: "How services keep running or recover after an outage, and how often recovery is tested.",
    owner: "Head of Operations", approver: "CISO", version: "1.0", status: "Approved",
    lastReviewed: "2024-11-04", reviewMonths: 12, reviewNote: "Annually, and after any major disruption or test",
    path: "05-policies/05-business-continuity-policy.md", rewrite: "0.1 draft rewrite dated 2026-09-30",
    controls: ["A.5.29", "A.5.30", "A.8.13", "A.8.14"], risks: ["R-01", "R-05", "R-08", "R-16"], gaps: ["G-05", "G-10"] },
  { id: "DOC-06", name: "Acceptable Use Policy", type: "Policy",
    purpose: "What staff may and may not do with company devices, data and accounts.",
    owner: "CISO", approver: "CEO", version: "2.0", status: "Approved",
    lastReviewed: "2025-10-01", reviewMonths: 12, reviewNote: "Annually, and on significant change",
    path: "05-policies/06-acceptable-use-policy.md", rewrite: "0.1 draft rewrite dated 2026-09-30",
    controls: ["A.5.10", "A.8.1", "A.7.7"], risks: ["R-07", "R-10", "R-14"], gaps: ["G-09"] },
  { id: "DOC-07", name: "Cryptography Policy", type: "Policy",
    purpose: "When and how data must be encrypted, and how encryption keys are managed.",
    owner: "CISO", approver: "CEO", version: "0.1", status: "Draft",
    lastReviewed: "2026-09-30", reviewMonths: 12, reviewNote: "Annually, and on significant change",
    path: "05-policies/07-cryptography-policy.md",
    controls: ["A.8.24"], risks: ["R-04", "R-14"], gaps: ["G-07"] },

  /* ---- Core ISMS records in this repo ---- */
  { id: "DOC-08", name: "Company Profile (context of the organisation)", type: "Record",
    purpose: "Describes the business, its services, sites and regulatory context, which is the starting point for the ISMS.",
    owner: "CISO", approver: "CEO", version: "0.1", status: "Draft",
    lastReviewed: "2026-09-21", reviewMonths: 12, reviewNote: "Annually, and on any significant change to services, sites, clients or regulation",
    path: "00-scope-context/01-company-profile.md",
    clauses: "Clause 4.1", controls: [], risks: ["R-15", "R-16"], gaps: ["G-09"] },
  { id: "DOC-09", name: "Interested Parties", type: "Record",
    purpose: "Lists the clients, regulators and others with a stake in Meridiaan's security, and what each one requires.",
    owner: "CISO", approver: "CEO", version: "0.1", status: "Draft",
    lastReviewed: "2026-09-30", reviewMonths: 12, reviewNote: "Annually, and on any significant change to clients, suppliers, contracts or regulation",
    path: "00-scope-context/02-interested-parties.md",
    clauses: "Clause 4.2", controls: ["A.5.31"], risks: ["R-12", "R-15"], gaps: ["G-09"] },
  { id: "DOC-10", name: "ISMS Scope Statement", type: "Record",
    purpose: "Defines exactly which services, sites and systems the ISMS, and any future certificate, covers.",
    owner: "CISO", approver: "CEO", version: "0.1", status: "Draft",
    lastReviewed: "2026-09-30", reviewMonths: 12, reviewNote: "Annually, and on any significant change to services, sites, clients or regulation",
    path: "00-scope-context/03-scope-statement.md",
    clauses: "Clause 4.3", controls: [], risks: [], risksNote: "Underpins all", gaps: ["G-09"] },
  { id: "DOC-11", name: "Risk Register", type: "Register",
    purpose: "Every identified security risk, how serious it is, who owns it and how it is being treated.",
    owner: "CISO", approver: "CEO", version: "0.1", status: "Draft",
    lastReviewed: "2026-09-30", reviewMonths: 12, reviewNote: "At least annually, and after any major incident or significant change",
    path: "01-risk-register/01-risk-register.md", module: "risks",
    clauses: "Clauses 6.1.2 and 8.2", controls: [], risks: [], risksNote: "Holds every risk", gaps: [], gapsNote: "Sets the priority of every gap" },
  { id: "DOC-12", name: "Statement of Applicability", type: "Record",
    purpose: "States which of the 93 ISO 27001 controls apply, why, and how far each is implemented. Auditors start here.",
    owner: "CISO", approver: "CEO", version: "0.1", status: "Draft",
    lastReviewed: "2026-09-30", reviewMonths: 12, reviewNote: "At least annually, and on any significant change to risks, services or controls",
    path: "02-iso27001-soa/01-statement-of-applicability.md", module: "controls",
    clauses: "Clause 6.1.3 d)", controls: [], controlsNote: "All 93 Annex A controls", risks: [], risksNote: "Treats every risk through its controls", gaps: ["G-09"] },
  { id: "DOC-13", name: "Gap Assessment and Remediation Roadmap", type: "Report",
    purpose: "Where Meridiaan falls short of the standard, and the prioritised plan to close each gap.",
    owner: "CISO", approver: "CEO", version: "0.1", status: "Draft",
    lastReviewed: "2026-09-30", reviewMonths: 3, reviewNote: "Quarterly against the roadmap; fully at each management review",
    path: "04-gap-assessment/01-gap-assessment.md", module: "gaps",
    clauses: "Clauses 6.1.3, 9 and 10", controls: [], risks: [], risksNote: "Prioritised by every risk", gaps: [], gapsNote: "Defines all 10 gaps" },
  { id: "DOC-14", name: "NIS2 and DORA Crosswalk", type: "Record",
    purpose: "Maps NIS2 and DORA legal requirements to ISO 27001 controls, so one set of controls meets all three.",
    owner: "Head of Legal & Compliance", approver: "CISO", version: "0.1", status: "Draft",
    lastReviewed: "2026-09-30", reviewMonths: 12, reviewNote: "Annually, and on any change to the regulations or their national transposition",
    path: "03-nis2-crosswalk/01-nis2-dora-crosswalk.md",
    controls: ["A.5.31", "A.5.24", "A.5.19"], risks: ["R-12", "R-15"], gaps: ["G-04", "G-06"] },
  { id: "DOC-15", name: "Evidence Index", type: "Register",
    purpose: "Points to the proof that each control actually works: what an auditor or client will ask to see.",
    owner: "CISO", approver: "", version: "0.1", status: "Draft",
    lastReviewed: "2026-09-30", reviewMonths: 12, reviewNote: "Continuously as controls mature; formally at each management review",
    path: "06-evidence/01-evidence-index.md",
    clauses: "Clause 9", controls: ["A.5.28", "A.5.36"], risks: [], risksNote: "Shows treatment is working", gaps: ["G-08", "G-09"] },
  { id: "DOC-16", name: "Executive Summary", type: "Report",
    purpose: "A plain-language briefing for the board on security posture, regulatory exposure and the roadmap.",
    owner: "CISO", approver: "", version: "0.1", status: "Draft",
    lastReviewed: "2026-09-30", reviewMonths: 12, reviewNote: "Not stated in the source; set to annual with the management review",
    path: "07-exec-summary/01-executive-summary.md",
    clauses: "Clause 5.1", controls: [], risks: [], risksNote: "Summarises all", gaps: ["G-09"] },

  /* ---- Records a real ISMS keeps outside this repo (illustrative) ---- */
  { id: "DOC-17", name: "Incident Register", type: "Register",
    purpose: "Log of every security incident, how it was handled and any regulator notification: the trail regulators expect.",
    owner: "CISO", approver: "Head of Legal & Compliance", version: "1.2", status: "Approved",
    lastReviewed: "2026-10-20", reviewMonths: 3, reviewNote: "Quarterly, and after any significant incident",
    path: "", module: "incidents",
    controls: ["A.5.24", "A.5.25", "A.5.26", "A.5.27", "A.5.28", "A.6.8"], risks: ["R-12", "R-06", "R-14"], gaps: ["G-04"] },
  { id: "DOC-18", name: "Supplier Register", type: "Register",
    purpose: "Inventory of suppliers and sub-processors with their criticality, assessment status and security terms.",
    owner: "Head of Legal & Compliance", approver: "CISO", version: "1.0", status: "Approved",
    lastReviewed: "2026-02-10", reviewMonths: 6, reviewNote: "Six-monthly, and on any supplier incident",
    path: "",
    controls: ["A.5.19", "A.5.20", "A.5.22", "A.5.23"], risks: ["R-11", "R-03"], gaps: ["G-06"] },
  { id: "DOC-19", name: "Security Training Records", type: "Record",
    purpose: "Who has completed security awareness and phishing training, and when.",
    owner: "CISO", approver: "CEO", version: "1.0", status: "Approved",
    lastReviewed: "2026-04-30", reviewMonths: 12, reviewNote: "Annually, after each training cycle",
    path: "",
    controls: ["A.6.3"], risks: ["R-07", "R-10"], gaps: ["G-03"] },
  { id: "DOC-20", name: "Internal Audit Report", type: "Report",
    purpose: "An independent check that the ISMS works as documented. Required before certification.",
    owner: "CISO", approver: "CEO", version: "", status: "Not started",
    lastReviewed: "", firstDue: "2027-06-30", reviewMonths: 12, reviewNote: "Annual audit programme; first audit in roadmap phase 3",
    path: "",
    clauses: "Clause 9.2", controls: ["A.5.35", "A.5.36"], risks: [], risksNote: "Underpins all", gaps: ["G-09"] },
  { id: "DOC-21", name: "Management Review Minutes", type: "Record",
    purpose: "Record of top management reviewing the ISMS and deciding on resources and changes.",
    owner: "CISO", approver: "CEO", version: "", status: "Not started",
    lastReviewed: "", firstDue: "2027-09-30", reviewMonths: 12, reviewNote: "At least annually; first review in roadmap phase 3",
    path: "",
    clauses: "Clause 9.3", controls: ["A.5.1"], risks: [], risksNote: "Underpins all", gaps: ["G-09"] }
];

/*
 * Incidents module.
 *
 * Services and financial clients come from 00-scope-context/01-company-
 * profile.md. NIS2 deadlines come from 05-policies/02-incident-response-
 * policy.md section 6. That file ends partway through its deadline table,
 * so the GDPR and client rows below follow GDPR Art. 33 and the DORA
 * position in the company profile and crosswalk.
 *
 * Clock fields: `trigger` is the incident answer that switches the clock
 * on; `hours`/`months` is the deadline, counted `from` awareness or from
 * when the NIS2 notification was sent; `dueSoonHours` is when the clock
 * turns amber.
 */
const INCIDENT_SERVICES = [
  "Private-cloud hosting",
  "Managed infrastructure and workplace",
  "Managed network and security",
  "Backup and disaster recovery",
  "Service desk and 24/7 monitoring"
];
const FINANCIAL_CLIENTS = ["Client A (retail bank)", "Client B (insurer)"];
const INCIDENT_SEVERITIES = ["Low", "Medium", "High", "Critical"];
const INCIDENT_STATUSES = ["Open", "Contained", "Closed"];

// "Without undue delay" has no fixed statutory period. This internal target
// makes it measurable; each financial client's contract may set its own.
const CLIENT_NOTIFY_TARGET_HOURS = 4;

const REPORTING_OBLIGATIONS = [
  { key: "nis2-early", title: "NIS2 early warning", authority: "CCB", authorityName: "Centre for Cybersecurity Belgium",
    basis: "NIS2 Art. 23(4)(a) · Belgian NIS2 Act", trigger: "significant", hours: 24, from: "awareness", dueSoonHours: 6,
    rule: "Within 24 hours of awareness", owner: "Head of Legal & Compliance",
    note: "Says whether the incident is suspected to be malicious or could have cross-border impact." },
  { key: "nis2-notification", title: "NIS2 incident notification", authority: "CCB", authorityName: "Centre for Cybersecurity Belgium",
    basis: "NIS2 Art. 23(4)(b) · Belgian NIS2 Act", trigger: "significant", hours: 72, from: "awareness", dueSoonHours: 12,
    rule: "Within 72 hours of awareness", owner: "Head of Legal & Compliance",
    note: "Updates the early warning with an initial assessment: severity, impact and indicators of compromise." },
  { key: "nis2-final", title: "NIS2 final report", authority: "CCB", authorityName: "Centre for Cybersecurity Belgium",
    basis: "NIS2 Art. 23(4)(d) · Belgian NIS2 Act", trigger: "significant", months: 1, from: "nis2-notification", dueSoonHours: 7 * 24,
    rule: "Within one month of the incident notification", owner: "Head of Legal & Compliance",
    note: "Full analysis: root cause, threat type, mitigation applied and any cross-border impact." },
  { key: "gdpr", title: "GDPR breach notification", authority: "GBA/APD", authorityName: "Gegevensbeschermingsautoriteit / Autorité de protection des données",
    basis: "GDPR Art. 33", trigger: "personalData", hours: 72, from: "awareness", dueSoonHours: 12,
    rule: "Within 72 hours of awareness", owner: "Data Protection Officer (DPO)",
    note: "Not needed if the DPO concludes the breach is unlikely to put individuals at risk; record that decision. Meridiaan notifies the GBA for data it controls (staff, client contacts). For client data it processes, it must tell the client (the controller) without undue delay, and the client decides on notifying the GBA." },
  { key: "client", title: "Financial client notification", authority: "Affected client", authorityName: "Contractual notice to the affected financial client(s)",
    basis: "Client contract (DORA Art. 30 flow-down)", trigger: "financialClient", hours: CLIENT_NOTIFY_TARGET_HOURS, from: "awareness", dueSoonHours: 1,
    rule: "Without undue delay (internal target " + CLIENT_NOTIFY_TARGET_HOURS + " hours)", owner: "Head of Legal & Compliance",
    note: "Gives the client what it needs to classify the incident and report it to its own supervisor: timeline, services and data affected, impact, and actions taken." }
];

/*
 * Worked example, so the module is not empty. ILLUSTRATIVE. Its awareness
 * time is set relative to when the module is first opened in a browser
 * (`awareMinutesAgo`) so the clocks are live; that moment is then saved
 * and the clocks keep running from it. "Reset to source data" restarts it.
 */
const INCIDENTS = [
  { id: "INC-EXAMPLE", awareMinutesAgo: 200,
    title: "Phishing compromise of engineer account used to access a hosted client environment",
    description: "A cloud engineer entered credentials on a phishing page imitating the identity-provider sign-in and approved an MFA push. " +
      "The attacker signed in to the private-cloud management console from an unfamiliar IP and exported a VM snapshot from a shared hosting cluster. " +
      "The snapshot belongs to Client B (insurer) and contains a policyholder database (personal data). " +
      "Session revoked, credentials reset and console access restricted; investigation ongoing.",
    severity: "High", significant: true,
    services: ["Private-cloud hosting", "Backup and disaster recovery"],
    personalData: true, financialClient: true, clients: ["Client B (insurer)"],
    status: "Open", risks: ["R-07", "R-03", "R-14"], example: true }
];
