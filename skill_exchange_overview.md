# Skill Exchange 2.0 — Interview Project Overview

> **"A peer-to-peer skill trading platform where you teach what you know, learn what you need, chat in real-time, and get AI-powered learning guidance."**

---

## 1. What Is This Project?

Skill Exchange 2.0 is a full-stack web application that lets users list the skills they can **teach** and the skills they want to **learn**, then uses a MongoDB aggregation pipeline matching algorithm to surface other users who can teach exactly what you're trying to learn. Think of it like a barter system for knowledge.

A user signs up (via email/password or Google OAuth), marks `JavaScript` as a skill they can teach and `Guitar` as something they want to learn. The platform finds people who teach Guitar and might want to learn JavaScript in return. Users can send connection requests, engage in **real-time direct messaging (powered by Socket.IO)**, and consult an **AI Skill Assistant (powered by Google Gemini API)** for tailored learning roadmaps and mentorship.

---

## 2. High-Level Architecture

The project is a classic **monorepo** with two independently runnable workspaces:

```
skill-exchange-2.0/
├── client/    ← React + TypeScript SPA (Vite, Socket.IO Client, Framer Motion)
├── server/    ← Node.js + Express REST API + Socket.IO WebSockets + Google Gemini AI Service
└── .github/
    └── workflows/
        └── deploy.yml   ← GitHub Actions CI/CD → Azure App Service
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
| **Socket.IO** | `^4.8` | Real-time bidirectional event-driven communication for live chat & typing indicators |
| **Google Generative AI** | `^0.24` | Integrates Google Gemini API for instant AI mentorship and skill roadmaps |
| **JWT (jsonwebtoken)** | `^9.0` | Stateless auth — supported via HttpOnly cookies and Bearer headers |
| **Google Auth Library** | `^10.9` | Verifies Google ID tokens for seamless 1-click Google OAuth sign-in |
| **bcryptjs** | `^2.4` | Secure password hashing with per-password salts |
| **Joi** | `^17.11` | Declarative request body validation before database operations |
| **express-rate-limit** | `^8.3` | Brute-force protection on all `/api/*` routes |
| **cookie-parser** | `^1.4` | Reads `HttpOnly` cookies set on login |
| **Nodemailer / Resend** | `^9.0` / `^6.17` | Transactional email delivery for password reset tokens |
| **cors** | `^2.8` | Restricts cross-origin requests to the known client URL |

### Frontend

| Technology | Version | Why |
|---|---|---|
| **React 18 + TypeScript** | React `^18.2`, TS `^5.2` | Type safety eliminates runtime bugs; React 18 concurrent features are leveraged |
| **Vite** | `^5.4` | Sub-second HMR and fast production bundle builds |
| **Socket.IO Client** | `^4.8` | Manages persistent WebSocket connection with auto-reconnect and state synchronization |
| **Google OAuth** | `^0.13` (`@react-oauth/google`) | Modern Google Identity Services OAuth authentication |
| **Tailwind CSS** | `^3.4` | Utility-first; powers custom glassmorphism design system in `tailwind.config.js` |
| **Framer Motion** | `^10.18` | Production-grade animation library for page transitions, card hovers, and modals |
| **React Markdown** | `^10.1` | Renders rich markdown formatting and syntax highlighting for AI Mentor responses |
| **Axios** | `^1.6` | Promise-based HTTP client with interceptors for auth and global error handling |
| **React Router v6** | `^6.30` | Declarative nested routing; `<Navigate>` for protected route redirects |
| **react-hot-toast** | `^2.4` | Toast notifications — themed to match the glassmorphism design |
| **lucide-react** | `^0.303` | Consistent, tree-shakeable icon set |

---

## 4. Database Design

Six Mongoose models forming normalized relationships for user management, skill trading, connection requests, and real-time messaging.

### `User`
```
name, email (unique, lowercase), password (select: false), avatarUrl, googleId, resetPasswordToken, resetPasswordExpire, createdAt
```
- **`select: false` on password** — Mongoose never returns the password field unless explicitly requested with `.select('+password')`.
- **Pre-save hooks** — Hashes passwords with bcrypt (salt rounds = 10) and auto-generates fallback avatar URLs via `ui-avatars.com`.
- **Instance method `matchPassword`** — Encapsulates `bcrypt.compare` logic on the model.

### `Skill`
```
name (unique, lowercase), category (enum), createdAt
```
- Skills are global, shared records across categories: `['Programming', 'Design', 'Marketing', 'Business', 'Music', 'Language', 'Writing', 'Fitness', 'Cooking', 'Photography', 'Video Editing', 'Other']`.
- Compound index on `{ name: 1, category: 1 }`.

### `UserSkill` (the join model)
```
userId (ref: User), skillId (ref: Skill), type ('teach' | 'learn'), proficiencyLevel ('beginner' | 'intermediate' | 'advanced' | 'expert'), createdAt
```
- Unique compound index on `{ userId, skillId, type }` prevents duplicate skill assignments.
- Indexed on `{ userId, type }` and `{ skillId, type }` for rapid matching lookups.

### `Connection`
```
requester (ref: User), recipient (ref: User), status ('pending' | 'accepted' | 'declined'), createdAt
```
- Manages peer-to-peer connection requests.
- Unique compound index on `{ requester, recipient }` prevents duplicate requests.
- Indexed on `{ recipient, status }` and `{ requester, status }`.

### `Conversation`
```
participants: [ref: User], createdAt
```
- Represents a 1-on-1 direct chat channel between two connected users.
- Indexed on `{ participants: 1 }`.

### `Message`
```
conversationId (ref: Conversation), sender (ref: User), text (String), read (Boolean), edited (Boolean), timestamp (Date)
```
- Stores individual chat messages.
- Indexed on `{ conversationId: 1, timestamp: 1 }` for fast message history retrieval and `{ conversationId: 1, read: 1 }` for unread message counts.

---

## 5. The Matching Algorithm

Located in [`skillController.js → findMatches`](file:///d:/Code/projects/skill-exchange-2.0/server/src/controllers/skillController.js).

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
   For each potential match, fetch their full user profile, connection status, all their teaching skills, and learning skills — packaged into a single response object.

---

## 6. Server & Real-Time Socket Architecture

[`server.js`](file:///d:/Code/projects/skill-exchange-2.0/server/src/server.js) initializes the HTTP server and attaches Socket.IO via `initSocket(server)`.

### Middleware Stack
```
JSON body parser → URL-encoded parser → cookie parser
→ Rate limiter (100 req / 15 min per IP on /api/*)
→ CORS (only CLIENT_URL origin, with credentials)
→ API Routes (/api/auth, /api/skills, /api/connections, /api/chat, /api/ai)
→ Health check (/api/health)
→ [PRODUCTION ONLY] Static file serving of Vite dist + SPA fallback
→ Error handler (must be last)
```

### Real-Time WebSockets (`socketHandler.js`)
- Authenticates socket connections using JWT tokens.
- Users join private socket rooms identified by their user ID (`socket.join(userId)`).
- **Live Messaging Events**: Broadcasts `new_message` events in real-time to active conversation participants.
- **Typing Indicators**: Emits `typing` and `stop_typing` status to peer chat windows.
- **Connection Status**: Signals user online/offline updates.

---

## 7. AI Skill Assistant Architecture

Located in [`geminiService.js`](file:///d:/Code/projects/skill-exchange-2.0/server/src/services/geminiService.js) & [`aiController.js`](file:///d:/Code/projects/skill-exchange-2.0/server/src/controllers/aiController.js).

- Powered by Google Gemini API (`@google/generative-ai`).
- Accepts a `skillName` context and a user `question`.
- Constructs a structured system prompt instructing Gemini to output actionable, step-by-step learning roadmaps with code examples and project ideas formatted in GitHub Flavored Markdown.
- Rendered on the frontend via `AIMentorModal` using `react-markdown` with customized syntax highlighting and copy-to-clipboard functionality.

---

## 8. Authentication & OAuth Strategy

- **Dual Token Delivery**: Returns JWT signed token in response payload AND sets an `HttpOnly`, `Secure`, `SameSite: lax` cookie.
- **Google OAuth 2.0**: Integrates `@react-oauth/google` on the client and `google-auth-library` on the server to verify Google tokens, creating or retrieving existing accounts automatically.
- **Password Reset Flow**: `POST /api/auth/forgot-password` generates a crypto random token with a 10-minute expiration and emails it via Nodemailer/Resend; `POST /api/auth/reset-password` verifies and updates the password hash.

---

## 9. Frontend Architecture

### Routing (`App.tsx`)

| Path | Component | Access |
|---|---|---|
| `/` | `LandingPage` (inline) | Public |
| `/login` | `Login` | Public |
| `/register` | `Register` | Public |
| `/forgot-password` | `ForgotPassword` | Public |
| `/dashboard` | `Dashboard` | Protected |
| `/matches` | `Matches` | Protected |
| `/messages` | `Messages` | Protected |
| `/profile` | `Profile` | Protected |

### Component Hierarchy

```
App
├── AuthProvider (Context)
├── Router
│   ├── LandingPage → HeroSection + Feature Cards
│   ├── Login / Register / ForgotPassword → AuthLayout
│   ├── Dashboard → DashboardLayout → AnimatedCard + SkillBadge + AIMentorModal
│   ├── Matches → DashboardLayout → MatchGrid → UserDetailsModal
│   ├── Messages → DashboardLayout → ConversationList + ConnectionRequests + ChatWindow
│   └── Profile → DashboardLayout → User Profile Editor
└── <Toaster /> (global toast portal)
```

---

## 10. API Endpoints Reference

### Auth routes (`/api/auth`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/register` | Public | Validates with Joi, creates user |
| `POST` | `/login` | Public | Validates credentials, returns JWT + sets cookie |
| `POST` | `/google` | Public | Google OAuth ID token login / registration |
| `POST` | `/forgot-password` | Public | Generates reset token & sends email |
| `POST` | `/reset-password` | Public | Resets password with valid token |
| `GET` | `/me` | Protected | Returns authenticated user profile |
| `POST` | `/logout` | Protected | Clears authentication cookie |

### Skills routes (`/api/skills`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/` | Public | List all skills (supports `?category=&search=`) |
| `POST` | `/` | Protected | Create a new global skill |
| `GET` | `/user/:userId` | Public | Get user's skills |
| `POST` | `/user` | Protected | Add a skill to logged-in user |
| `DELETE` | `/user/:userSkillId` | Protected | Remove a skill |
| `GET` | `/matches` | Protected | Run matching aggregation pipeline |

### Connection & Chat routes (`/api/connections` & `/api/chat`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/connections` | Protected | Get connections and pending requests |
| `POST` | `/api/connections/request` | Protected | Send connection request to another user |
| `PUT` | `/api/connections/:id` | Protected | Accept or decline connection request |
| `GET` | `/api/chat/conversations` | Protected | List user conversations with unread counts |
| `GET` | `/api/chat/messages/:conversationId` | Protected | Retrieve message history |

### AI routes (`/api/ai`)
| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/mentor` | Protected | Query Google Gemini API for skill roadmap & advice |

---

## 11. CI/CD Pipeline — GitHub Actions → Azure

File: [`.github/workflows/deploy.yml`](file:///d:/Code/projects/skill-exchange-2.0/.github/workflows/deploy.yml)

Automates build and deployment to Azure App Service upon every `git push` to `main`.
1. Checkouts code (`actions/checkout@v4`).
2. Configures Node.js 20 runtime (`actions/setup-node@v4`).
3. Installs backend dependencies (`server/package.json`).
4. Compiles client static bundle (`tsc && vite build` in `client/`).
5. Deploys the combined repository artifact to Azure Web App via `azure/webapps-deploy@v3`.

---

## 12. Security Measures

| Concern | Mechanism |
|---|---|
| Password storage | `bcryptjs` with salt factor 10 |
| Token confidentiality | JWT in `HttpOnly` cookie |
| Token transport | `Secure: true` in production |
| OAuth security | Google ID Token verification via official `google-auth-library` |
| Brute force | `express-rate-limit` (100 requests / 15 min per IP) |
| Input validation | Joi schemas on write endpoints |
| Authorization | Ownership check on DELETE/PUT; `protect` middleware on private routes |
| DB Injection | Mongoose parameterized queries |

---

## 13. Summary — What Makes This Project Stand Out

1. **Smart Matching Engine**: Powered by a multi-stage MongoDB aggregation pipeline calculating match scores based on overlapping teach/learn skills.
2. **Real-Time Communications**: Full Socket.IO integration supporting instant messaging, connection requests, and live typing indicators.
3. **AI Skill Mentorship**: Integrates Google Gemini API directly into the user workflow to provide customized learning guidance and roadmaps.
4. **Production-Grade Architecture**: Monorepo with Express serving static Vite builds, Google OAuth support, password reset workflows, and automated Azure CI/CD.
