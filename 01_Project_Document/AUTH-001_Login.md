# AUTH-001 - Login Module

## Module Information

Module ID: AUTH-001

Module Name: Login

Priority: High

Status: Design Phase

---

# Objective

Allow authorized employees to securely login into the MFS CRM using their Employee ID and Password.

---

# Users

- Owner
- Admin
- HR
- Accounts
- Team Leader
- Sales Executive

---

# Login Method

Employee ID + Password

Example:

Employee ID : MFS000021

Password : ********

---

# Business Rules

BR-001

Every employee must login using Employee ID.

---

BR-002

Employee ID is unique.

---

BR-003

Only Active employees can login.

---

BR-004

Inactive, Suspended, Resigned and Terminated employees cannot login.

---

BR-005

If password is incorrect 5 times, account will be locked for 30 minutes.

---

BR-006

Forgot Password is handled only by HR or Admin.

---

BR-007

After password reset, employee must change password on first login.

---

BR-008

Every login and logout will be stored in Login History.

---

# Login Screen

Fields

- Employee ID
- Password

Buttons

- Login

Link

- Forgot Password

---

# Validations

Employee ID Required

Password Required

Invalid Credentials

Account Locked

Inactive Employee

---

# Success Flow

Employee Login

↓

Dashboard

---

# Failed Flow

Invalid Password

↓

Error Message

↓

Retry

---

# Security

JWT Authentication

Refresh Token

Password Hashing

Role Based Access

Login History

Session Management

---

# Future Features

Two Factor Authentication

Biometric Login

Face Login

Google Authenticator