# 01 Company Profile

> **Fictional content.** Meridiaan ICT Services BV, its clients, people, figures and sites are invented for this portfolio project. Any resemblance to a real organisation is unintended.

| | |
| --- | --- |
| **Document** | Company profile and context of the organisation |
| **ISO/IEC 27001 reference** | Clause 4.1, Understanding the organisation and its context |
| **Version / status** | 0.1 / Draft |
| **Date** | 2026-09-21 |
| **Owner** | Chief Information Security Officer (CISO) |
| **Approver** | Chief Executive Officer (CEO) |
| **Review** | Annually, and on any significant change to services, sites, clients or regulation |

## 1. Company at a glance

| Item | Detail |
| --- | --- |
| Legal name | Meridiaan ICT Services BV |
| Legal form | BV (besloten vennootschap), Belgian private limited company |
| Company number | BE 0000.000.000 (placeholder) |
| Headquarters | Mechelen, Belgium |
| Business | Managed IT services and private-cloud hosting for mid-sized Belgian businesses |
| Employees | About 120 |
| Turnover | About EUR 16 million per year |
| Clients | About 85 organisations, including two financial-sector clients |
| Information security certification | None yet. This ISMS is being built ahead of an ISO/IEC 27001 certification decision. |

## 2. Services

Meridiaan runs five services. Every client uses at least one; most use several.

| # | Service | What Meridiaan does |
| --- | --- | --- |
| 1 | Private-cloud hosting | Dedicated and shared private cloud (virtualised compute, storage and networking) hosted in colocation facilities in Belgium |
| 2 | Managed infrastructure and workplace | Operation, patching and monitoring of servers and endpoints, and administration of clients' identity and collaboration tenants |
| 3 | Managed network and security | Firewalls, segmentation, remote-access VPN, network monitoring, vulnerability scanning and log collection. This is not a full managed SOC. |
| 4 | Backup and disaster recovery | Backup of client workloads with replication between Meridiaan's two hosting sites, and recovery testing |
| 5 | Service desk and 24/7 monitoring | Level 1 to 3 support and a staffed network operations centre (NOC) covering all monitored services around the clock |

### Financial-sector dependency

Client A (a mid-sized retail bank) and Client B (an insurer) both use services 1, 3, 4 and 5. Both clients treat these services as supporting critical or important functions in their own DORA classification. That classification is the client's decision, not Meridiaan's, but Meridiaan has to be able to meet the contractual and assurance requirements that follow from it. Service 2 is not used by either financial client.

## 3. Organisation

About 120 staff across the following functions. Headcounts are approximate.

| Function | Staff | Security relevance |
| --- | ---: | --- |
| Executive management | 4 | Sets direction; accountable for the ISMS |
| Cloud and infrastructure engineering | 32 | Privileged access to hosting platforms and client environments |
| Managed services operations (service desk and NOC) | 28 | 24/7 shift work; first responders to incidents |
| Network and security engineering | 14 | Privileged access to network and security tooling |
| Client services and account management | 12 | Client contact; contract and assurance requests |
| Sales and marketing | 8 | Handles client and prospect data |
| Finance, HR, procurement and administration | 12 | Personnel screening, supplier onboarding, payments |
| Legal, compliance and security governance | 6 | Runs the ISMS, privacy and regulatory compliance |
| Internal IT and facilities | 4 | Corporate systems and HQ premises |

### Security-relevant roles

Roles only. No individuals are named in this project.

| Role | Responsibility in the ISMS |
| --- | --- |
| Chief Executive Officer (CEO) | Ultimate accountability; approves ISMS policy, scope and resources; acts as the management body for regulatory purposes |
| Chief Information Security Officer (CISO) | Owns and operates the ISMS; reports to the CEO |
| Data Protection Officer (DPO) | Oversees GDPR compliance for Meridiaan's own data and its processor role |
| Head of Operations | Owns service delivery, the NOC and service continuity |
| Head of Legal and Compliance | Tracks regulatory obligations and client contract requirements |
| Heads of engineering | Own technical controls on the hosting, network and security platforms |

## 4. Sites and technology

### Sites

| Site | Use |
| --- | --- |
| Headquarters, Mechelen | Offices, service desk, NOC, internal IT |
| Colocation facility 1 (primary) | Production hosting for services 1, 3 and 4. Third-party facility in Belgium. |
| Colocation facility 2 (secondary) | Disaster-recovery site and replication target. Third-party facility in Belgium. |
| Remote working | Hybrid working for most staff; engineers administer platforms through a controlled privileged-access path |

In both colocation facilities Meridiaan owns and operates the equipment in its racks. The facility operator provides the building, power, cooling and physical access control. That makes the operators critical suppliers rather than part of Meridiaan's own estate. Client data stays in Belgium, which matters to the financial clients.

### Technology, by category

Described by category only, without product or vendor names.

- Virtualisation platform with software-defined storage and networking (private cloud)
- Monitoring, ticketing and service-management tooling
- Backup platform with replication between the two sites
- Identity, authentication and privileged-access management
- Firewalls, VPN and network segmentation
- Log collection and vulnerability scanning
- Endpoint management for corporate and managed devices

## 5. Client base

| Segment | Share of revenue (approx.) | Note |
| --- | ---: | --- |
| Financial sector (Client A and Client B) | 25% | Client A about 14%, Client B about 11%. Both supervised by the National Bank of Belgium (NBB). |
| Manufacturing and industry | 25% | |
| Logistics and retail | 20% | |
| Healthcare and professional services | 15% | Some of these clients are themselves in NIS2 scope and pass supply-chain requirements on |
| Public sector and other | 15% | |

Two clients account for a quarter of revenue. That is a commercial concentration risk and also a regulatory one: a serious incident or a failed client audit affects both the business and Meridiaan's standing with the financial supervisors' registers.

## 6. Regulatory position in brief

Detail and sources are in `03-regulatory-legal-context.md` (not yet written).

| Regime | Meridiaan's position |
| --- | --- |
| NIS2 and the Belgian NIS2 Act | Directly in scope as a managed service provider and cloud and data-centre service provider. At about 120 staff it is a medium-sized entity, so it is an **important entity**, not an essential one. |
| DORA | Indirectly in scope as an **ICT third-party service provider** to two financial entities, supporting critical or important functions. Obligations reach Meridiaan through client contracts and the clients' third-party risk management. Meridiaan is **not** a designated critical ICT third-party provider (CTPP) and is not directly overseen by the European Supervisory Authorities. |
| GDPR | Processor for most client data. Controller for its own employee, client-contact and prospect data. |

## 7. Issues that affect the ISMS

ISO/IEC 27001 clause 4.1 asks the organisation to determine the external and internal issues that are relevant to its purpose and affect the ISMS's intended outcomes.

### External issues

| Issue | Why it matters |
| --- | --- |
| Managed service providers are targeted as a route into their clients | A compromise of Meridiaan's tooling or privileged accounts could reach many client environments at once |
| NIS2, DORA (through clients), GDPR and national supervision | Creates legal obligations and contractual flow-down that the ISMS must demonstrably meet |
| Client due diligence and audits | Financial clients require audit rights, evidence, incident notification and exit plans; others increasingly ask for ISO/IEC 27001 |
| Dependence on colocation operators, connectivity, energy and equipment vendors | Supplier failure or compromise affects service delivery and needs supplier assurance and continuity plans |
| Shortage of skilled infrastructure and security staff in Belgium | Affects hiring, retention and the ability to run 24/7 operations |
| Geopolitical tension and energy-price volatility | Raises the threat level and the cost and availability of hosting capacity |

### Internal issues

| Issue | Why it matters |
| --- | --- |
| Small governance team relative to the breadth of services | Key-person dependency; limited capacity to run assurance activities in parallel |
| Privileged access concentrated in engineering and operations | Highest-impact accounts; needs strong access control, monitoring and separation of duties |
| Multi-tenant shared platforms | Segregation between clients is a core control objective |
| Growth ahead of process formalisation | Some practices are informal and undocumented, which the gap assessment will need to surface |
| 24/7 shift-based operations | Requires reliable handover, on-call and incident procedures, and attention to fatigue and retention |
| Revenue concentration in two financial clients | Ties the ISMS's priorities closely to financial-sector expectations |

## 8. Climate change determination

ISO/IEC 27001:2022 Amendment 1:2024 requires the organisation to determine whether climate change is a relevant issue.

**Determination: relevant.** Meridiaan's services depend on two physical hosting facilities and on a stable power supply. Extreme heat can strain cooling, flooding and storms can disrupt sites or access, and grid disruption or energy-price shocks affect availability and cost. These exposures will be assessed in the risk register and reflected in continuity and disaster-recovery planning. The determination is reviewed annually with this document.

## 9. Assumptions

- Meridiaan has completed its NIS2 registration with the Centre for Cybersecurity Belgium (CCB).
- The classification as an important entity rests on size and sector. It should be confirmed against the Belgian classification rules and any designation by the CCB.
- Client A and Client B have classified the services in section 2 as supporting critical or important functions.
- Figures for headcount, turnover, client mix and revenue shares are illustrative and approximate.
- No ISO/IEC 27001 certificate is held.
