# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server (HMR enabled)
npm run build     # Type-check (tsc -b) then bundle (vite build) → dist/
npm run lint      # ESLint on all .ts/.tsx files
npm run preview   # Serve the built dist/ locally
```

No test runner is configured.

## Environment

- `VITE_API_BASE_URL` — set to the backend origin (e.g. `http://localhost:8000`). When **unset**, the app falls back to mock data and localStorage auth, so the frontend is fully functional without a backend.

## Architecture

### Routing & Auth

[src/App.tsx](src/App.tsx) owns all routes via React Router v7. The `ProtectedRoute` wrapper reads from `AuthContext`; unauthenticated users are redirected to `/login`. Routes:

- `/` — public landing page
- `/login`, `/register` — public auth pages
- `/configure` — IAM role setup wizard (protected)
- `/visualize/:id` — interactive graph (protected)

### Auth State

[src/context/AuthContext.tsx](src/context/AuthContext.tsx) — React Context + `localStorage`. Stores JWT token and user object. Provides `login`, `register`, `logout`. In mock mode (no `VITE_API_BASE_URL`) it returns hardcoded success responses.

### API Layer

[src/api/api.ts](src/api/api.ts) — plain `fetch` wrapper that reads the Bearer token from `localStorage`. Contains:

- **AWS config flow:** `configureAws` → `validateAws` → `startPipeline` → `getPipelineStatus`
- **`transformOutputData()`** — critical function that converts the raw graph API response into ReactFlow `nodes`/`edges`. It builds parent-child containment from `IN_VPC`/`IN_SUBNET` edge types (set as `parentId`) and filters those structural edges out of the visible edge list, keeping only semantic edges (e.g. `PROTECTED_BY`).

### Graph Visualization

[src/pages/VisualizePage.tsx](src/pages/VisualizePage.tsx) orchestrates the main canvas. Flow:
1. Fetch raw data via `getPipelineResults`
2. `transformOutputData` converts to ReactFlow format
3. `calculateLayout` ([src/nodes/layoutEngine.ts](src/nodes/layoutEngine.ts)) assigns `position` to every node using a bottom-up size calculation then top-down placement
4. `@xyflow/react` renders with custom node types registered in `nodeTypes`

**Custom nodes** in [src/nodes/](src/nodes/): `VpcNode`, `SubnetNode`, `Ec2Node`, `SecurityGroupNode`, `IgwNode`, `GenericNode`. Each accepts `data` from the ReactFlow node and renders AWS-specific styling. `GenericNode` is the fallback for unknown resource types.

**Layout engine** ([src/nodes/layoutEngine.ts](src/nodes/layoutEngine.ts)): hierarchical algorithm — sizes containers bottom-up (grid of children), then positions top-down. Constants `PADDING`, `GAP`, `HEADER_HEIGHT`, and per-type node sizes live at the top of that file.

### Styling

Global theme in [src/index.css](src/index.css). Uses Tailwind CSS v4 (Vite plugin, no `tailwind.config.js`). Custom utility classes: `.glass`, `.glass-hover`, `.gradient-bg`, `.glow-cyan`, `.glow-indigo`, `.spinner`, `.particle`. Color palette uses Material Design 3 tokens mapped to CSS variables. Two font families: **Manrope** (headings) and **Inter** (body).

### Configure Wizard

[src/pages/ConfigurePage.tsx](src/pages/ConfigurePage.tsx) is a 4-step state machine: `'arn' → 'validate' → 'scan' → 'scanning'`. The right column shows collapsible IAM policy JSON blocks. The scanning step polls `getPipelineStatus` until the backend reports completion, then navigates to `/visualize/:scanId`.

## Key Conventions

- **Mock mode**: keeping `VITE_API_BASE_URL` unset enables full UI development without a backend.
- **Parent-child in ReactFlow**: containment (VPC→Subnet→EC2) is expressed via `parentId` on nodes, not via edges. The `transformOutputData` function is the single place this mapping is built.
- **No global state library**: all state is either `AuthContext`, component `useState`, or URL params.
- **TypeScript strict mode** is on (`noUnusedLocals`, `noUnusedParameters`) — the build will fail on unused variables.
