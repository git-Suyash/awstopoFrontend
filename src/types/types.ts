
interface RawGraphNode {
    id: string;
    label: string;
    name?: string;
    region?: string;
    account_id?: string;
    properties?: Record<string, unknown>;
}

interface RawGraphEdge {
    source: string;
    target: string;
    type: string;
    label?: string;
}

export interface GraphApiResponse {
    metadata: {
        scan_id: string;
        account_id: string;
        regions_scanned: string[];
        node_count: number;
        edge_count: number;
    };
    nodes: RawGraphNode[];
    edges: RawGraphEdge[];
}

// --- ReactFlow types ---

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
    regions_scanned: string[];
    nodes: ScanNode[];
    edges: ScanEdge[];
}

export interface ScanStatus {
    scan_id: string;
    status: 'queued' | 'running' | 'completed' | 'failed';
    node_count?: number;
    edge_count?: number;
    error?: string;
    queued_at?: string;
    started_running_at?: string;
    completed_at?: string;
    failed_at?: string;
}