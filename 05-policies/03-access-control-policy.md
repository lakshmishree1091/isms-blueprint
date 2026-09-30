# 03 Access Control Policy

> **Fictional content.** Meridiaan ICT Services BV, its clients, people, figures and sites are invented for this portfolio project. Any resemblance to a real organisation is unintended.

| | |
| --- | --- |
| **Document** | Access Control Policy |
| **ISO/IEC 27001 reference** | A.5.15–A.5.18, A.8.2, A.8.3, A.8.5, A.8.18 |
| **Version / status** | 0.1 / Draft |
| **Date** | 2026-09-30 |
| **Owner** | Chief Information Security Officer (CISO) |
| **Approver** | Chief Executive Officer (CEO) |
| **Review** | Annually, and on significant change |
| **Applies to** | All staff, contractors and third parties accessing Meridiaan or client systems |

## 1. Purpose
To ensure access to information and systems is granted only to authorised individuals, on a least-privilege, need-to-know basis, and is controlled, monitored and revoked appropriately. This is the primary control against Meridiaan's highest-impact risks: privileged-access compromise and cross-tenant exposure.

## 2. Scope
All Meridiaan and client systems, platforms, applications and tooling within the ISMS scope, and all identities (staff, contractor, service and administrative accounts).

## 3. Principles
- **Least privilege** — users receive the minimum access needed for their role.
- **Need to know** — access to information follows a genuine business need.
- **Segregation of duties** — no single person can perform and conceal a critical action unchecked (A.5.3).
- **Tenant separation** — access is scoped so no client can reach another client's information (R-04).
- **Accountability** — every action is attributable to an individual; shared accounts are avoided.

## 4. Identity and account management
- Identities are uniquely assigned and managed through their lifecycle (A.5.16).
- Access is granted through a formal, authorised request and approval process (A.5.18).
- Access is reviewed at least every six months, and on any role change, and revoked promptly on termination (A.5.11, A.6.5).
- Service and administrative accounts are inventoried, owned and reviewed like user accounts.

## 5. Authentication
- Multi-factor authentication (MFA) is mandatory for all remote access, all administrative access, and all access to client environments (A.8.5).
- Authentication secrets are protected, never shared, and managed through approved tooling (A.5.17).
- Password and secret standards follow current good practice; defaults are always changed.

## 6. Privileged access
Privileged access is Meridiaan's highest-impact control area (R-03, R-10) and is subject to stricter rules:
- Granted only where essential, and time-limited or just-in-time where feasible.
- Managed through privileged access management (PAM) tooling, with session logging (A.8.2, A.8.18).
- Separated from users' standard accounts; administrators use dedicated admin identities.
- Reviewed more frequently than standard access, and monitored for anomalous use (A.8.16).

## 7. Remote and third-party access
- Remote administration uses the controlled privileged-access path only (A.6.7).
- Supplier and third-party access is time-bound, least-privilege, logged, and governed by contract (A.5.19).

## 8. Monitoring and logging
Access and privileged actions are logged, retained and monitored to detect misuse or compromise (A.8.15, A.8.16), supporting incident response and client assurance.

## 9. Compliance
Non-compliance may result in withdrawal of access and disciplinary action (A.6.4). Compliance is monitored and evidenced for audit and client assurance (A.5.36).