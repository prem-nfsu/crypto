
import { FC, useEffect, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ConnectionLineType,
  MarkerType,
  useReactFlow,
  NodeChange,
  applyNodeChanges
} from 'reactflow';

import TransactionFlowToolbar from './TransactionFlowToolbar';
import TransactionFlowLoading from './TransactionFlowLoading';
import NodeTypeLegend from './NodeTypeLegend';
import { useTransactionFlow } from './hooks/useTransactionFlow';
import { getTransactionFlowConfig } from './TransactionFlowConfig';
import { useGlobalMaxLevel, useSyncMaxLevel } from './hooks/useGlobalMaxLevel';

interface TransactionFlowContentProps {
  address: string;
  onClose: () => void;
}

const TransactionFlowContent: FC<TransactionFlowContentProps> = ({ address, onClose }) => {
  const {
    nodes,
    edges,
    isLoading,
    onNodeClick,
    handleRefresh,
    handleFullExpand,
    handleNextLevel,
    setNodes,
    saveGraphToDatabase,
    loadGraphFromDatabase
  } = useTransactionFlow(address);

  // Get max level from the database-synced hook
  const { maxLevel } = useSyncMaxLevel(address);

  // Get flow configuration
  const { 
    nodeTypes, 
    edgeTypes, 
    connectionLineType, 
    defaultEdgeOptions 
  } = getTransactionFlowConfig();
  
  const reactFlowInstance = useReactFlow();

  // Add effect to log nodes and edges for debugging
  useEffect(() => {
    console.log("TransactionFlow nodes:", nodes);
    console.log("TransactionFlow edges:", edges);
  }, [nodes, edges]);

  // Handler for node drag operations
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes(nodes => applyNodeChanges(changes, nodes));
    },
    [setNodes]
  );

  // Add effect to call fitView with a delay to ensure the graph renders properly
  useEffect(() => {
    if (nodes.length > 0 && !isLoading) {
      const timer = setTimeout(() => {
        try {
          reactFlowInstance.fitView({ padding: 0.4 }); // Increased padding for better overall view
          console.log("Fitting view after layout changes");
          
          // Save graph to database when it changes and is not loading
          saveGraphToDatabase();
        } catch (error) {
          console.error("Error triggering flow update:", error);
        }
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [nodes, isLoading, reactFlowInstance, saveGraphToDatabase]);

  // Initial load from database
  useEffect(() => {
    loadGraphFromDatabase();
  }, [loadGraphFromDatabase]);

  return (
    <div className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={onNodeClick}
        onNodesChange={onNodesChange}
        minZoom={0.15} // Allow more zoom out to see the full graph
        maxZoom={1.5}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineType={connectionLineType}
        fitView
        attributionPosition="bottom-right"
        proOptions={{ hideAttribution: true }}
        className="react-flow-graph"
      >
        <TransactionFlowToolbar 
          onRefresh={handleRefresh} 
          onFullExpand={handleFullExpand}
          onNextLevel={handleNextLevel}
          onClose={onClose}
          maxLevel={maxLevel} 
        />
        
        <NodeTypeLegend />
        
        <TransactionFlowLoading 
          nodesExist={nodes.length > 0} 
          isFullScreen={nodes.length === 0} 
          isLoading={isLoading}
        />
        
        <Controls />
        <MiniMap 
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="bg-black/20 rounded-lg"
        />
        <Background color="#444" gap={16} />
      </ReactFlow>
    </div>
  );
};

export default TransactionFlowContent;
