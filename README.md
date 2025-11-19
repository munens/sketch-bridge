# Sketch Bridge - MVP Strategy Document

## Executive Summary

**Sketch Bridge** is a real-time collaborative design tool that bridges the gap between early-stage sketching and production-ready code. Unlike traditional design collaboration tools (Figma, Miro) that focus on pixel-perfect designs, I focus on the messy, creative ideation phase where developers and designers sketch ideas quickly but struggle to translate them into actual components that exist in their codebase.

**Service Category:** Design Collaboration

---

## Demo

See Sketch Bridge in action:

[![Sketch Bridge Demo](https://img.youtube.com/vi/GEh4CiQKOHw/maxresdefault.jpg)](https://youtu.be/GEh4CiQKOHw)

**[▶️ Watch Demo Video](https://youtu.be/GEh4CiQKOHw)**

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

A big problem I’m trying to address is how little visibility designers have into the existing component library while they’re ideating. Right now, most teams sketch in Figma or on a whiteboard without any sense of what already exists in the codebase, and developers only point it out later with a “we already built this.” My approach is to have AI analyze sketches in real time and immediately surface matching components from the codebase, which cuts down duplicate work almost entirely.

Another issue is the manual design-to-code handoff. Designers export specs, developers interpret them, and then build everything by hand. It’s slow, error-prone, and honestly hasn’t changed much in years. Instead of generating generic HTML or CSS, my MVP generates real React/TypeScript code based on the team’s actual components.

I’m also trying to streamline the early “sketch-level” ideation workflow. Today, people scribble on paper or a whiteboard, take a photo, drop it in Slack, and someone eventually translates it into something usable. With this tool, teams can sketch directly in the app, get instant AI mapping to components, and immediately see what the implementation might look like.

Lastly, there’s a general disconnect between design and engineering when it comes to component awareness. Libraries live in Storybook or docs, but designers rarely check them while sketching. By baking the entire component knowledge base into the AI itself, it becomes impossible to overlook what already exists.

### Assumptions About User Needs

1. **Users sketch/wireframe before building** - I assume teams do early-stage ideation with rough sketches (paper, whiteboard, or digital)
2. **Component reuse is valuable** - Teams want to use existing components rather than create new ones
3. **Speed over perfection in ideation** - Early design stages prioritize speed and exploration, not pixel-perfect mockups
4. **Developers are in design discussions** - My ideal user is a developer who sketches or a designer who codes, or teams where both collaborate

### What I Skipped (Deferred Features)

I intentionally left out any pixel-perfect design features because that isn’t where this product differentiates itself. Tools like Figma already do that extremely well, and my focus is on rough sketches and fast ideation rather than polished design work.

I also skipped advanced layer management or grouping. Those features would add a lot of complexity without helping validate the core idea. For the MVP, basic actions like adding, updating, or deleting objects are more than enough.

Exporting to tools like Figma or Sketch was another thing I chose not to include. That assumes users want to move their sketches back into traditional design tools, but the real value I’m testing is the direct link from sketching to code—not handing designs off elsewhere.

Finally, I didn’t invest in any custom AI model training. GPT-4 Vision is strong enough for what I need at this stage. Before committing resources to a specialized model, I want to validate that this entire approach actually resonates with users.


---

## 2. Technical Architecture & Trade-offs

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

**OpenAI GPT-4 Vision** - Why build a custom model when I'm still validating if AI can even recognize components from sketches? GPT-4 Vision is expensive ($0.01-0.05 per analysis) and slow (10-30s), but it's the fastest way to validate the core hypothesis. If this works, I can optimize with fine-tuned models later.

**Knowledge base in code, not database** - Components are TypeScript objects in `component-knowledge-base.ts`. This keeps them type-safe and version-controlled. The downside? Can't update components without a deploy. For MVP validation with 6 components, this is fine. Production would need a proper CMS.

**Native Canvas/SVG, no libraries** - Only needed simple shapes for the MVP. Building custom saved ~300KB bundle size and gave full control. If I need complex features later (groups, advanced transforms), I can always add a library.

### Risks and Mitigations

One of the biggest risks is that OpenAI API costs could get out of control, especially since sketch analysis can be expensive. If that happens, the product quickly becomes impossible to sustain. To mitigate this, I’d place limits on how many analyses a user can run, optimize prompts as much as possible, and only consider fine-tuning models once the idea is validated.

Another risk is that the AI simply isn’t accurate enough. If it can’t reliably recognize components, the whole value proposition falls apart. To reduce this risk, I’d provide the AI with rich component metadata—things like visual descriptions and source code—and iterate heavily on prompt engineering until the accuracy is acceptable.

Real-time collaboration also introduces scaling challenges. If the WebSocket layer can’t handle more than a hundred concurrent users, the experience breaks down fast. My plan would be to scale horizontally using Redis pub/sub and rely on load balancer–managed sticky sessions to keep connections stable.

There’s also a practical storage concern. Storing raw images directly in PostgreSQL would quickly bloat the database, especially if users upload a lot of sketches. The fix is straightforward: move images to S3 or Cloudflare R2 and store only the URLs in PostgreSQL.

Finally, AI latency is a real user-experience risk. If analysis takes 10–30 seconds, people might get frustrated. To offset this, I’d show clear progress updates and even allow the analysis to run asynchronously so users can continue sketching and get notified when the results are ready.

---

## 3. Open Questions

**Big assumptions I'm making:**
- Teams actually struggle with component discovery (is this universal?)
- Developers will sketch in-tool vs. paper/whiteboard
- AI accuracy will be good enough that people trust the suggestions
- Component reuse is painful enough to solve

**Still figuring out:**
- Is this a standalone product or a feature? Would people pay for this?
- How many components needed for AI to be useful? 20? 100?
- Do we need real-time, or would async be fine for solo use?

---

## 4. Technical Documentation

### Tech Stack Summary

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18 + TypeScript |
| **Canvas** | Native HTML5 Canvas + SVG |
| **Real-time** | Socket.io |
| **Backend** | Node.js + Express |
| **Database** | PostgreSQL + Knex |
| **AI** | OpenAI GPT-4o Vision |
| **Styling** | Tailwind CSS |
| **Build** | Vite |
| **Monorepo** | npm workspaces |

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

## 5. Running the MVP

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

