# Sketch Bridge - MVP Strategy Document

## Executive Summary

**Sketch Bridge** is a real-time collaborative design tool that bridges the gap between early-stage sketching and production-ready code. Unlike traditional design collaboration tools (Figma, Miro) that focus on pixel-perfect designs, I focus on the messy, creative ideation phase where developers and designers sketch ideas quickly but struggle to translate them into actual components that exist in their codebase.

**Service Category:** Design Collaboration

---

## Demo

See Sketch Bridge in action:

[![Sketch Bridge Demo](https://img.youtube.com/vi/aWVMvQ_jyV0/maxresdefault.jpg)](https://youtu.be/aWVMvQ_jyV0)

**[▶️ Watch Demo Video](https://youtu.be/aWVMvQ_jyV0)**

---

## 1. Product Vision & Differentiation

### What I'm Verifying

**Core Hypothesis:** There's a critical gap between the speed of ideation (sketching/wireframing) and implementation (writing component code). Existing design tools don't help developers/designers discover what UI components already exist in their codebase during the creative process.

### Three Key Differentiators

#### 1. **AI-Powered Component Recognition from Sketches**
- Upload a hand-drawn sketch or wireframe, and my AI (GPT-4 Vision) identifies which components from your actual codebase match your sketch
- Designers sketch a button, and immediately see: "You already have `Button.Primary` and `Button.Secondary` in your codebase that matches this". In the demo video above you will notice that `Panel` and `TextSearch` exist under `/app/components` which are part of the component library of this application.
- Figma has design systems, but they're disconnected from code. Developers still manually translate designs into component references.

#### 2. **Component Knowledge Base Integration**
- A living catalog of your actual React/TypeScript components (props, visual characteristics, source code) that AI can reference
- The tool "knows" your codebase's components and can suggest them during ideation, not after.
- Design tools have component libraries, but they're design artifacts, not actual code. There's always a translation layer.

#### 3. **Real-Time Collaborative Canvas + AI Analysis**
- Multiple users can sketch together, then collectively analyze sketches to get instant component mappings and code generation
- Teams can brainstorm visually, then immediately bridge to implementation without context switching
- Collaboration tools (Figma, Miro) excel at visual collaboration but don't help with the design-to-code transition. AI tools (v0.dev, Galileo AI) generate new designs but don't reference your existing components.

### Problems Existing Services DON'T Solve Well

| Problem | Current State | My Approach |
|---------|--------------|--------------|
| **Component Discovery During Ideation** | Designers sketch in Figma without knowing what components already exist in the codebase. Developers later say "we already have this component." | AI analyzes sketches in real-time and suggests existing components from your codebase, reducing duplicate work |
| **Design-to-Code Translation** | Manual process: Designer exports specs → Developer interprets → Developer writes code. Prone to errors and time-consuming. | Generate actual TypeScript/React code using your component library, not generic HTML/CSS |
| **Sketch-Level Ideation Tools** | Paper/whiteboard → Take photo → Upload to Slack → Discuss → Someone translates to code. Very manual. | Sketch directly in the tool → AI maps to components → Get implementable code instantly |
| **Component Library Awareness** | Component libraries exist in Storybook/docs, but designers rarely check them during sketching. Disconnect between design and engineering. | Component knowledge base is baked into the AI, making it impossible to miss existing components |

### Assumptions About User Needs

1. **Users sketch/wireframe before building** - I assume teams do early-stage ideation with rough sketches (paper, whiteboard, or digital)
2. **Component reuse is valuable** - Teams want to use existing components rather than create new ones
3. **Speed over perfection in ideation** - Early design stages prioritize speed and exploration, not pixel-perfect mockups
4. **Developers are in design discussions** - My ideal user is a developer who sketches or a designer who codes, or teams where both collaborate
5. **React/TypeScript ecosystem** - Initial target is React-based component libraries (most common in modern web development)

---

## 2. Development Process & Feature Prioritization

### Build vs. Skip Decisions

My development was guided by a single question: **"Does this feature validate my differentiation hypothesis?"**

#### ✅ What I BUILT (Priority Features)

1. **Real-Time Collaborative Canvas**
   - **Why:** Validates that sketching/ideation can happen in-tool (vs. external whiteboard photos)
   - **Validation:** Can teams sketch wireframes fast enough to replace paper/Miro?
   - **Tech:** Socket.io, Fabric.js canvas, PostgreSQL persistence

2. **AI Component Recognition (GPT-4 Vision)**
   - **Why:** Core differentiator - this is the "bridge" in Sketch Bridge
   - **Validation:** Can AI accurately map rough sketches to specific components?
   - **Tech:** OpenAI GPT-4o with vision, component knowledge base system

3. **Component Knowledge Base**
   - **Why:** The "brain" that makes AI useful - teaches AI what your components look like
   - **Validation:** Does structured component metadata improve AI accuracy?
   - **Tech:** TypeScript interfaces for component metadata, visual descriptions, source code examples

4. **Active Session Management**
   - **Why:** Real-time collaboration requires knowing who's in the room
   - **Validation:** Can multiple users collaborate without conflicts?
   - **Tech:** Socket sessions with cursor tracking, user presence indicators

5. **Image Data Persistence**
   - **Why:** Sketches need to be saved/shared for async collaboration
   - **Validation:** Can teams reference past sketches to maintain design history?
   - **Tech:** Base64 image storage in PostgreSQL

#### ❌ What I SKIPPED (Deferred Features)

1. **Pixel-Perfect Design Tools**
   - **Why skipped:** Not my differentiator. Figma already excels here.
   - **Decision:** Focus on rough sketches, not production-ready designs

2. **Advanced Layer Management/Groups**
   - **Why skipped:** Adds complexity without validating core hypothesis
   - **Decision:** Simple object add/update/delete is sufficient for MVP

3. **Export to Figma/Sketch**
   - **Why skipped:** Assumes users want to move to traditional design tools after sketching
   - **Decision:** My value is in the code generation, not design handoff

4. **Custom AI Model Training**
   - **Why skipped:** GPT-4 Vision is sufficient for MVP validation
   - **Decision:** Use existing models, validate approach before investing in custom models


---

## 3. Technical Architecture & Trade-offs

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client (React + TypeScript)              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Canvas UI   │  │ Socket.io    │  │ AI Results Modal │   │
│  │ (Fabric.js) │  │ Client       │  │                  │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ WebSocket (Socket.io)
┌────────────────────────▼────────────────────────────────────┐
│                  Server (Node.js + Express)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ Canvas      │  │ Session      │  │ AI Service       │   │
│  │ Controller  │  │ Service      │  │ (GPT-4 Vision)   │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│         │                  │                   │             │
│  ┌──────▼──────────────────▼───────────────────▼────────┐   │
│  │         PostgreSQL (Knex.js)                          │   │
│  │  ┌─────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│  │  │ Canvases│  │ Canvas      │  │ Active          │  │   │
│  │  │         │  │ Objects     │  │ Sessions        │  │   │
│  │  └─────────┘  └─────────────┘  └─────────────────┘  │   │
│  └───────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │  OpenAI API      │
                  │  (GPT-4o Vision) │
                  └──────────────────┘
```

### Key Architectural Decisions

**Monorepo with shared types** - Client and server share the same TypeScript interfaces through a `common` package. This prevents runtime errors when dealing with complex AI responses, though it makes the build slightly more complex.

**Socket.io for everything real-time** - Collaborative sketching needs sub-100ms latency. WebSockets handle cursor tracking and drawing updates efficiently. The tradeoff? Harder to scale horizontally (you need sticky sessions), but that's a good problem to have later.

**PostgreSQL over MongoDB** - AI results need to be queried ("show me all components with >80% confidence"). SQL handles this better than document stores. Plus, migrations give me schema safety as the product evolves.

**OpenAI GPT-4 Vision** - Why build a custom model when I'm still validating if AI can even recognize components from sketches? GPT-4 Vision is expensive ($0.01-0.05 per analysis) and slow (10-30s), but it's the fastest way to validate the core hypothesis. If this works, I can optimize with fine-tuned models later.

**Knowledge base in code, not database** - Components are TypeScript objects in `component-knowledge-base.ts`. This keeps them type-safe and version-controlled. The downside? Can't update components without a deploy. For MVP validation with 6 components, this is fine. Production would need a proper CMS.

**Native Canvas/SVG, no libraries** - Only needed simple shapes for the MVP. Building custom saved ~300KB bundle size and gave full control. If I need complex features later (groups, advanced transforms), I can always add a library.

### Technical Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **OpenAI API costs spiral** | High analysis costs make product unviable | Implement analysis limits per user, optimize prompts, consider fine-tuned models if validated |
| **AI accuracy too low** | Core value prop fails if AI can't recognize components | Extensive component metadata (visual descriptions, source code), iterative prompt engineering |
| **WebSocket scale limits** | Real-time collaboration breaks with >100 concurrent users | Horizontal scaling with Redis pub/sub, sticky sessions via load balancer |
| **Image storage grows quickly** | PostgreSQL bloated with base64 images | Move to S3/CloudFlare R2 for images, store URLs in PostgreSQL |
| **AI latency frustrates users** | 10-30s analysis feels slow | Show progress updates, allow async analysis (analyze, get notified when done) |

---

## 4. Success Metrics & Validation

**What "success" looks like:**
- AI correctly maps >70% of sketches to existing components
- Sketch-to-code takes <5 minutes (vs. 30+ minutes manually)
- Users discover components they didn't know existed
- Teams use this for 50%+ of feature discussions instead of whiteboard photos

**MVP Status:** Core tech works. Real-time collaboration ✓, AI recognition ✓, code generation ✓, 6 components in the knowledge base ✓. Next step is getting this in front of real teams to validate if they'll actually use it.


## 5. Why This is Different

This isn't another Figma (pixel-perfect design), v0.dev (generic AI code generation), Storybook (component docs), or Miro (general whiteboard). 

**The key difference:** I'm component-first. Every other tool thinks in pixels or generic UI elements. I think in terms of YOUR actual codebase. Sketch a button, instantly see you already have `Button.Primary`. The AI knows your component library through prompt engineering, not generic patterns.

It's built for the messy middle of ideation—rough sketches are the point. The goal isn't prettier mockups, it's faster paths from sketch → actual code using components you already have.

---

## 6. Open Questions

**Big assumptions I'm making:**
- Teams actually struggle with component discovery (is this universal?)
- Developers will sketch in-tool vs. paper/whiteboard
- AI accuracy will be good enough that people trust the suggestions
- Component reuse is painful enough to solve

**Still figuring out:**
- Is this a standalone product or a feature? Would people pay for this?
- How many components needed for AI to be useful? 20? 100?
- Do we need real-time, or would async be fine for solo use?
- Enterprise needs on-premise AI—dealbreaker or edge case?

**Next steps:** User interviews with 20+ teams, A/B test real-time vs. async, pricing pilots, and potentially test open-source vision models for on-premise needs.

---

## 7. Technical Documentation

### Tech Stack Summary

| Layer | Technology | Why |
|-------|------------|-----|
| **Frontend** | React 18 + TypeScript | Industry standard, strong typing |
| **Canvas** | Native HTML5 Canvas + SVG | Lightweight, no external dependencies, full control |
| **Real-time** | Socket.io | Reliable WebSocket abstraction |
| **Backend** | Node.js + Express | JavaScript full-stack, fast iteration |
| **Database** | PostgreSQL + Knex | Strong schema, relations, migrations |
| **AI** | OpenAI GPT-4o Vision | State-of-the-art vision model |
| **Styling** | Tailwind CSS | Rapid UI development |
| **Build** | Vite | Fast dev server, optimized builds |
| **Monorepo** | npm workspaces | Shared types, single dependency tree |

### Project Structure

```
sketch-bridge/
├── app/                    # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/canvas/   # Main canvas page
│   │   ├── hooks/          # React hooks (useSocket, etc.)
│   │   └── main.tsx        # App entry point
│   └── package.json
│
├── socket/                 # Node.js backend
│   ├── src/
│   │   ├── canvas/         # Canvas controller, service, repo
│   │   ├── session/        # Session management
│   │   ├── ai/             # AI service + knowledge base
│   │   └── server.ts       # Express + Socket.io server
│   ├── db/migrations/      # Knex migrations
│   └── package.json
│
├── common/                 # Shared TypeScript types
│   ├── model/
│   │   ├── canvas/         # Canvas data models
│   │   ├── ai/             # AI result types
│   │   └── component-mapping/  # Component metadata
│   └── package.json
│
└── package.json            # Root workspace config
```

### Key Files to Understand

1. **`socket/src/ai/service.ts`** - AI analysis logic (GPT-4 Vision integration)
2. **`socket/src/ai/component-knowledge-base.ts`** - Component definitions that teach AI
3. **`socket/src/canvas/controller.ts`** - WebSocket event handlers (join, draw, analyze)
4. **`app/src/pages/canvas/canvas.tsx`** - Main UI orchestration
5. **`common/model/ai/ai-analysis.ts`** - Shared types for AI responses

---

## 8. Running the MVP

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key

### Quick Start

```bash
# Install dependencies
npm install

# Set up database
cd socket
npx knex migrate:latest
cd ..

# Set environment variables
echo "OPENAI_API_KEY=your-key-here" > socket/.env
echo "DATABASE_URL=postgres://localhost/sketch_bridge" >> socket/.env

# Start backend
npm run dev:socket

# Start frontend (new terminal)
npm run dev:app
```

### Environment Variables

```bash
# socket/.env
OPENAI_API_KEY=sk-...           # OpenAI API key
DATABASE_URL=postgres://...     # PostgreSQL connection string
PORT=3003                       # Server port
NODE_ENV=development            # development | production
```

