# 03 ISMS Scope Statement

> **Fictional content.** Meridiaan ICT Services BV, its clients, people, figures and sites are invented for this portfolio project. Any resemblance to a real organisation is unintended.

| | |
| --- | --- |
| **Document** | Scope of the information security management system |
| **ISO/IEC 27001 reference** | Clause 4.3, Determining the scope of the ISMS |
| **Version / status** | 0.1 / Draft |
| **Date** | 2026-09-30 |
| **Owner** | Chief Information Security Officer (CISO) |
| **Approver** | Chief Executive Officer (CEO) |
| **Review** | Annually, and on any significant change to services, sites, clients or regulation |

## 1. Purpose

This document sets the boundaries and applicability of Meridiaan's ISMS. In line with ISO/IEC 27001 clause 4.3 it is based on the context in `01-company-profile.md` (clause 4.1), the requirements in `02-interested-parties.md` (clause 4.2), and the interfaces and dependencies with other organisations set out in section 6 below.

## 2. Scope statement

The ISMS applies to:

> The provision of managed IT services and private-cloud hosting — comprising private-cloud hosting, managed infrastructure and workplace services, managed network and security services, backup and disaster recovery, and service desk and 24/7 monitoring — to Meridiaan's clients, together with the supporting corporate and governance functions, delivered from Meridiaan's headquarters in Mechelen and its two colocation hosting facilities in Belgium, and through controlled remote working.

This is in accordance with the Statement of Applicability (see `02-iso27001-soa/`, not yet written).

## 3. Organisational scope

The ISMS covers the whole legal entity, Meridiaan ICT Services BV, and all functions listed in `01-company-profile.md` section 3, including executive management, engineering, operations, client services, sales, corporate functions and security governance. No department is excluded.

**Why the whole entity, rather than a single service:** NIS2 obligations attach to the legal entity, not to one service line; the two financial clients rely on several services at once; and Meridiaan's highest-impact risk — privileged access that spans platforms and clients — cuts across all functions. A narrower scope (for example, hosting only) would be cheaper to certify but would leave regulatory and assurance gaps, so it was rejected.

## 4. Physical scope

| Site | In scope | Note |
| --- | --- | --- |
| Headquarters, Mechelen | Yes | Offices, service desk, NOC, internal IT |
| Colocation facility 1 (primary) | Yes — Meridiaan's equipment and operations in its racks | The building, power, cooling and physical access control are delivered by the facility operator (see section 6) |
| Colocation facility 2 (secondary / DR) | Yes — as above | As above |
| Remote working | Yes | Hybrid working, and the controlled privileged-access path engineers use to administer platforms |

## 5. Services and information in scope

- The five services described in `01-company-profile.md` section 2, in full.
- Client data processed or hosted within those services (Meridiaan acting as processor).
- Meridiaan's own corporate information: employee, client-contact and prospect data (Meridiaan acting as controller), and internal operational and security records.
- The tooling used to deliver and secure the services (virtualisation, monitoring and service management, backup, identity and privileged access, network and security, logging and vulnerability scanning, endpoint management).

## 6. Interfaces and dependencies

Clause 4.3 requires the interfaces and dependencies between Meridiaan's activities and those performed by other organisations to be considered. Everything below is inside the ISMS as a managed relationship, even where the activity itself is performed by a third party.

| Interface / dependency | Meridiaan's responsibility | Other party's responsibility | How the interface is managed |
| --- | --- | --- | --- |
| Colocation facility operators | Security of Meridiaan's own equipment, configuration and data in the racks | Building, power, cooling, and physical access control to the facility | Supplier contracts and SLAs; physical-security assurance evidence obtained and passed to clients (supplier management) |
| Clients (shared responsibility) | Securing the infrastructure, platforms and services Meridiaan operates | Their own data classification, user access decisions, and anything in the client's own application layer, as set per contract | Contracts and service descriptions defining the responsibility split; assurance reporting |
| Connectivity and energy suppliers | Resilient design and monitoring of Meridiaan's use of these services | Delivery of connectivity and power | Supplier management and continuity planning |
| Sub-processors and software suppliers | Selecting, assessing and overseeing them | Delivery of their own service securely | Supplier assessment and onboarding; GDPR sub-processor terms |

## 7. Boundaries of responsibility

No service, site or function of Meridiaan is excluded from the ISMS. Activities delivered by third parties (section 6) remain within the ISMS's concern and are managed through supplier assurance rather than direct operation. Any exclusion of individual Annex A controls, with justification, is recorded in the Statement of Applicability, not here.

## 8. Assumptions

- The scope reflects the organisation as described in `01-company-profile.md` and is reviewed when services, sites, clients or regulation change.
- The responsibility split with each client is confirmed in that client's contract and service description.
- The scope statement will be reproduced on any future ISO/IEC 27001 certificate, so it is kept short and precise.