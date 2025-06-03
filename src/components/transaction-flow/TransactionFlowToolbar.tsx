
import { FC } from 'react';
import { Panel, useReactFlow } from 'reactflow';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RefreshCw, Expand, ArrowUpRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

interface TransactionFlowToolbarProps {
  onRefresh: () => void;
  onFullExpand: () => void;
  onClose: () => void;
  onNextLevel?: () => void;
  maxLevel: number;
}

const TransactionFlowToolbar: FC<TransactionFlowToolbarProps> = ({ 
  onRefresh, 
  onFullExpand, 
  onClose,
  onNextLevel,
  maxLevel
}) => {
  const { zoomIn, zoomOut } = useReactFlow();
  
  return (
    <Panel position="top-right" className="flex gap-2 items-center mr-2">
      <div className="bg-slate-800 text-white px-3 py-1 rounded-md flex items-center mr-2">
        <Label className="mr-2 text-xs">Max Level:</Label>
        <span className="font-mono font-bold">{maxLevel}</span>
      </div>
      
      <Button variant="secondary" size="sm" onClick={() => zoomIn()}>
        <ZoomIn className="h-4 w-4 mr-1" />
        Zoom In
      </Button>
      <Button variant="secondary" size="sm" onClick={() => zoomOut()}>
        <ZoomOut className="h-4 w-4 mr-1" />
        Zoom Out
      </Button>
      <Button variant="secondary" size="sm" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4 mr-1" />
        Refresh
      </Button>
      {onNextLevel && (
        <Button variant="secondary" size="sm" onClick={onNextLevel}>
          <ArrowUpRight className="h-4 w-4 mr-1" />
          Next Level
        </Button>
      )}
      <Button variant="secondary" size="sm" onClick={onFullExpand}>
        <Expand className="h-4 w-4 mr-1" />
        Expand All
      </Button>
      <Button variant="secondary" size="sm" onClick={onClose}>
        Close
      </Button>
    </Panel>
  );
};

export default TransactionFlowToolbar;
