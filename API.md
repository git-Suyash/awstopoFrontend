# AWSVisualizer API Reference

Base URL: `http://localhost:8000`

All protected endpoints require a `Bearer` token in the `Authorization` header obtained from `/api/user/signup` or `/api/user/login`.

---

## Authentication

### POST `/api/user/signup`

Register a new user. Returns a JWT immediately — no separate login needed.

**Request**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response `201`**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

**Errors**
| Status | Detail |
|--------|--------|
| `409` | Email already registered |
| `422` | Invalid email format |

---

### POST `/api/user/login`

Authenticate an existing user.

**Request**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response `200`**
```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

**Errors**
| Status | Detail |
|--------|--------|
| `401` | Invalid credentials |

---

### GET `/api/user/externalid` 🔒

Returns the user's unique `ExternalId`. This value must be added to the IAM role's trust policy `Condition` before the scan can assume the role.

**Response `200`**
```json
{
  "external_id": "eed230c1-8b0d-4427-bd53-e80a66e8cc5f"
}
```

---

### POST `/api/user/configureaws` 🔒

Store the AWS IAM role ARN the scan pipeline will assume. Call this once after signup, before starting any scan.

**IAM trust policy prerequisite** — the role's trust policy must include:
```json
{
  "Effect": "Allow",
  "Principal": { "AWS": "<your-aws-identity>" },
  "Action": "sts:AssumeRole",
  "Condition": {
    "StringEquals": { "sts:ExternalId": "<external_id from GET /api/user/externalid>" }
  }
}
```

**Request**
```json
{
  "role_arn": "arn:aws:iam::123456789012:role/YourReadOnlyRole"
}
```

**Response `200`**
```json
{
  "role_arn": "arn:aws:iam::123456789012:role/YourReadOnlyRole",
  "external_id": "eed230c1-8b0d-4427-bd53-e80a66e8cc5f",
  "message": "AWS account configured. Ensure your IAM role trust policy specifies this ExternalId."
}
```

**Errors**
| Status | Detail |
|--------|--------|
| `422` | `role_arn` does not start with `arn:aws` |

---

## Scans

### POST `/api/scan/start` 🔒

Trigger a full AWS resource scan. Returns immediately with a `scan_id`; the scan runs in the background. Poll `GET /api/scan/{scan_id}` for completion.

**Request body:** none

**Response `202`**
```json
{
  "scan_id": "d2d00074-b086-4259-a5bf-7e29f02bef41",
  "status": "queued"
}
```

**Errors**
| Status | Detail |
|--------|--------|
| `400` | No AWS account configured — call `POST /api/user/configureaws` first |

---

### GET `/api/scan/{scan_id}` 🔒

Poll the status of a specific scan.

**Response `200` — while running**
```json
{
  "scan_id": "d2d00074-b086-4259-a5bf-7e29f02bef41",
  "user_id": "432d708e-...",
  "status": "running",
  "queued_at": "2026-04-08T15:19:28.592Z",
  "started_running_at": "2026-04-08T15:19:28.600Z"
}
```

**Response `200` — completed**
```json
{
  "scan_id": "d2d00074-b086-4259-a5bf-7e29f02bef41",
  "user_id": "432d708e-...",
  "status": "completed",
  "queued_at": "2026-04-08T15:19:28.592Z",
  "started_running_at": "2026-04-08T15:19:28.600Z",
  "completed_at": "2026-04-08T15:20:07.992Z",
  "node_count": 47,
  "edge_count": 73,
  "errors": null
}
```

**Response `200` — failed**
```json
{
  "scan_id": "d2d00074-...",
  "status": "failed",
  "error": "STS AssumeRole failed: ...",
  "failed_at": "2026-04-08T15:18:02.298Z"
}
```

**`status` lifecycle:** `queued` → `running` → `completed` | `failed`

**Errors**
| Status | Detail |
|--------|--------|
| `404` | Scan not found (wrong ID or belongs to another user) |

---

### GET `/api/scan` 🔒

List all scans for the authenticated user, newest first (max 50).

**Response `200`**
```json
[
  {
    "scan_id": "d2d00074-...",
    "status": "completed",
    "queued_at": "2026-04-08T15:19:28.592Z",
    "completed_at": "2026-04-08T15:20:07.992Z",
    "node_count": 47,
    "edge_count": 73,
    "errors": null
  }
]
```

---

## Graph

### GET `/api/graph` 🔒

Returns the synthesized resource graph for the user's most recent completed scan. This is the primary endpoint for rendering the topology visualisation.

**Response `200`**
```json
{
  "metadata": {
    "scan_id": "251ea45f-47d6-4ab8-8887-a73c71511d49",
    "account_id": "646082657351",
    "regions_scanned": ["us-east-1", "eu-west-1"],
    "started_at": "2026-04-08T15:19:28.661688+00:00",
    "completed_at": "2026-04-08T15:20:05.184631+00:00",
    "node_count": 47,
    "edge_count": 73,
    "collector_errors": null
  },
  "nodes": [
    {
      "id": "vpc-0c302644f45159af6",
      "label": "VPC",
      "name": "main-vpc",
      "region": "us-east-1",
      "account_id": "646082657351",
      "properties": {
        "cidr_block": "10.0.0.0/16",
        "is_default": false
      }
    }
  ],
  "edges": [
    {
      "source": "subnet-04c15acd44b7341fc",
      "target": "vpc-0c302644f45159af6",
      "type": "IN_VPC"
    }
  ]
}
```

**Errors**
| Status | Detail |
|--------|--------|
| `404` | No completed scan found — run `POST /api/scan/start` first |

#### Node labels

| `label` | Represents | Key `properties` |
|---------|-----------|-----------------|
| `AWSAccount` | Root account node | `account_id` |
| `Region` | AWS region | `region` |
| `VPC` | Virtual Private Cloud | `cidr_block`, `is_default` |
| `Subnet` | VPC subnet | `cidr_block`, `availability_zone` |
| `SecurityGroup` | Security group | `group_name`, `description` |
| `InternetGateway` | Internet gateway | — |
| `NatGateway` | NAT gateway | `state`, `subnet_id` |
| `RouteTable` | Route table | `main` |
| `EC2Instance` | EC2 instance | `instance_type`, `state`, `public_ip`, `private_ip` |
| `RDSInstance` | RDS database instance | `engine`, `instance_class`, `multi_az`, `storage_encrypted` |
| `RDSCluster` | RDS Aurora cluster | `engine`, `multi_az`, `storage_encrypted` |
| `S3Bucket` | S3 bucket | `region`, `versioning`, `public_access_blocked`, `encryption` |

#### Edge types

| `type` | Meaning |
|--------|---------|
| `BELONGS_TO_ACCOUNT` | Region / S3 bucket → Account |
| `IN_REGION` | VPC → Region |
| `IN_VPC` | Subnet / SG / IGW / RouteTable / EC2 / RDS → VPC |
| `IN_SUBNET` | EC2 / RDS → Subnet |
| `ATTACHED_TO_VPC` | InternetGateway → VPC |
| `HAS_ROUTE_TABLE` | Subnet → RouteTable |
| `PROTECTED_BY` | EC2 / RDS → SecurityGroup |
| `SG_REFERENCES_SG` | SecurityGroup → SecurityGroup (inbound rule source) |
| `MEMBER_OF_CLUSTER` | RDSInstance → RDSCluster |
| `ROUTES_THROUGH` | Subnet → NAT / IGW |

---

### GET `/api/graph/{scan_id}` 🔒

Same response shape as `GET /api/graph` but for a specific past scan.

**Errors**
| Status | Detail |
|--------|--------|
| `404` | Scan not found |

---

## Integration flow

```
1. POST /api/user/signup          → save access_token
2. GET  /api/user/externalid      → add ExternalId to IAM trust policy
3. POST /api/user/configureaws    → save role_arn
4. POST /api/scan/start           → save scan_id
5. poll GET /api/scan/{scan_id}   → wait for status = "completed"
6. GET  /api/graph                → render topology
```

---

## Headers reference

| Header | Value | Required on |
|--------|-------|------------|
| `Content-Type` | `application/json` | All POST requests with a body |
| `Authorization` | `Bearer <access_token>` | All 🔒 endpoints |

---

## Token notes

- Tokens expire after **60 minutes**. Re-authenticate via `POST /api/user/login` to get a new one.
- On `401 Unauthorized` from any protected endpoint, redirect the user to login.
