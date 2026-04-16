# Nestjs Philosophy

---

## 🧠 Intro

**_AppModule_** is the `root module`<br>
It Bootstraps the listed modules in the `imports`

Lets say there are **_HealthModule_**, **_AuthModule_**, **_UserModule_** and **_EmailLibModule_**

**_HealthModule_** has<br>
`imports: []`<br>
`controllers: [HealthController]`<br>
`providers: [HealthService]`<br>
`exports: []`

**_AuthModule_** has<br>
`imports: []`<br>
`controllers: [AuthController]`<br>
`providers: [AuthService]`<br>
`exports: []`

**_UserModule_** has<br>
`controllers: [UserController]`<br>
`providers: [UserService]`<br>
`exports: []`

> **_HealthModule_**, **_AuthModule_** and **_UserModule_** are `feature module`<br>
> _EmailLibModule_ is `shared module`<br>
> ✅ Feature Modules (go in AppModule)<br>
> ❌ Shared Modules (don’t go in AppModule)

**_HealthModule_**, **_AuthModule_** and **_UserModule_** is being imported in **_AppModule_**<br>
`imports: [HealthModule, AuthModule, UserModule]`

✅ `HealthController` and `HealthService` will work inside **_HealthModule_**.

✅ `AuthController` and `AuthService` will work inside **_AuthModule_**.

✅ `UserController` and `UserService` will work inside **_UserModule_**.

❌ But `UserService` won’t be able to use `AuthService` — even though both modules are in **_AppModule_** — because `Nest modules are isolated`.

✅ `Modules are encapsulated`, and `providers` must be explicitly shared via `exports` and `imports`

---

## 🧠 Visual Breakdown

> ❌ Without Export (Does NOT work)<br><br>
> **_AppModule_**<br>
> ├── **_AuthModule_** 👈 registers AuthController & AuthService<br>
> │ ├── imports: []<br>
> │ ├── controllers: [***AuthController***]<br>
> │ ├── providers: [***AuthService***]<br>
> │ └── exports: [] ❌ nothing is exported outside<br>
> │<br>
> ├── **_UserModule_** 👈 needs AuthService but can't see it<br>
> │ ├── imports: []<br>
> │ ├── controllers: [***UserController***]<br>
> │ ├── providers: [***UserService***]<br>
> │ └── exports: []<br>
> │<br>
> ├── **_HealthModule_**<br>

> ✅ With Export + Import (Works)<br><br>
> **_AppModule_**<br>
> ├── **_AuthModule_**<br>
> │ ├── imports: []<br>
> │ ├── controllers: [***AuthController***]<br>
> │ ├── providers: [***AuthService***]<br>
> │ └── exports: [***AuthService***] ✅ AuthService is exported<br>
> │<br>
> ├── **_UserModule_**<br>
> │ ├── imports: [***AuthModule***] ✅ AuthModule is imported<br>
> │ ├── controllers: [***UserController***]<br>
> │ ├── providers: [***UserService***]<br>
> │ └── exports: []<br>
> │<br>
> ├── **_HealthModule_**<br>

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
