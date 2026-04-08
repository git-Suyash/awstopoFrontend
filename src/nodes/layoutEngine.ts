import type { ScanNode } from '../types/types';

interface LayoutNode {
    id: string;
    type: string;
    parentNode?: string;
    position: { x: number; y: number };
    style?: Record<string, unknown>;
    data: Record<string, unknown>;
    extent?: string;
}

// Container types that hold children
const CONTAINER_TYPES = new Set(['vpc', 'subnet']);

// Sizes for different node types
const NODE_SIZES: Record<string, { w: number; h: number }> = {
    ec2: { w: 260, h: 180 },
    securityGroup: { w: 240, h: 160 },
    igw: { w: 200, h: 110 },
    generic: { w: 220, h: 140 },
};

const PADDING = 80;
const GAP = 100;
const HEADER_HEIGHT = 80;

/**
 * Auto-layout algorithm:
 * 1. Build a tree from nodes (parent → children)
 * 2. Bottom-up: calculate sizes of containers based on children
 * 3. Top-down: assign positions
 */
export function layoutNodes(rawNodes: ScanNode[]): LayoutNode[] {
    // Build parent → children map
    const childrenMap = new Map<string, string[]>();
    const nodeMap = new Map<string, ScanNode>();

    for (const node of rawNodes) {
        nodeMap.set(node.id, node);
        if (node.parentNode) {
            const siblings = childrenMap.get(node.parentNode) || [];
            siblings.push(node.id);
            childrenMap.set(node.parentNode, siblings);
        }
    }

    // Get root nodes (no parent)
    const roots = rawNodes.filter((n) => !n.parentNode);

    // Calculate sizes bottom-up
    const sizeCache = new Map<string, { w: number; h: number }>();

    function calcSize(id: string): { w: number; h: number } {
        if (sizeCache.has(id)) return sizeCache.get(id)!;

        const node = nodeMap.get(id)!;
        const children = childrenMap.get(id) || [];

        if (!CONTAINER_TYPES.has(node.type) || children.length === 0) {
            const size = NODE_SIZES[node.type] || NODE_SIZES.generic;
            sizeCache.set(id, size);
            return size;
        }

        // Container: grid-layout children
        const childSizes = children.map((cid) => calcSize(cid));
        const cols = Math.ceil(Math.sqrt(children.length));
        const rows = Math.ceil(children.length / cols);

        let maxColWidth = 0;
        let maxRowHeight = 0;
        for (let i = 0; i < children.length; i++) {
            maxColWidth = Math.max(maxColWidth, childSizes[i].w);
            maxRowHeight = Math.max(maxRowHeight, childSizes[i].h);
        }

        const w = cols * maxColWidth + (cols - 1) * GAP + PADDING * 2;
        const h = rows * maxRowHeight + (rows - 1) * GAP + PADDING * 2 + HEADER_HEIGHT;

        const size = { w: Math.max(w, 280), h: Math.max(h, 200) };
        sizeCache.set(id, size);
        return size;
    }

    // Calculate all sizes
    for (const node of rawNodes) {
        calcSize(node.id);
    }

    // Position nodes
    const result: LayoutNode[] = [];

    function positionNode(id: string, x: number, y: number) {
        const node = nodeMap.get(id)!;
        const size = sizeCache.get(id)!;
        const children = childrenMap.get(id) || [];

        const layoutNode: LayoutNode = {
            id: node.id,
            type: node.type,
            position: { x, y },
            data: node.data,
        };

        if (node.parentNode) {
            layoutNode.parentNode = node.parentNode;
            layoutNode.extent = 'parent';
        }

        if (CONTAINER_TYPES.has(node.type) && children.length > 0) {
            layoutNode.style = {
                width: size.w,
                height: size.h,
                background: 'transparent',
                border: 'none',
                padding: 0,
            };

            // Position children in grid inside container
            const cols = Math.ceil(Math.sqrt(children.length));
            const childSizes = children.map((cid) => sizeCache.get(cid)!);
            let maxColW = 0;
            let maxRowH = 0;
            for (const cs of childSizes) {
                maxColW = Math.max(maxColW, cs.w);
                maxRowH = Math.max(maxRowH, cs.h);
            }

            for (let i = 0; i < children.length; i++) {
                const col = i % cols;
                const row = Math.floor(i / cols);
                const cx = PADDING + col * (maxColW + GAP);
                const cy = HEADER_HEIGHT + PADDING + row * (maxRowH + GAP);
                positionNode(children[i], cx, cy);
            }
        }

        result.push(layoutNode);
    }

    // Layout roots side by side
    let rootX = 0;
    // Separate container roots and standalone roots
    const containerRoots = roots.filter((r) => CONTAINER_TYPES.has(r.type));
    const standaloneRoots = roots.filter((r) => !CONTAINER_TYPES.has(r.type));

    for (const root of containerRoots) {
        const size = sizeCache.get(root.id)!;
        positionNode(root.id, rootX, 0);
        rootX += size.w + GAP * 2;
    }

    // Position standalone nodes below containers
    const containerMaxH = containerRoots.reduce(
        (max, r) => Math.max(max, sizeCache.get(r.id)?.h || 0),
        0
    );
    let standX = 0;
    for (const node of standaloneRoots) {
        const size = sizeCache.get(node.id)!;
        positionNode(node.id, standX, containerMaxH + GAP * 3);
        standX += size.w + GAP;
    }

    return result;
}
