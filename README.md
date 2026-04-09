# AWSTopo

Internal AWS infrastructure visualization tool. Connects to your AWS account via a cross-account IAM role and renders a live, interactive topology graph of your cloud resources.

## Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript (strict) |
| Build | Vite 8 |
| Routing | React Router v7 |
| Styling | Tailwind CSS v4 (Vite plugin, MD3 theme) |
| Graph | @xyflow/react (ReactFlow v12) |
| Icons | react-icons (MD set) |

## Getting started

```bash
npm install
npm run dev        # dev server with HMR → http://localhost:5173
npm run build      # type-check then bundle → dist/
npm run preview    # serve dist/ locally
npm run lint       # ESLint on all .ts/.tsx
```

## Environment

Create a `.env.local` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

When `VITE_API_BASE_URL` is **unset**, the app runs in **mock mode** — all API calls return hardcoded data and auth is bypassed via localStorage. The full UI is usable without a running backend.

## How it works

### Setup flow (`/configure`)

1. **Step 1 — ARN**: Enter your IAM role ARN. The backend returns a unique `external_id` to use as an `sts:ExternalId` condition in the trust policy.
2. **Step 2 — Validate**: Confirm you've updated the trust policy, then submit. The backend verifies it can assume the role.
3. **Step 3 — Scan**: Starts an infrastructure scan. The UI polls `GET /api/scan/{id}` every 2 seconds until `completed` or `failed`, then navigates to the graph.

### Graph (`/visualize/:id`)

- Fetches scan results from `GET /api/scan/{id}/results`
- `transformOutputData()` in [src/api/api.ts](src/api/api.ts) converts the raw graph response into ReactFlow nodes/edges. `IN_VPC` and `IN_SUBNET` edge types are mapped to `parentId` on child nodes (containment), and filtered out of the visible edge list.
- `layoutNodes()` in [src/nodes/layoutEngine.ts](src/nodes/layoutEngine.ts) sizes containers bottom-up and positions them top-down.
- Click any node to open the resource detail panel on the right.

### Auth

JWT Bearer token stored in `localStorage`. `AuthContext` provides `login`, `register`, and `logout`. The token is attached to every API request via the `Authorization: Bearer` header.

## Project structure

```
src/
├── api/
│   └── api.ts              # All API calls + transformOutputData()
├── context/
│   └── AuthContext.tsx     # JWT auth state, login/register/logout
├── nodes/
│   ├── layoutEngine.ts     # Hierarchical layout algorithm
│   ├── VpcNode.tsx
│   ├── SubnetNode.tsx
│   ├── Ec2Node.tsx
│   ├── SecurityGroupNode.tsx
│   ├── IgwNode.tsx
│   └── GenericNode.tsx     # Fallback for unknown resource types
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ConfigurePage.tsx   # 3-step IAM role setup wizard
│   └── VisualizePage.tsx   # Interactive graph canvas
├── components/
│   ├── Navbar.tsx          # Shown only on public auth pages
│   └── Loader.tsx
├── types/
│   └── types.ts            # Shared TypeScript types (ScanResult, ScanNode, etc.)
└── App.tsx                 # Routes — PublicLayout (auth) + ProtectedRoute (app)
```

## IAM role setup

The backend assumes a cross-account role in your AWS account. The role needs:

**Trust policy** — allow the backend's AWS identity to assume the role with the external ID shown in the configure wizard:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "AWS": "<backend-aws-identity>" },
    "Action": "sts:AssumeRole",
    "Condition": {
      "StringEquals": { "sts:ExternalId": "<external_id_from_ui>" }
    }
  }]
}
```

**Permissions policy** — read-only access to the resources being scanned:

```json
{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Action": [
      "ec2:Describe*",
      "rds:Describe*",
      "s3:List*",
      "s3:GetBucketLocation",
      "s3:GetBucketVersioning",
      "s3:GetBucketPolicy",
      "s3:GetEncryptionConfiguration"
    ],
    "Resource": "*"
  }]
}
```
