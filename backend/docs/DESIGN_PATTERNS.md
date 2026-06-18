# Design Patterns — Auth / Users slice

This document maps the object-oriented design patterns used in the
authentication and user-management code, where each lives, and why it was
chosen. The goal is a layered, testable auth flow instead of one fat controller.

## Request flow

```
route  ->  controller  ->  AuthService  ->  UserRepository  ->  Mongoose/User
                              |  \
                              |   `-> PasswordHashStrategy (compare/hash)
                              `-> AuthResponseFactory -> TokenService (Singleton)
```

The controller only speaks HTTP. Everything below it is plain, framework-free
JavaScript that can be unit-tested without Express or a live database.

---

## 1. Repository — `repositories/UserRepository.js`

Encapsulates all User persistence (`findByEmail`, `findById`,
`findByIdWithoutPassword`, `create`, `save`). Nothing outside this class talks to
the Mongoose `User` model directly.

**Why:** decouples business logic from the data store. If we swapped Mongoose for
another ORM, only this file changes. It also gives tests a single seam to stub.

## 2. Service Layer (with constructor Dependency Injection) — `services/AuthService.js`

Holds the auth rules: duplicate-email check on register, credential check on
login, profile read/update. Its collaborators (the repository and the hashing
strategy) are injected through the constructor and default to the real ones:

```js
constructor(repo = userRepository, hasher = new BcryptHashStrategy()) { ... }
```

**Why:** keeps controllers thin and makes the logic testable — a test can pass in
a fake repository and a fake hasher and assert behaviour with no DB or bcrypt.

## 3. Singleton — `services/TokenService.js`

Wraps JWT signing/verifying and is exported as a single shared instance.

**Why:** the controller and the auth middleware must agree on the secret and
expiry. Sharing one instance removes any chance of that config drifting apart.

## 4. Factory — `factories/AuthResponseFactory.js`

`AuthResponseFactory.build(user)` produces the `{ id, name, email, role, token, ... }`
payload returned by register, login and profile-update.

**Why:** that response shape was previously copy-pasted in three places. Building
it in one factory guarantees every endpoint returns the same structure with a
freshly generated token.

## 5. Strategy — `strategies/PasswordHashStrategy.js`

An abstract `PasswordHashStrategy` defines `hash()` / `compare()`;
`BcryptHashStrategy` is the concrete bcrypt implementation the service uses.

**Why:** the hashing algorithm becomes a pluggable dependency. Moving to argon2
later means writing one new strategy class — `AuthService` is untouched.

---

## Patterns already present (kept)

- **Active Record** — the Mongoose `User` model carries its own behaviour,
  notably the `pre('save')` hook that hashes passwords.
- **MVC** — routes / controllers / models separation across the backend.
