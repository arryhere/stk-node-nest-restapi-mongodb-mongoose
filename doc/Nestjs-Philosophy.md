# Nestjs Philosophy

---

## 🧠 Intro

**_AppModule_** is the `root module`<br>
It Bootstraps the listed modules in the `imports`

Lets say there are **_HealthModule_**, **_AuthModule_** and **_UserModule_**

**_HealthModule_** has<br>
`controllers: [HealthController]`<br>
`providers: [HealthService]`

**_AuthModule_** has<br>
`controllers: [AuthController]`<br>
`providers: [AuthService]`

**_UserModule_** has<br>
`controllers: [UserController]`<br>
`providers: [UserService]`

**_HealthModule_**, **_AuthModule_** and **_UserModule_** is being imported in **_AppModule_**<br>
`imports: [HealthModule, AuthModule, UserModule]`

✅ `AuthController` and `AuthService` will work inside **_AuthModule_**.

✅ `UserController` and `UserService` will work inside **_UserModule_**.

❌ But `UserService` won’t be able to inject `AuthService` — even though both modules are in **_AppModule_** — because `Nest modules are isolated`.

✅ `Modules are encapsulated`, and `providers` must be explicitly shared via `exports` and `imports`

---

## 🧠 Visual Breakdown

**_AppModule_**<br>
├── **_AuthModule_** 👈 registers `AuthController` & `AuthService`<br>
│ └── **controllers: [AuthController]**<br>
│ └── **providers: [AuthService]**<br>
│ └── **imports: []**<br>
│ └── **exports: []** ❌ _nothing is exported outside_<br>
│<br>
├── **_UserModule_** 👈 needs `AuthService` but can't see it<br>
│ └── **controllers: [UserController]**<br>
│ └── **providers: [UserService]**<br>
│ └── **imports: []** ❌ _no access to AuthModule's providers_<br>
│<br>
├── **_HealthModule_**

---

## 🧠 @Global()

It registers the module once globally for the entire app.<br>
All `exported providers` from that module become available to all other modules without needing to re-import it.

You must import a `@Global() module` exactly once in `any module` — and it can be in `any module`, not just `AppModule`.

---

## 🧠 Why only providers are exported/imported?

**Modules** are dependency containers<br>
What they expose to other **modules** is not their **controllers**, but the `services (providers)` that encapsulate business logic or shared behavior

---
