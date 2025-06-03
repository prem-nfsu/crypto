
import { FC } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Coins } from 'lucide-react';

interface AddressNodeData {
  label: string;
  address: string;
  isCentral?: boolean;
  direction?: 'sender' | 'recipient';
  balanceEth?: string;
  txCount?: number;
  isExpanded?: boolean;
  level?: number;
}

const AddressNode: FC<NodeProps<AddressNodeData>> = ({ data, selected }) => {
  // Maximum levels for the transaction graph (central=0, first=1)
  const MAX_LEVELS = 2;
  
  // Determine if this node can be expanded further
  const canExpandFurther = (data.level === undefined || data.level < MAX_LEVELS) && !data.isExpanded;
  
  // Level indicator text
  const getLevelText = () => {
    if (data.isCentral) return "Central";
    if (data.level === undefined) return "";
    return `Level ${data.level}`;
  };
  
  // Determine the width based on level - making higher level nodes slightly smaller
  const getNodeWidth = () => {
    if (data.isCentral) return "min-w-[180px]";
    if (data.level === 2) return "min-w-[160px]";
    return "min-w-[170px]";
  };
  
  return (
    <div 
      className={`px-4 py-2 rounded-md shadow-md ${
        selected ? 'ring-2 ring-primary ring-offset-2' : ''
      } ${
        data.isCentral 
          ? 'bg-primary text-white font-bold ' + getNodeWidth()
          : data.direction === 'sender'
            ? 'bg-blue-900/80 text-white border-l-4 border-blue-500 ' + getNodeWidth()
            : 'bg-amber-800/80 text-white border-r-4 border-amber-500 ' + getNodeWidth()
      }`}
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          {data.direction === 'sender' && (
            <span className="text-blue-300 text-xs font-bold">FROM</span>
          )}
          <div className="text-center flex-1 font-mono">
            {data.label}
          </div>
          {data.direction === 'recipient' && (
            <span className="text-amber-300 text-xs font-bold">TO</span>
          )}
        </div>
        
        <div className="text-xs opacity-70 text-center">
          {getLevelText()}
        </div>
        
        {data.balanceEth && (
          <div className="flex items-center justify-center text-xs gap-1 opacity-80">
            <Coins className="h-3 w-3" />
            <span>{data.balanceEth} ETH</span>
          </div>
        )}
        
        {data.txCount !== undefined && (
          <div className="text-xs opacity-70 text-center">
            {data.txCount} transactions
          </div>
        )}
        
        {canExpandFurther && data.direction === 'recipient' && (
          <div className="text-xs text-center mt-1 bg-amber-700/50 rounded-sm px-1 py-0.5">
            Click to expand
          </div>
        )}
        
        {!canExpandFurther && !data.isCentral && data.level === MAX_LEVELS && (
          <div className="text-xs text-center mt-1 bg-gray-700/50 rounded-sm px-1 py-0.5">
            Max depth reached
          </div>
        )}
      </div>
      
      {data.direction === 'sender' ? (
        <Handle 
          type="source" 
          position={Position.Right} 
          className="w-2 h-2 bg-blue-500 border-none"
        />
      ) : data.direction === 'recipient' ? (
        <>
          <Handle 
            type="target" 
            position={Position.Left} 
            className="w-2 h-2 bg-amber-500 border-none" 
          />
          <Handle 
            type="source" 
            position={Position.Right} 
            className="w-2 h-2 bg-amber-500 border-none"
          />
        </>
      ) : (
        <>
          <Handle 
            type="source" 
            position={Position.Right} 
            className="w-2 h-2 bg-primary border-none"
          />
          <Handle 
            type="target" 
            position={Position.Left} 
            className="w-2 h-2 bg-primary border-none" 
          />
        </>
      )}
    </div>
  );
};

export default AddressNode;
