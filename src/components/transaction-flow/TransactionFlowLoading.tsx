
import { FC } from 'react';
import { Panel } from 'reactflow';
import { Loader2 } from 'lucide-react';

interface TransactionFlowLoadingProps {
  isFullScreen?: boolean;
  nodesExist?: boolean;
  isLoading?: boolean; // Add isLoading prop to control visibility
}

const TransactionFlowLoading: FC<TransactionFlowLoadingProps> = ({ 
  isFullScreen = false,
  nodesExist = false,
  isLoading = false
}) => {
  // Only show loading indicators if isLoading is true
  if (!isLoading) return null;
  
  if (isFullScreen && !nodesExist) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black/90">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <span className="text-white text-lg">Loading transaction data...</span>
      </div>
    );
  }
  
  if (nodesExist) {
    return (
      <Panel position="top-center">
        <div className="bg-background/80 px-3 py-1 rounded-full flex items-center gap-2 shadow-md">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm">Loading more data...</span>
        </div>
      </Panel>
    );
  }
  
  return null;
};

export default TransactionFlowLoading;
