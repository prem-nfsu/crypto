
import { FC } from 'react';
import { ConnectionLineType, NodeTypes, EdgeTypes, MarkerType } from 'reactflow';
import AddressNode from '../AddressNode';
import TransactionEdge from '../TransactionEdge';

// Define node and edge types
const nodeTypes: NodeTypes = { address: AddressNode };
const edgeTypes: EdgeTypes = { transaction: TransactionEdge };

// Define default edge options
const defaultEdgeOptions = {
  animated: true,
  type: 'transaction',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    color: '#ffffff',
  },
  style: {
    strokeWidth: 2,
  },
};

export interface TransactionFlowConfigProps {
  nodeTypes?: NodeTypes;
  edgeTypes?: EdgeTypes;
  connectionLineType?: ConnectionLineType;
  defaultEdgeOptions?: any;
}

// Export the configuration as a constant object instead of a component
export const getTransactionFlowConfig = () => ({
  nodeTypes,
  edgeTypes,
  connectionLineType: ConnectionLineType.Bezier,
  defaultEdgeOptions,
});

// Create a proper FC that returns React elements if we need the component form
const TransactionFlowConfig: FC<TransactionFlowConfigProps> = () => {
  // This component doesn't render anything visible
  return null;
};

export default TransactionFlowConfig;
