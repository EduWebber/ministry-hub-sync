---
trigger: always_on
alwaysApply: true
---
comand start is npm run dev:all     


Understood. What you want is a **clear, enforceable instruction** to the developer that the development server is **already running** and **must not be restarted** manually.

Here is a **clean, professional English formulation** suitable for your rules or onboarding documentation:

---

### Development Server Execution Policy

* The development environment is **already running**.
* The command `npm run dev:all` has been executed beforehand and **must not be run again**.
* **Do NOT** execute `npm run dev`, `npm run dev:all`, or any related startup command in the terminal.
* Restarting the server unnecessarily may:

  * Kill active ports (3000 / 8080)
  * Interrupt backend and frontend processes
  * Cause loss of application state

**Assumption for all development work:**
The backend (port 3000) and frontend (port 8080) are already up and operational.

If the server is not responding, **report the issue** instead of restarting it manually.

---

If you want this expressed more strictly (for example, as a **hard rule** in `DEVELOPMENT_RULES.en.md`), here is an alternative:

---

### ❗ Mandatory Rule – Do Not Start the Dev Server

The development server is started externally using:

```
npm run dev:all
```

This process is **persistent and already active**.

Developers **must not** start, restart, or re-run any dev command locally unless explicitly instructed to do so.

Violation of this rule may disrupt the shared development environment.

---

If you want, I can now:

* Integrate this directly into your existing **Development Rules document**
* Rewrite it in a **shorter / stricter / softer** tone
* Align it with CI, onboarding, or README standards

Just tell me where this rule should live.
