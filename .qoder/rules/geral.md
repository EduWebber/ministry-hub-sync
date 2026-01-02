---
trigger: always_on
alwaysApply: true
---

# 🧩 Development Rules – Simplified Ministerial System

This document defines **mandatory rules** for the development, maintenance, and evolution of the **Simplified Ministerial System**.

Any developer working on this project **must strictly follow these rules**.

Main objectives:

- Ensure **stability**, **maintainability**, and **consistency**
- Avoid **logic duplication**, **mock data**, and **inconsistent flows**
- Respect the ministerial domain and **S-38 rules**
- Ensure correct use of **Supabase**, **real PDFs**, **persistent data**, and **offline mode**
- Keep the system **production-ready**

---

## 1. Core Principles

### 1.1 No duplication
- Do not create components, services, or algorithms that perform the same function.
- If something already exists:
  - Reuse it, or
  - Refactor it centrally.

### 1.2 Real data–driven system
- Introducing new mocks is **forbidden** if the data exists in Supabase.
- Mock mode is allowed only when explicitly enabled via `VITE_MOCK_MODE=true`.

### 1.3 S-38 rules are the contract
- All assignment logic **must comply with S-38 rules**.
- No assignment may be generated outside the official algorithm.
- Any rule adjustment requires:
  - A centralized algorithm update
  - Clear documentation in the codebase

### 1.4 Domain clarity
- Code must clearly reflect the ministerial domain:
  - Students
  - Instructors
  - Assignments
  - Programs
  - Qualifications
- Avoid generic or overly technical names without functional meaning.

---

## 2. Frontend Rules

### 2.1 Stack and Structure
- React + TypeScript
- Organized architecture:

```text
/src
  /pages
  /components
  /hooks
  /contexts
  /services
  /utils
````

### 2.2 Components

* Components must be:

  * Reusable
  * Deterministic
  * Free of heavy business logic
* Business logic belongs in:

  * hooks
  * services

### 2.3 Mandatory core flows

The frontend **must fully support**:

1. Instructor Dashboard
2. Student Portal
3. PDF upload and processing
4. Assignment generation and visualization
5. Reports and metrics
6. Offline mode with clear visual fallback

### 2.4 UX Rules

* Clear, predictable interface
* No surprise navigation
* State preserved when navigating
* Visual feedback for:

  * loading
  * errors
  * offline mode

---

## 3. Backend Rules

### 3.1 Backend responsibilities

The backend **is mandatory** for:

1. Processing real PDFs
2. Applying S-38 rules
3. Generating assignments
4. Persisting data in Supabase
5. Sending notifications
6. Serving reliable data to the frontend

### 3.2 APIs

* Every endpoint must:

  * Validate input
  * Validate permissions
  * Return clear error messages
* Never trust the frontend alone.

### 3.3 Assignment algorithm

* There must be **one single central service** responsible for:

```ts
generateDesignations(program, students, rules)
```

* Duplicating this logic in:

  * controllers
  * components
  * isolated scripts
    is strictly forbidden.

---

## 4. PDFs and Content Processing

### 4.1 Watchtower PDFs

* The system must process **real PDFs**
* Extraction must generate:

  * Weekly structure
  * Parts
  * Duration
  * Activity type

### 4.2 No manual content

* Programs must not be typed manually.
* PDFs are the official source of truth.

---

## 5. Notifications

### 5.1 Channels

* Email
* WhatsApp (when enabled)

### 5.2 Rules

* Credentials via `.env`
* Do not log personal data
* Messages must be clear and concise

---

## 6. Qualification System

* Qualifications must be:

  * Persistent
  * Progressive
  * Auditable
* Typical states:

  * Beginner
  * In Development
  * Qualified
  * Advanced

No qualification may be inferred only on the frontend.

---

## 7. Offline Mode

### 7.1 Mandatory

* Local cache (IndexedDB / Service Worker)
* Offline reading enabled
* Writes must synchronize once online

### 7.2 Offline UX

* Clearly indicate when the system is offline
* Never pretend the system is online

---

## 8. Code Quality

### 8.1 Typing

* Strict TypeScript
* `any` only with clear justification

### 8.2 Clean code

* Small functions
* Single responsibility
* No obvious comments
* No dead code

---

## 9. Security and Data

* No secrets in the codebase
* `.env` files must never be committed
* Follow GDPR/LGPD principles
* Data deletion/anonymization must be possible

---

## 10. Git and Workflow

### 10.1 Branches

* `feature/*`
* `fix/*`
* `chore/*`

### 10.2 Commits

* Describe **what** changed and **why**
* Do not mix unrelated changes

---

## 11. “Done” Checklist

Before any merge:

* [ ] System works with real data
* [ ] PDFs are processed correctly
* [ ] Assignments comply with S-38 rules
* [ ] Supabase integration has no errors
* [ ] Frontend works online and offline
* [ ] No mock mode enabled in production
* [ ] Code is clean and fully typed
* [ ] Build passes without errors

If any item is **NO**, the merge is forbidden.

---

## Conclusion

By following these rules, the **Simplified Ministerial System** remains:

* Stable
* Reliable
* Scalable
* Aligned with organizational rules
* Ready for real-world use in congregations

