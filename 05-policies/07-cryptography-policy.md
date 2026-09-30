# 07 Cryptography Policy

> **Fictional content.** Meridiaan ICT Services BV, its clients, people, figures and sites are invented for this portfolio project. Any resemblance to a real organisation is unintended.

| | |
| --- | --- |
| **Document** | Cryptography Policy |
| **ISO/IEC 27001 reference** | A.8.24 |
| **Regulatory drivers** | NIS2 Art. 21(2)(h) cryptography and encryption |
| **Version / status** | 0.1 / Draft |
| **Date** | 2026-09-30 |
| **Owner** | Chief Information Security Officer (CISO) |
| **Approver** | Chief Executive Officer (CEO) |
| **Review** | Annually, and on significant change |
| **Applies to** | All Meridiaan and client data and systems within the ISMS scope |

## 1. Purpose
To ensure cryptography is used consistently and effectively to protect the confidentiality and integrity of information, in line with good practice and NIS2's expectation on encryption.

## 2. Scope
Data in transit and at rest across Meridiaan's services, corporate systems and backups, and the keys that protect it.

## 3. Policy statements
- Data in transit over untrusted networks is encrypted using current, approved protocols.
- Sensitive data at rest, including backups and portable media, is encrypted (A.8.13, A.7.10).
- Only current, industry-accepted algorithms and key lengths are used; deprecated ones are retired.
- Cryptographic keys are generated, stored, rotated and revoked through a defined key-management process, with access strictly limited.
- Use of cryptography respects applicable legal and client contractual requirements.

## 4. Key management
Keys are treated as high-value assets: access is least-privilege and logged, and loss or compromise is handled as a security incident.

## 5. Compliance
Compliance is monitored and evidenced; exceptions require CISO approval and a recorded risk decision (A.5.36).