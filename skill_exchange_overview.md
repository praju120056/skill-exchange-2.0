# Skill Exchange 2.0 — Interview Project Overview

> **"A peer-to-peer skill trading platform where you teach what you know and learn what you need."**

---

## 1. What Is This Project?

Skill Exchange 2.0 is a full-stack web application that lets users list the skills they can **teach** and the skills they want to **learn**, then uses a matching algorithm to surface other users who can teach exactly what you're trying to learn. Think of it like a barter system for knowledge.

A user signs up, marks `JavaScript` as a skill they can teach and `Guitar` as something they want to learn. The platform then finds people who teach Guitar (and, as a bonus, might want to learn JavaScript back from you). Users can then reach out directly via email.

---

## 2. High-Level Architecture

The project is a classic **monorepo** with two independently runnable workspaces:

```
skill-exchange-2.0/
├── client/    ← React + TypeScript SPA (Vite)
├── server/    ← Node.js + Express REST API
└── .github/
    └── workflows/
        └── deploy.yml   ← GitHub Actions CI/CD → Azure
```

**Why a monorepo?**  
Keeping client and server in one repo makes it easier to version them together, run a single CI/CD pipeline that builds both, and deploy the whole stack as one unit to Azure App Service. In production, the Express server itself **serves the compiled Vite build as static files**, so there's only one process to manage (see §6 for details).

---

## 3. Tech Stack Choices

### Backend

| Technology | Version | Why |
|---|---|---|
| **Node.js + Express** | Express `^4.18` | Minimal, unopinionated; gives full control over middleware ordering |
| **MongoDB + Mongoose** | Mongoose `^8.0` | Schema-flexible, great for rapid iteration; Mongoose adds validation and hooks |
| **JWT (jsonwebtoken)** | `^9.0` | Stateless auth — no session store needed |
| **bcryptjs** | `^2.4` | Secure password hashing with per-password salts |
| **Joi** | `^17.11` | Declarative request body validation before it ever touches the database |
| **express-rate-limit** | `^8.3` | Brute-force protection on all `/api/*` routes |
| **cookie-parser** | `^1.4` | Reads `HttpOnly` cookies set on login |
| **cors** | `^2.8` | Restricts cross-origin requests to the known client URL |
| **dotenv** | `^16.3` | Environment variable management |

### Frontend

| Technology | Version | Why |
|---|---|---|
| **React 18 + TypeScript** | React `^18.2`, TS `^5.2` | Type safety eliminates a whole class of runtime bugs; React 18 concurrent features are available |
| **Vite** | `^5.0` | Sub-second HMR; much faster than CRA |
| **Tailwind CSS** | `^3.4` | Utility-first; works well with a custom design system defined in `tailwind.config.js` |
| **Framer Motion** | `^10.18` | Production-grade animation library; used for page entries, card hovers, modals, and background blobs |
| **Axios** | `^1.6` | Promise-based HTTP client with interceptors for auth and global error handling |
| **React Router v6** | `^6.21` | Declarative nested routing; `<Navigate>` for protected route redirects |
| **react-hot-toast** | `^2.4` | Toast notifications — themed to match the glassmorphism design |
| **Zustand** | `^4.4` | Installed but auth state ended up in React Context (see §7) |
| **lucide-react** | `^0.303` | Consistent, tree-shakeable icon set |

---

## 4. Database Design

Three Mongoose models, forming a **many-to-many relationship** between users and skills via a join model.

### `User`
```
name, email (unique, lowercase), password (select: false), avatarUrl, createdAt
```
- **`select: false` on password** — Mongoose never returns the password field unless explicitly requested with `.select('+password')`. This is done only in the login controller.
- **Pre-save hooks** — Two `pre('save')` hooks: one hashes the password with bcrypt (salt rounds = 10), the other auto-generates an avatar URL from the `ui-avatars.com` API using the user's name.
- **Instance method `matchPassword`** — Encapsulates the `bcrypt.compare` logic on the model itself, keeping the controller clean.

### `Skill`
```
name (unique, lowercase), category (enum), createdAt
```
- Skills are **global, shared records** — not per-user. A skill like "JavaScript" exists once in the DB.
- `category` is an enum: `['Programming', 'Design', 'Marketing', 'Business', 'Music', 'Language', 'Writing', 'Fitness', 'Cooking', 'Photography', 'Video Editing', 'Other']`
- A **compound index on `{ name, category }`** speeds up filtered lookups.

### `UserSkill` (the join model)
```
userId (ref: User), skillId (ref: Skill), type ('teach' | 'learn'), proficiencyLevel ('beginner' | 'intermediate' | 'advanced' | 'expert'), createdAt
```
- **Unique compound index on `{ userId, skillId, type }`** — prevents a user from adding the same skill+type combination twice.
- Two additional indexes on `{ userId, type }` and `{ skillId, type }` — optimised for the two most common queries: "give me all skills for user X" and "find all teachers of skill Y".
- `proficiencyLevel` has a **dynamic default** using a `function()` context: teachers default to `'intermediate'`, learners default to `'beginner'`.

**Why this split design instead of embedding skills in the User document?**  
Embedding would make the matching query very hard — you'd need to `$unwind` nested arrays and cross-compare documents. Normalising into a join model allows the matching engine to run a clean aggregation pipeline entirely on `UserSkill`.

---

## 5. The Matching Algorithm

The core feature. Located in [`skillController.js → findMatches`](file:///d:/Code/projects/skill-exchange-2.0/server/src/controllers/skillController.js).

**Step-by-step:**

1. **Fetch the current user's "learn" skills**  
   ```js
   const skillsToLearn = await UserSkill.find({ userId, type: 'learn' }).select('skillId');
   const skillIds = skillsToLearn.map(skill => skill.skillId);
   ```

2. **Run a MongoDB aggregation pipeline on `UserSkill`**  
   ```js
   UserSkill.aggregate([
     { $match: { skillId: { $in: skillIds }, type: 'teach', userId: { $ne: userId } } },
     { $group: { _id: '$userId', matchedSkillIds: { $push: '$skillId' }, matchCount: { $sum: 1 } } },
     { $sort: { matchCount: -1 } },
     { $limit: 20 }
   ])
   ```
   This finds every user who teaches at least one skill the current user wants to learn, groups them by user ID, counts overlapping skills (the **match score**), sorts highest first, and caps at 20 results.

3. **Hydrate the results**  
   For each potential match, fetch their full user profile, all their teaching skills, all their learning skills, and the specific intersecting skills — packaged into a single response object.

**Why aggregation over application-level filtering?**  
Doing this in the database (rather than fetching all `UserSkill` records and filtering in JS) means MongoDB handles the heavy lifting and only the top 20 results travel over the wire. The existing indexes on `{ skillId, type }` make the `$match` stage very fast.

---

## 6. Server Architecture

[`server.js`](file:///d:/Code/projects/skill-exchange-2.0/server/src/server.js) is the single entry point. It wires everything in a deliberate order:

```
JSON body parser → URL-encoded parser → cookie parser
→ Rate limiter (100 req / 15 min per IP on /api/*)
→ CORS (only CLIENT_URL origin, with credentials)
→ API Routes (/api/auth, /api/skills)
→ Health check (/api/health)
→ [PRODUCTION ONLY] Static file serving of Vite dist + SPA fallback
→ Error handler (must be last)
```

**Key design decisions:**

- **Middleware ordering is intentional.** `cookieParser` must run before routes so `req.cookies.token` is available to the auth middleware. The error handler *must* be last — Express identifies a 4-argument function as an error handler.

- **Single-server deployment model.** In production (`NODE_ENV=production`), Express serves the compiled React app from `client/dist/`. Any route that doesn't match `/api/*` falls through to `index.html`, enabling client-side routing (React Router). This avoids needing a separate Nginx/CDN just for the frontend.

- **`type: "module"` (ESM)** — The server uses native ES modules (`import`/`export`). This requires `"type": "module"` in `package.json` and `.js` extensions on all relative imports. A consequence is that `__dirname` and `__filename` don't exist natively, so in the static-serving block they're reconstructed using `fileURLToPath(import.meta.url)`.

- **`asyncHandler` utility** — All controller functions are wrapped in a one-liner higher-order function:
  ```js
  const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
  ```
  This forwards any thrown error to the centralized error handler, eliminating repetitive `try/catch` blocks in every controller.

### Centralized Error Handler

[`errorHandler.js`](file:///d:/Code/projects/skill-exchange-2.0/server/src/middleware/errorHandler.js) catches errors from `next(err)` and normalises them:

| Error Type | Mongoose Code | HTTP Response |
|---|---|---|
| Bad ObjectId | `CastError` | 404 Resource not found |
| Duplicate key | `code 11000` | 400 `<field>` already exists |
| Validation failure | `ValidationError` | 400 with joined messages |
| Bad JWT | `JsonWebTokenError` | 401 Invalid token |
| Expired JWT | `TokenExpiredError` | 401 Token expired |
| Anything else | — | 500 Server Error |

In development mode, the stack trace is included in the response body.

---

## 7. Authentication Strategy

### Server side

- On register/login, a JWT is generated (`jsonwebtoken.sign`) with the user's `_id` as the payload, signed with `JWT_SECRET`, expiring in 7 days.
- The token is set in two places: as an **`HttpOnly`, `Secure`, `SameSite: lax` cookie** AND returned in the JSON response body (`{ token, user }`). The cookie prevents XSS from stealing the token; the JSON body allows the client to store it in `localStorage` for the `Authorization` header approach.
- **Why both?** The `auth` middleware checks cookies first, then falls back to the `Authorization: Bearer` header. This supports both browser clients (using cookies automatically) and potential future API clients.

### Client side

[`AuthContext.tsx`](file:///d:/Code/projects/skill-exchange-2.0/client/src/context/AuthContext.tsx) is the single source of truth for authentication state:

- `user: User | null` — the logged-in user object
- `isAuthenticated: boolean` — derived as `!!user`
- `loading: boolean` — `true` during the initial `checkAuth` call on mount

**On mount**, the context checks `localStorage` for a token and calls `GET /api/auth/me` to validate it server-side. If valid, the user is restored; if not (expired/tampered), the token is cleared and the user stays logged out.

**`ProtectedRoute` component** in [`App.tsx`](file:///d:/Code/projects/skill-exchange-2.0/client/src/App.tsx) — wraps private pages. While `loading` is `true` it shows a spinner; if not authenticated it redirects to `/login` via `<Navigate replace />`.

### API layer

[`api.ts`](file:///d:/Code/projects/skill-exchange-2.0/client/src/utils/api.ts) is a configured Axios instance with two interceptors:

1. **Request interceptor** — reads the token from `localStorage` and injects it as `Authorization: Bearer <token>` on every request.
2. **Response interceptor** — unwraps `response.data` (so callers get the payload directly, not the full Axios response); on a `401` it clears storage and hard-redirects to `/login`.

---

## 8. Frontend Architecture

### Routing

Five routes defined in `App.tsx`:

| Path | Component | Access |
|---|---|---|
| `/` | `LandingPage` (inline) | Public |
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/dashboard` | `Dashboard` | Protected |
| `/matches` | `Matches` | Protected |
| `/profile` | `Profile` | Protected |
| `*` | Redirect to `/` | — |

If a logged-in user visits `/`, a `useEffect` redirects them to `/dashboard`.

### Layout System

Two layout wrappers handle shared chrome:

- **`AuthLayout`** — Split-screen: left panel is a branded, animated glassmorphism panel with floating skill badges; right panel is the form card. Only visible on ≥ `lg` breakpoint.
- **`DashboardLayout`** — Top navigation bar (glassmorphism card, `m-4`) with logo, nav links, user avatar, and logout button. Wraps all authenticated pages.

### Component Hierarchy

```
App
├── AuthProvider (Context)
├── Router
│   ├── LandingPage → HeroSection + Feature Cards
│   ├── Login → AuthLayout → form
│   ├── Register → AuthLayout → form
│   ├── Dashboard → DashboardLayout → AnimatedCard + SkillBadge + Button
│   ├── Matches → DashboardLayout → MatchGrid → UserDetailsModal
│   └── Profile → DashboardLayout → AnimatedCard + SkillBadge
└── <Toaster /> (global toast portal)
```

### UI Component Design

All UI primitives live in `client/src/components/ui/` and are **Framer Motion-first**:

- **`Button`** — Extends `ButtonHTMLAttributes<HTMLButtonElement>`. Supports `variant` (`primary`, `secondary`, `outline`, `ghost`), `size`, `isLoading` (shows spinner), and optional `icon`. Uses `whileHover` / `whileTap` for micro-interaction physics. Variant styles are defined as a record object, not conditional chains.

- **`SkillBadge`** — Pill-shaped badge with `primary` (indigo), `secondary` (amber), or `success` (emerald) variants. Optionally renders an `X` button for removal. Animates in with `scale: 0.8 → 1` on mount, exits with `scale: 1 → 0.8`.

- **`AnimatedCard`** — Glassmorphism card wrapper (`glass-card` class). Slides up on mount. An `interactive` variant adds lift and scale on hover.

- **`HeroSection`** — Reusable hero with staggered child animations using Framer Motion `variants` + `staggerChildren`. Background animated blobs (large blurred circles) pulse via `scale` and `opacity` keyframe loops.

- **`MatchGrid`** — Renders a responsive grid of match cards. Shows skeleton loaders while `isLoading`. Clicking a card opens `UserDetailsModal`.

- **`UserDetailsModal`** — Animated modal using `AnimatePresence` + `motion.div` with a spring transition (`type: 'spring', damping: 25, stiffness: 300`). Displays the matched user's photo, email (with copy-to-clipboard), matched skills, all teaching skills, and all learning skills. Action buttons: "Copy Email" and "Send Email" (opens `mailto:`).

### Design System

Defined in `tailwind.config.js` and `index.css`:

- **Color palette**: Indigo (primary / "teach" actions) and Amber/Orange (secondary / "learn" actions) on a Slate dark background.
- **Glassmorphism**: `.glass-card` — `bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl`. Semi-transparent with backdrop blur — achieves depth without heavy visual noise.
- **Gradient text**: `.gradient-text` — Indigo → Blue → Amber gradient, animated with an 8-second `background-position` shift.
- **Custom animations**: `float`, `glow`, `gradient-shift`, `shimmer` — defined as Tailwind `keyframes` and `animation` extensions.
- **Skeleton loaders**: `.skeleton` class applies a shimmer gradient animation to placeholder elements during data fetching.
- **Font**: `Inter` (Google Fonts), loaded via CSS `font-family` on `body`.

### Custom Hook

[`useDebounce.ts`](file:///d:/Code/projects/skill-exchange-2.0/client/src/hooks/useDebounce.ts) — Generic `useDebounce<T>(value, delay = 500)`. Uses `setTimeout` + cleanup via the `useEffect` return. Defined for reuse but currently used implicitly in the skill search input on the Dashboard.

---

## 9. API Endpoints Reference

### Auth routes (`/api/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Validates with Joi, creates user, returns JWT + sets cookie |
| `POST` | `/login` | Public | Validates credentials, returns JWT + sets cookie |
| `GET` | `/me` | Protected | Returns currently authenticated user |
| `POST` | `/logout` | Protected | Overwrites cookie with expired value |

### Skills routes (`/api/skills`)

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | List all skills (supports `?category=&search=`) |
| `POST` | `/` | Protected | Create a new global skill |
| `GET` | `/user/:userId` | Public | Get a user's skills (supports `?type=teach\|learn`) |
| `POST` | `/user` | Protected | Add a skill to the logged-in user |
| `DELETE` | `/user/:userSkillId` | Protected | Remove a skill (ownership check enforced) |
| `GET` | `/matches` | Protected | Run the matching algorithm for the logged-in user |

**Ownership check on DELETE:** The controller fetches the `UserSkill` document and compares `userSkill.userId.toString()` against `req.user.id`. If they don't match, it returns `403 Forbidden` — preventing users from deleting each other's skills.

---

## 10. CI/CD Pipeline — GitHub Actions → Azure

File: [`.github/workflows/deploy.yml`](file:///d:/Code/projects/skill-exchange-2.0/.github/workflows/deploy.yml)

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install server dependencies
        run: npm install
        working-directory: ./server

      - name: Build client
        run: npm install && npm run build
        working-directory: ./client

      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ secrets.AZURE_APP_NAME }}
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
          package: .
```

### How It Works — Step by Step

**Trigger:**  
Any `git push` to the `main` branch fires the workflow. This enforces a "merge to main = deploy" contract.

**Runner:**  
`ubuntu-latest` — a fresh Linux VM hosted by GitHub. Cost-effective and matches the Linux environment of Azure App Service.

**Step 1 — Checkout (`actions/checkout@v4`):**  
Clones the repository into the runner's workspace with full git history. `@v4` is the current major version of the action.

**Step 2 — Node.js setup (`actions/setup-node@v4`, version `20`):**  
Installs Node.js LTS 20. This matches the minimum required version (Node.js ≥ 18, as stated in the README). Using a pinned major version (`20`) instead of `latest` prevents unexpected breakage from future Node.js updates.

**Step 3 — Install server dependencies:**  
Runs `npm install` in `./server`. This produces `server/node_modules/`. The server uses `"start": "node src/server.js"` — no build step is needed since it's plain JavaScript (no transpilation).

**Step 4 — Build client (`npm install && npm run build`):**  
Two commands chained:
1. `npm install` — installs all client devDependencies including TypeScript and Vite.
2. `npm run build` — runs `tsc && vite build`. TypeScript is compiled first (type-checking), then Vite bundles and tree-shakes everything into `client/dist/`. The `dist/` directory contains the production-ready static assets that Express will serve.

**Step 5 — Deploy to Azure (`azure/webapps-deploy@v3`):**  
Uses Microsoft's official GitHub Action. It reads two GitHub **Secrets**:
- `AZURE_APP_NAME` — the name of the Azure App Service instance (e.g. `skill-exchange-prod`).
- `AZURE_PUBLISH_PROFILE` — an XML credential file downloaded from the Azure portal that authorises deployment without hardcoding passwords.

`package: .` tells the action to zip and upload the **entire repository root** (including both `client/dist` and `server/`) to Azure App Service. Azure then runs `npm start` in the `server/` directory (based on the App Service startup command configuration), which boots Express. Express detects `NODE_ENV=production`, serves the React app from `client/dist`, and handles all API calls.

### Why This Design?

| Decision | Rationale |
|---|---|
| Single workflow file | One place to understand the entire deploy process |
| Secrets for credentials | Credentials never appear in source code; GitHub encrypts them at rest |
| Build in CI | Guarantees the build works on a clean machine, not just "works on my machine" |
| `package: .` (whole repo) | Simplest approach for a monorepo with server-side static serving — no need for separate artifact uploads |
| `azure/webapps-deploy@v3` | Microsoft-maintained action; handles zipping, uploading, and restarting the App Service |

### What's Missing (Honest Assessment)

- **No test step** — There are no automated tests in the codebase. A real production pipeline would run `npm test` before deploying.
- **No staging environment** — Deploys go straight to production. Adding a `push: branches: [staging]` job targeting a staging slot would allow pre-production validation.
- **No cache** — `actions/setup-node` can cache `node_modules` between runs using `cache: 'npm'`. Adding this would significantly speed up the pipeline.

---

## 11. Security Measures

| Concern | Mechanism |
|---|---|
| Password storage | `bcryptjs` with salt factor 10 — one-way, rainbow-table-resistant |
| Token confidentiality | JWT in `HttpOnly` cookie — inaccessible to JavaScript, mitigates XSS |
| Token transport | `Secure: true` in production — only sent over HTTPS |
| CSRF mitigation | `SameSite: lax` — blocks cross-site POST requests from carrying the cookie |
| Brute force | `express-rate-limit` — 100 requests per 15 minutes per IP across all `/api` routes |
| Input validation | Joi schemas on every write endpoint — rejects malformed data before hitting the DB |
| Unauthorised writes | Ownership check on DELETE; `protect` middleware on all write routes |
| Sensitive field exposure | `password` field has `select: false` — never returned in queries by default |
| MongoDB injection | Mongoose parameterised queries + ObjectId validation — raw strings never interpolated into queries |

---

## 12. Seeding

The server root contains two seed scripts:

- **`seed.js`** — Populates the `Skill` collection with a predefined set of skills across all categories. Run with `npm run seed`.
- **`seedSampleUsers.js`** — Creates sample users with randomly assigned teach/learn skills. Run with `npm run seedUsers`.

These exist because the matching algorithm is useless without existing data. In a demo or interview setting, seeding first creates a realistic environment to showcase the feature.

---

## 13. Summary — What Makes This Project Stand Out

1. **The matching engine** is the central, non-trivial feature — it uses a MongoDB aggregation pipeline, not naive JS loops, and ranks results by a computed match score.

2. **Single-server production model** — Express doubles as a static file server in production, keeping the deployment surface small and cheap to run on Azure App Service.

3. **Layered auth strategy** — Dual token delivery (cookie + JSON) with a request interceptor that automatically attaches the token and globally handles 401 expiry.

4. **Glassmorphism UI** — Fully custom design system in `tailwind.config.js` with 10+ named animations, neon box shadows, and Framer Motion physics on every interactive element.

5. **Automated CI/CD** — A push to `main` triggers a full build-and-deploy pipeline to Azure with zero manual steps, demonstrating production-readiness thinking.
