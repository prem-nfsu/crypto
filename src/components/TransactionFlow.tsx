
import { ReactFlowProvider } from 'reactflow';
import 'reactflow/dist/style.css';
import TransactionFlowContent from './transaction-flow/TransactionFlowContent';

interface TransactionFlowProps {
  address: string;
  onClose: () => void;
}

const TransactionFlow = (props: TransactionFlowProps) => {
  // Add console.log to track rendering of the component
  console.log("Rendering TransactionFlow component for address:", props.address);

  // Wrap with ReactFlowProvider to ensure access to the ReactFlow context
  // Set explicit dimensions to ensure the container is visible
  return (
    <div className="w-full h-[700px] rounded-lg overflow-hidden border border-border bg-background">
      <ReactFlowProvider>
        <TransactionFlowContent {...props} />
      </ReactFlowProvider>
    </div>
  );
};

export default TransactionFlow;
