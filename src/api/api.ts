const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
import outputDataRaw from '../../output.json';

function getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('auth_token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
}

// --- AWS Configuration ---

export async function configureAws(arn: string): Promise<{ external_id: string }> {
    if (!API_BASE) {
        // Mock delay + response
        await new Promise((r) => setTimeout(r, 1200));
        return { external_id: 'cloudview-ext-' + Math.random().toString(36).substr(2, 12) };
    }
    const res = await fetch(`${API_BASE}/api/aws/configure`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ arn }),
    });
    if (!res.ok) throw new Error('Failed to configure AWS account');
    return res.json();
}

export async function validateAws(
    arn: string,
    externalId: string
): Promise<{ valid: boolean; message?: string }> {
    if (!API_BASE) {
        await new Promise((r) => setTimeout(r, 1500));
        return { valid: true, message: 'Role assumption successful' };
    }
    const res = await fetch(`${API_BASE}/api/aws/validate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ arn, external_id: externalId }),
    });
    if (!res.ok) throw new Error('Validation failed');
    return res.json();
}

// --- Pipeline ---

export async function startPipeline(accountId: string): Promise<{ scan_id: string }> {
    if (!API_BASE) {
        await new Promise((r) => setTimeout(r, 800));
        return { scan_id: '550e8400-e29b-41d4-a716-446655440000' };
    }
    const res = await fetch(`${API_BASE}/api/pipeline/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ account_id: accountId }),
    });
    if (!res.ok) throw new Error('Failed to start pipeline');
    return res.json();
}

export async function getPipelineStatus(
    scanId: string
): Promise<{ status: string; progress: number }> {
    if (!API_BASE) {
        await new Promise((r) => setTimeout(r, 500));
        return { status: 'completed', progress: 100 };
    }
    const res = await fetch(`${API_BASE}/api/pipeline/status/${scanId}`, {
        headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get pipeline status');
    return res.json();
}

export interface ScanNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    parentNode?: string;
    extent?: string;
    data: {
        label: string;
        resource_type: string;
        summary: Record<string, unknown>;
        properties: Record<string, unknown>;
    };
}

export interface ScanEdge {
    id: string;
    source: string;
    target: string;
    type?: string;
    label?: string;
    animated?: boolean;
    markerEnd?: { type: string };
    style?: Record<string, string>;
}

export interface ScanResult {
    scan_id: string;
    account_id: string;
    nodes: ScanNode[];
    edges: ScanEdge[];
}

export async function getPipelineResults(_scanId: string): Promise<ScanResult> {
    return transformOutputData();
}

function transformOutputData(): ScanResult {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const outputData = outputDataRaw as any;
    
    const parentMap = new Map<string, string>();
    outputData.edges.forEach((e: any) => {
        if (e.type === 'IN_VPC' || e.type === 'IN_SUBNET') {
            parentMap.set(e.source, e.target);
        }
    });

    const nodes: ScanNode[] = outputData.nodes.map((n: any) => {
        const parent = parentMap.get(n.id);
        const lowerLabel = (n.label || '').toLowerCase();
        let type = 'generic';
        if (lowerLabel === 'vpc') type = 'vpc';
        else if (lowerLabel === 'subnet') type = 'subnet';
        else if (lowerLabel === 'ec2instance') type = 'ec2';
        else if (lowerLabel === 'securitygroup') type = 'securityGroup';
        else if (lowerLabel === 'internetgateway') type = 'igw';

        return {
            id: n.id,
            type: type,
            position: { x: 0, y: 0 },
            parentNode: parent,
            extent: parent ? 'parent' : undefined,
            data: {
                label: n.name || n.id,
                resource_type: n.label,
                summary: Object.assign({ id: n.id }, n.region ? { region: n.region } : {}),
                properties: n.properties || {}
            }
        };
    });

    const STRUCTURAL_EDGES = ['IN_VPC', 'IN_SUBNET', 'IN_REGION', 'BELONGS_TO_ACCOUNT'];
    const edges: ScanEdge[] = outputData.edges
        .filter((e: any) => !STRUCTURAL_EDGES.includes(e.type))
        .map((e: any, i: number) => ({
            id: `edge-${i}`,
            source: e.source,
            target: e.target,
            label: e.type,
            animated: e.type === 'ATTACHED_TO_VPC' || e.type === 'ATTACHED_TO',
            markerEnd: { type: 'ArrowClosed' },
            style: { stroke: '#737687' }
        }));

    return {
        scan_id: outputData.metadata.scan_id,
        account_id: outputData.metadata.account_id,
        nodes,
        edges
    };
}
