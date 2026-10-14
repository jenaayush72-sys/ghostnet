# ⚖️ GhostNet — The AI Courtroom

> **"Don't Trust the Answer. Put It on Trial."**  
> *Core Principle: Evidence must take priority over agent agreement.*

GhostNet is an interactive, multi-agent AI verification platform that transforms hallucination detection into an AI courtroom. Rather than accepting black-box AI outputs or relying on unverified agent consensus, GhostNet empanels an adversarial courtroom where specialized autonomous agents challenge claims, interrogate assumptions, harvest normative evidence, cross-examine premises, and issue binding explainable verdicts.

---

## 🏛️ Courtroom Architecture & Agents

```
                        ┌───────────────────────────────────────┐
                        │          User Claim / Indictment      │
                        └───────────────────┬───────────────────┘
                                            │
                                  [Stage 1: Empanelling]
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
       ┌───────────────────────────┐                 ┌───────────────────────────┐
       │   Agent 1: Ghost Agent    │                 │  Agent 4: Evidence Agent  │
       │  (Adversarial Inversion)  │                 │ (Primary Source Harvester)│
       └─────────────┬─────────────┘                 └─────────────┬─────────────┘
                     │                                             │
                     ▼                                             │
       ┌───────────────────────────┐                               │
       │ Agent 2: Prosecutor Agent │                               │
       │  (Fallacies & Objections) │                               │
       └─────────────┬─────────────┘                               │
                     │                                             │
                     ▼                                             │
       ┌───────────────────────────┐                               │
       │  Agent 3: Defense Agent   │                               │
       │   (Nuance & Boundaries)   │                               │
       └─────────────┬─────────────┘                               │
                     │                                             │
                     └──────────────────────┬──────────────────────┘
                                            │
                                            ▼
                             ┌─────────────────────────────┐
                             │ Agent 5: Fact-Checker Agent │
                             │   (Independent Excerpt Audit)│
                             └──────────────┬──────────────┘
                                            │
                                            ▼
                             ┌─────────────────────────────┐
                             │    Agent 6: Judge Agent     │
                             │   (Supreme Binding Ruling)  │
                             └──────────────┬──────────────┘
                                            │
                                            ▼
                             ┌─────────────────────────────┐
                             │       Binding Verdict       │
                             │ TRUE | FALSE | PARTIAL TRUE │
                             │ MISLEADING | INSUFFICIENT   │
                             └─────────────────────────────┘
```

### The Six Courtroom Agents

1. **Ghost Agent (Adversarial Flaw Injector)**  
   Constructs a plausible, subtly flawed counter-argument or inverted assumption specifically designed to stress-test the claim. Explicitly labeled as:  
   `ADVERSARIAL TEST ARGUMENT — NOT VERIFIED FACT`.
2. **Prosecutor Agent (Inaccuracy & Fallacy Prosecutor)**  
   Interrogates the adversarial argument and primary claim, filing formal objections against unsupported generalizations, circular logic, and missing empirical corroboration.
3. **Defense Agent (Contextual Nuance Defense)**  
   Tests prosecutorial objections, introduces legitimate edge conditions, and establishes boundary parameters under which claims are factually valid.
4. **Evidence Agent (Primary Source Harvester)**  
   Breaks down claims into atomic factual queries, retrieving verifiable documentation from Wikipedia, official specifications (e.g., MDN, WHATWG), or primary sources. Never fabricates citations.
5. **Fact-Checker Agent (Independent Evidence Auditor)**  
   Audits claim assertions against actual retrieved excerpts to prevent majority hallucinations and eliminate unsupported conclusions.
6. **Judge Agent (Supreme Judicial Adjudicator)**  
   Synthesizes the entire evidentiary record. Applies deterministic verdict integrity rules (e.g., stripping unindexed evidence IDs and overriding to `INSUFFICIENT EVIDENCE` if no verified documentation exists).

---

## 🛠️ Technology Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, Lucide React, React Router v7.
- **Backend:** Node.js, Express.js (ES Modules), Mongoose, Zod, Helmet, Express Rate Limit, Server-Sent Events (SSE).
- **Database:** MongoDB (Local or MongoDB Atlas) with automatic graceful in-memory storage fallback.
- **AI Engine:** Configurable open-weight models via Ollama (`llama3.2`, `mistral`, `deepseek-r1`), hosted OpenAI-compatible inference APIs, or local offline reasoning engine.
- **Evidence Harvester:** Wikipedia API, DuckDuckGo Instant Knowledge Graph, Tavily Search, and primary documentation indexes.
- **Testing:** Vitest and Supertest (13 unit & integration tests covering health, Zod validation, orchestrator, and deterministic rules).

---

## 🚀 Quickstart & Installation

### 1. Prerequisites
- Node.js v18+ (tested on Node.js v24)
- npm v9+

### 2. Install Dependencies
Run the install command from the root workspace:
```bash
npm run install:all
```
*(Or manually run `npm install` in the root, `client/`, and `server/` directories).*

### 3. Start the Full Application
To run both backend (port 5000) and frontend (port 5173) concurrently:
```bash
npm run dev
```

Alternatively, run each service independently:
```bash
# Terminal 1: Backend
npm run dev:server

# Terminal 2: Frontend
npm run dev:client
```

Open your browser at:
```
http://localhost:5173
```

---

## ⚙️ Environment Variables

### Backend Configuration (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ghostnet
CLIENT_URL=http://localhost:5173

# AI Provider Configuration ('mock', 'ollama', or 'openai_compatible')
AI_PROVIDER=mock
AI_BASE_URL=http://localhost:11434
AI_MODEL=llama3.2
AI_API_KEY=

# Search Provider Configuration ('duckduckgo', 'wikipedia', 'tavily', or 'mock')
SEARCH_PROVIDER=duckduckgo
SEARCH_API_KEY=

# Execution Governance Limits
MAX_AGENT_CALLS=12
AGENT_TIMEOUT_MS=60000
MAX_SEARCH_RESULTS=6
```

### Frontend Configuration (`client/.env`)
```env
VITE_API_BASE_URL=/api
```
*(In production, set `VITE_API_BASE_URL=https://your-backend-domain.com/api`)*

---

## 🤖 Configuring AI Models

### Option A: Out-of-the-Box High-Fidelity Engine (`AI_PROVIDER=mock`)
Default configuration. Requires **zero API keys** and no local GPU. Generates structured adversarial arguments, prosecutorial objections, counterarguments, and verdicts while conducting genuine live web evidence retrieval.

### Option B: Local Ollama Model
1. Install [Ollama](https://ollama.ai) and pull a model:
   ```bash
   ollama run llama3.2
   ```
2. Configure `server/.env`:
   ```env
   AI_PROVIDER=ollama
   AI_BASE_URL=http://localhost:11434
   AI_MODEL=llama3.2
   ```

### Option C: Hosted OpenAI-Compatible Provider (Groq, Together, OpenAI, Gemini)
Configure `server/.env`:
```env
AI_PROVIDER=openai_compatible
AI_BASE_URL=https://api.groq.com/openai
AI_MODEL=llama-3.3-70b-versatile
AI_API_KEY=your_api_key_here
```

---

## 🍃 MongoDB & Atlas Configuration

1. **Local MongoDB:** Start a local daemon:
   ```bash
   mongod --dbpath /path/to/data
   ```
2. **MongoDB Atlas:** Set your cloud URI:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ghostnet?retryWrites=true&w=majority
   ```
3. **Resilient Memory Fallback:** If MongoDB is offline, GhostNet automatically falls back to an in-memory repository with zero disruption to the courtroom UI.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Subsystem status and database connectivity. |
| `POST` | `/api/investigations` | Empanels a new trial case; dispatches 7-stage orchestrator. |
| `GET` | `/api/investigations` | Returns paginated cases with filtering (`category`, `verdict`, `search`). |
| `GET` | `/api/investigations/:caseId` | Returns complete case record, agent results, and verdict. |
| `GET` | `/api/investigations/:caseId/events` | **Server-Sent Events (SSE)** live courtroom stream. |
| `POST` | `/api/investigations/:caseId/retry` | Restarts an eligible failed trial. |
| `GET` | `/api/investigations/:caseId/evidence` | Returns all primary evidence records gathered for a case. |
| `GET` | `/api/evidence` | Filtered global evidence explorer across cases. |
| `GET` | `/api/settings/status` | Exposes safe configuration telemetry without leaking secrets. |

---

## 🧪 Running Automated Tests

Run the backend Vitest test suite from the root workspace:
```bash
npm test
```
Or inside `server/`:
```bash
npm run test
```

### Verified Test Suite Covers:
- `GET /api/health` connectivity & diagnostic telemetry.
- `GET /api/settings/status` credential masking.
- `POST /api/investigations` Zod input validation (character bounds, categories).
- Agent output schemas (Ghost, Prosecutor, Defense, Fact-Checker, Judge).
- **Deterministic Citation Rules:** Stripping non-existent evidence IDs.
- **Evidentiary Overrides:** Enforcing `INSUFFICIENT EVIDENCE` when no primary sources exist.
- Complete 7-stage orchestrator end-to-end execution.
- Case retrieval and global evidence filtering.

---

## 🛡️ Security & Reliability Provisions

- **Zero Secret Leakage:** Credentials are strictly isolated in backend `.env`.
- **CORS & Helmet:** Hardened HTTP security headers and configurable CORS origins.
- **Strict Input Validation:** Zod validates incoming payloads and structured JSON agent outputs.
- **Rate Limiting:** Protects expensive trial initiation endpoints (`express-rate-limit`).
- **Heartbeats & SSE Recovery:** Automatic keep-alive signals every 8 seconds prevent proxy dropouts.

---

## 📜 License
MIT License. GhostNet — The AI Courtroom.
