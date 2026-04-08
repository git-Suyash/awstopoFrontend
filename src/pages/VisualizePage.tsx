import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ReactFlow,
    Controls,
    MiniMap,
    Background,
    BackgroundVariant,
    useNodesState,
    useEdgesState,
    type Node,
    type Edge,
    Panel,
    MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { getPipelineResults, type ScanResult } from '../api/api';
import { layoutNodes } from '../nodes/layoutEngine';
import Loader from '../components/Loader';

import VpcNode from '../nodes/VpcNode';
import SubnetNode from '../nodes/SubnetNode';
import Ec2Node from '../nodes/Ec2Node';
import SecurityGroupNode from '../nodes/SecurityGroupNode';
import IgwNode from '../nodes/IgwNode';
import GenericNode from '../nodes/GenericNode';

const nodeTypes = {
    vpc: VpcNode,
    subnet: SubnetNode,
    ec2: Ec2Node,
    securityGroup: SecurityGroupNode,
    igw: IgwNode,
    generic: GenericNode,
};

export default function VisualizePage() {
    const { id } = useParams<{ id: string }>();
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [loading, setLoading] = useState(true);
    const [scanData, setScanData] = useState<ScanResult | null>(null);
    const [selectedNode, setSelectedNode] = useState<Node | null>(null);

    useEffect(() => {
        async function load() {
            try {
                const result = await getPipelineResults(id || 'demo');
                setScanData(result);

                // Layout nodes
                const laid = layoutNodes(result.nodes);
                const flowNodes: Node[] = laid.map((n) => ({
                    id: n.id,
                    type: n.type in nodeTypes ? n.type : 'generic',
                    position: n.position,
                    data: n.data,
                    parentId: n.parentNode,
                    extent: n.extent as 'parent' | undefined,
                    style: n.style as React.CSSProperties | undefined,
                }));

                // Topological sort: parents must precede children
                const nodeById = new Map(flowNodes.map((n) => [n.id, n]));
                function getDepth(n: Node): number {
                    if (!n.parentId) return 0;
                    const parent = nodeById.get(n.parentId);
                    return parent ? getDepth(parent) + 1 : 0;
                }
                const sorted = [...flowNodes].sort((a, b) => getDepth(a) - getDepth(b));

                const flowEdges: Edge[] = result.edges.map((e) => ({
                    id: e.id,
                    source: e.source,
                    target: e.target,
                    label: e.label,
                    animated: e.animated,
                    markerEnd: { type: MarkerType.ArrowClosed, color: (e.style?.stroke as string) || '#737687' },
                    style: e.style as React.CSSProperties,
                    labelStyle: { fill: '#424656', fontSize: 10, fontWeight: 'bold' },
                    labelBgStyle: { fill: '#ffffff', fillOpacity: 0.9 },
                    labelBgPadding: [6, 3] as [number, number],
                    labelBgBorderRadius: 4,
                }));

                setNodes(sorted);
                setEdges(flowEdges);
            } catch (err) {
                console.error('Failed to load scan results:', err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id, setNodes, setEdges]);

    const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
        setSelectedNode(node);
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, []);

    const nodeCount = useMemo(() => scanData?.nodes.length || 0, [scanData]);
    const edgeCount = useMemo(() => scanData?.edges.length || 0, [scanData]);

    if (loading) {
        return <Loader fullScreen message="Loading infrastructure map..." />;
    }

    return (
        <div className="bg-surface text-on-surface overflow-hidden h-screen flex flex-col font-body">
            {/* TopAppBar */}
            <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-6 py-3 h-16 bg-[#f7f9fe] border-b border-surface-container">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">cloud</span>
                    <h1 className="text-lg font-extrabold text-[#181c20] font-headline tracking-tight uppercase">Digital Cartographer</h1>
                </div>
                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex items-center gap-8 font-headline font-bold tracking-tight">
                        <Link to={`/visualize/${id}`} className="text-primary border-b-2 border-primary px-1 py-1">Architecture</Link>
                        <Link to="/configure" className="text-on-secondary-container hover:bg-surface-container-highest px-2 py-1 rounded transition-colors">Configuration</Link>
                    </nav>
                </div>
            </header>

            <div className="flex flex-1 pt-16 overflow-hidden">
                {/* NavigationDrawer */}
                <aside className="fixed left-0 top-0 h-full flex flex-col p-4 pt-20 z-40 bg-[#f1f4f9] w-64 border-r border-surface-container">
                    <div className="flex flex-col mb-8 px-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center overflow-hidden text-primary font-bold">
                                DC
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-on-surface">AWS Navigator</p>
                                <p className="text-xs text-on-secondary-container">Connected</p>
                            </div>
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest text-[#576474]">Project Layers</div>
                    </div>

                    <nav className="flex flex-col gap-1 text-sm font-medium">
                        <button className="flex items-center gap-3 px-3 py-3 bg-white text-primary font-semibold rounded-lg shadow-sm transition-all duration-300">
                            <span className="material-symbols-outlined">hub</span>
                            Architecture
                        </button>
                    </nav>
                    
                    <div className="mt-auto pb-6 px-2">
                         <div className="text-xs font-bold uppercase tracking-widest text-on-secondary-container mb-4">Map Stats</div>
                         <div className="space-y-3">
                              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                                  <span className="text-xs font-bold">Total Resources</span>
                                  <span className="text-xs font-mono font-bold text-primary">{nodeCount}</span>
                              </div>
                              <div className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm">
                                  <span className="text-xs font-bold">Connections</span>
                                  <span className="text-xs font-mono font-bold text-primary">{edgeCount}</span>
                              </div>
                         </div>
                    </div>
                </aside>

                {/* Main Workspace Canvas */}
                <main className="ml-64 flex-1 relative bg-surface-lowest flex items-center justify-center overflow-auto p-8">
                    <div className="relative shadow-sm border border-outline-variant/20 rounded-2xl overflow-hidden bg-surface flex-shrink-0" style={{ width: '1200px', height: '800px' }}>
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onNodeClick={onNodeClick}
                            onPaneClick={onPaneClick}
                            nodeTypes={nodeTypes}
                            fitView
                            fitViewOptions={{ padding: 0.3 }}
                            minZoom={0.1}
                            maxZoom={2}
                            proOptions={{ hideAttribution: true }}
                        >
                            {/* Use CSS logic rather than generic Background styling so it aligns with light theme */}
                            <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#c2c6d9" />
                            
                            <Controls
                                className="!bg-surface-container-lowest !border-outline-variant/20 !rounded-xl !shadow-lg"
                                showInteractive={false}
                            />
                            
                            <MiniMap
                                className="!bg-surface-container-lowest !border-outline-variant/15 !rounded-xl !shadow-sm"
                                nodeColor={(n) => {
                                    switch (n.type) {
                                        case 'vpc': return '#004cca';
                                        case 'subnet': return '#0062ff';
                                        case 'ec2': return '#c84000';
                                        case 'securityGroup': return '#ba1a1a';
                                        case 'igw': return '#0053da';
                                        default: return '#737687';
                                    }
                                }}
                                maskColor="rgba(247, 249, 254, 0.7)"
                            />

                            {/* Top Info Panel */}
                            <Panel position="top-left">
                                <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/15 backdrop-blur-xl">
                                    <span className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="text-sm font-semibold font-headline">Account ID</span>
                                    <span className="text-xs font-mono text-on-secondary-container">{scanData?.account_id}</span>
                                </div>
                            </Panel>

                            {/* Region Panel */}
                            <Panel position="bottom-left">
                                <div className="flex items-center gap-3 px-4 py-2 bg-surface-container-lowest/80 backdrop-blur-md rounded-full shadow-sm border border-outline-variant/15">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">Active Region</span>
                                    <span className="text-xs font-bold text-primary">AWS Cloud</span>
                                </div>
                            </Panel>
                        </ReactFlow>
                    </div>
                </main>

                {/* Right Side Utility/Metadata Panel */}
                {selectedNode && (
                    <aside className="w-80 bg-surface-container-low border-l border-surface-container p-6 flex flex-col gap-6 overflow-y-auto animate-in fade-in slide-in-from-right w-full sm:w-80 absolute right-0 top-16 h-[calc(100vh-64px)] z-50">
                        <div className="flex justify-between items-center mb-2">
                             <div className="text-xs font-bold uppercase tracking-widest text-[#576474]">Resource Details</div>
                             <button
                                 onClick={() => setSelectedNode(null)}
                                 className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-container-highest transition-colors"
                             >
                                 <span className="material-symbols-outlined text-sm">close</span>
                             </button>
                        </div>

                        <div className="space-y-6">
                            {/* Type and Name */}
                            <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-xs font-medium text-on-secondary-container uppercase">{String((selectedNode.data as Record<string, unknown>).resource_type)}</span>
                                </div>
                                <h3 className="text-lg font-bold text-on-surface break-all">{String((selectedNode.data as Record<string, unknown>).label)}</h3>
                                <p className="text-[10px] text-outline font-mono mt-2 break-all">{selectedNode.id}</p>
                            </div>

                            {/* Summary */}
                            {Boolean((selectedNode.data as Record<string, unknown>).summary) && (
                                <div>
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#576474] mb-3">Summary</h4>
                                    <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/10 space-y-2">
                                        {Object.entries((selectedNode.data as Record<string, unknown>).summary as Record<string, unknown>).map(([key, value]) => (
                                            <div key={key} className="flex flex-col border-b border-surface-container-high pb-2 last:border-0 last:pb-0">
                                                <span className="text-[10px] text-on-secondary-container uppercase">{key}</span>
                                                <span className="text-sm font-semibold text-on-surface">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Properties */}
                            {Boolean((selectedNode.data as Record<string, unknown>).properties) &&
                                Object.keys((selectedNode.data as Record<string, unknown>).properties as Record<string, unknown>).length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-[#576474] mb-3">Attributes</h4>
                                        <pre className="bg-inverse-surface text-inverse-on-surface rounded-xl p-4 text-[10px] overflow-x-auto font-mono">
                                            {JSON.stringify(
                                                (selectedNode.data as Record<string, unknown>).properties,
                                                null,
                                                2
                                            )}
                                        </pre>
                                    </div>
                                )}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}
