import type { GraphApiResponse, ScanEdge, ScanNode, ScanResult, ScanStatus } from "../types/types";

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

async function handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detail = (err as any).detail;
        throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail) || `Request failed (${res.status})`);
    }
    return res.json();
}

// --- Auth (called from AuthContext) ---

export async function apiLogin(email: string, password: string): Promise<{ access_token: string }> {

    // test
    if (!API_BASE) {
        await new Promise((r) => setTimeout(r, 600));
        return { access_token: 'mock-jwt-token-' + Date.now() };
    }
    const res = await fetch(`${API_BASE}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
}

export async function apiSignup(email: string, password: string): Promise<{ access_token: string }> {
    if (!API_BASE) {
        await new Promise((r) => setTimeout(r, 600));
        return { access_token: 'mock-jwt-token-' + Date.now() };
    }
    const res = await fetch(`${API_BASE}/api/user/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
}

// --- AWS Configuration ---

export async function getExternalId(): Promise<{ external_id: string }> {

    // test
    if (!API_BASE) {
        await new Promise((r) => setTimeout(r, 800));
        return { external_id: 'eed230c1-8b0d-4427-bd53-e80a66e8cc5f' };
    }

    const res = await fetch(`${API_BASE}/api/user/externalid`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}

export async function configureAwsRole(roleArn: string): Promise<{ role_arn: string; external_id: string }> {
    if (!API_BASE) {
        await new Promise((r) => setTimeout(r, 1000));
        return { role_arn: roleArn, external_id: 'eed230c1-8b0d-4427-bd53-e80a66e8cc5f' };
    }
    const res = await fetch(`${API_BASE}/api/user/configureaws`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ role_arn: roleArn }),
    });
    return handleResponse(res);
}

// --- Scans ---

export async function startScan(): Promise<{ scan_id: string; status: string }> {

    // test
    if (!API_BASE) {
        await new Promise((r) => setTimeout(r, 800));
        return { scan_id: '550e8400-e29b-41d4-a716-446655440000', status: 'queued' };
    }
    const res = await fetch(`${API_BASE}/api/scan/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}



export async function getScanStatus(scanId: string): Promise<ScanStatus> {
    if (!API_BASE) {
        await new Promise((r) => setTimeout(r, 500));
        return { scan_id: scanId, status: 'completed', node_count: 47, edge_count: 73 };
    }
    const res = await fetch(`${API_BASE}/api/scan/${scanId}`, {
        headers: getAuthHeaders(),
    });
    return handleResponse(res);
}


export async function getPipelineResults(scanId: string): Promise<ScanResult> {
    if (!API_BASE) {
        await new Promise((r) => setTimeout(r, 500));
        return transformOutputData(MOCK_GRAPH);
    }
    const endpoint = scanId && scanId !== 'demo'
        ? `${API_BASE}/api/graph/${scanId}`
        : `${API_BASE}/api/graph`;
    const res = await fetch(endpoint, { headers: getAuthHeaders() });
    const data: GraphApiResponse = await handleResponse(res);
    return transformOutputData(data);
}

function transformOutputData(outputData: GraphApiResponse): ScanResult {
    const parentMap = new Map<string, string>();
    outputData.edges.forEach((e) => {
        if (e.type === 'IN_VPC' || e.type === 'IN_SUBNET') {
            parentMap.set(e.source, e.target);
        }
    });

    const nodes: ScanNode[] = outputData.nodes.map((n) => {
        const parent = parentMap.get(n.id);
        const lowerLabel = (n.label || '').toLowerCase();
        let type = 'generic';
        if (lowerLabel === 'vpc') type = 'vpc';
        else if (lowerLabel === 'subnet') type = 'subnet';
        else if (lowerLabel === 'ec2instance') type = 'ec2';
        else if (lowerLabel === 'securitygroup') type = 'securityGroup';
        else if (lowerLabel === 'internetgateway') type = 'igw';

        const summary: Record<string, unknown> = { id: n.id };
        if (n.region) summary.region = n.region;
        if (n.account_id) summary.account_id = n.account_id;

        return {
            id: n.id,
            type,
            position: { x: 0, y: 0 },
            parentNode: parent,
            extent: parent ? 'parent' : undefined,
            data: {
                label: n.name || n.id,
                resource_type: n.label,
                summary,
                properties: n.properties || {},
            },
        };
    });

    const STRUCTURAL_EDGES = new Set(['IN_VPC', 'IN_SUBNET', 'IN_REGION', 'BELONGS_TO_ACCOUNT']);
    const edges: ScanEdge[] = outputData.edges
        .filter((e) => !STRUCTURAL_EDGES.has(e.type))
        .map((e, i) => ({
            id: `edge-${i}`,
            source: e.source,
            target: e.target,
            label: e.label || e.type,
            animated: e.type === 'ATTACHED_TO_VPC',
            markerEnd: { type: 'ArrowClosed' },
            style: { stroke: '#737687' },
        }));

    return {
        scan_id: outputData.metadata.scan_id,
        account_id: outputData.metadata.account_id,
        regions_scanned: outputData.metadata.regions_scanned || [],
        nodes,
        edges,
    };
}

// Mock data

const MOCK_GRAPH: GraphApiResponse = {
    metadata: {
        scan_id: 'mock-scan-001',
        account_id: '123456789012',
        regions_scanned: ['us-east-1'],
        node_count: 5,
        edge_count: 3,
    },
    nodes: [
        { id: 'vpc-001', label: 'VPC', name: 'main-vpc', region: 'us-east-1', properties: { cidr_block: '10.0.0.0/16', is_default: false } },
        { id: 'subnet-001', label: 'Subnet', name: 'public-subnet-1a', region: 'us-east-1', properties: { cidr_block: '10.0.1.0/24', availability_zone: 'us-east-1a' } },
        { id: 'ec2-001', label: 'EC2Instance', name: 'web-server', region: 'us-east-1', properties: { instance_type: 't3.micro', state: 'running', private_ip: '10.0.1.5' } },
        { id: 'sg-001', label: 'SecurityGroup', name: 'web-sg', region: 'us-east-1', properties: { group_name: 'web-sg', description: 'Web server security group' } },
        { id: 'igw-001', label: 'InternetGateway', name: 'main-igw', region: 'us-east-1', properties: {} },
    ],
    edges: [
        { source: 'subnet-001', target: 'vpc-001', type: 'IN_VPC' },
        { source: 'ec2-001', target: 'subnet-001', type: 'IN_SUBNET' },
        { source: 'ec2-001', target: 'sg-001', type: 'PROTECTED_BY' },
        { source: 'igw-001', target: 'vpc-001', type: 'ATTACHED_TO_VPC' },
    ],
};