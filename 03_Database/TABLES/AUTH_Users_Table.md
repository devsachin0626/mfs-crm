# AUTH - Users Table

## Table Name

users

---

## Purpose

Store login information of every employee.

---

| Column | Data Type | Required | Description |
|---------|-----------|----------|-------------|
| id | UUID | Yes | Primary Key |
| employee_id | VARCHAR(20) | Yes | Unique Employee ID |
| username | VARCHAR(100) | Yes | Login Username |
| password | VARCHAR(255) | Yes | Encrypted Password |
| role_id | UUID | Yes | Role Reference |
| employee_id_ref | UUID | Yes | Employee Reference |
| status | ENUM | Yes | Active / Inactive / Suspended |
| failed_attempt | INTEGER | Yes | Wrong Password Count |
| account_locked_until | TIMESTAMP | No | Lock Expiry Time |
| last_login | TIMESTAMP | No | Last Login Time |
| last_password_change | TIMESTAMP | No | Password Changed Date |
| created_at | TIMESTAMP | Yes | Created Date |
| updated_at | TIMESTAMP | Yes | Updated Date |

---

## Primary Key

id

---

## Unique Keys

employee_id

username

---

## Foreign Keys

role_id → roles.id

employee_id_ref → employees.id

---

## Status Values

ACTIVE

INACTIVE

SUSPENDED

RESIGNED

TERMINATED

---

## Business Rules

- Employee ID must be unique.
- Password will never be stored in plain text.
- Password must be encrypted using bcrypt.
- Account locks after 5 failed login attempts.
- HR/Admin can reset password.
- Employee must change temporary password on first login.

---

## Future Columns

Two Factor Authentication

Biometric Login

Device Token

Last IP Address

Browser

Operating System