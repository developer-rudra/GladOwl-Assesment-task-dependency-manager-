import { useMemo, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';

function Graph({ nodes, edges, onNodeClick }) {
  // Transform backend data to React Flow format
  const initialNodes = useMemo(
    () =>
      nodes.map((node, index) => ({
        id: node.id,
        data: {
          label: node.label,
          description: node.description,
        },
        position: {
          // Simple horizontal layout heuristic
          x: (index % 3) * 250 + 50,
          y: Math.floor(index / 3) * 150 + 50,
        },
        style: {
          background: '#ffffff',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '10px 14px',
          fontSize: '14px',
          fontWeight: 600,
          color: '#1e40af',
          width: 180,
          cursor: 'pointer',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      })),
    [nodes]
  );

  const initialEdges = useMemo(
    () =>
      edges.map((edge) => ({
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        animated: true,
        style: { stroke: '#6b7280', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#6b7280',
        },
      })),
    [edges]
  );

  const [flowNodes, setFlowNodes, onNodesChange] = useNodesState(initialNodes);
  const [flowEdges, setFlowEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update when props change
  useMemo(() => {
    setFlowNodes(initialNodes);
    setFlowEdges(initialEdges);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNodes, initialEdges]);

  const onConnect = useCallback(
    (params) => setFlowEdges((eds) => addEdge(params, eds)),
    [setFlowEdges]
  );

  const handleNodeClick = useCallback(
    (_, node) => {
      if (onNodeClick) {
        onNodeClick(node.id);
      }
    },
    [onNodeClick]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#cbd5e1" gap={16} />
        <Controls />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          style={{
            backgroundColor: '#f8fafc',
          }}
        />
      </ReactFlow>
    </div>
  );
}

export default Graph;

