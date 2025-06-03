
import { FC, MouseEvent } from 'react';
import { getBezierPath, EdgeProps } from 'reactflow';
import { formatEtherValue, formatTimestamp } from '@/utils/formatting/transactionFormatters';

const TransactionEdge: FC<EdgeProps> = ({ 
  id, 
  source, 
  target, 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  sourcePosition, 
  targetPosition, 
  style = {}, 
  data, 
  markerEnd,
  selected
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleEdgeClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (data?.hash) {
      window.open(`https://etherscan.io/tx/${data.hash}`, '_blank');
    }
  };

  // Make sure we have a fallback for direction if data is incomplete
  const isIncoming = data?.direction === 'incoming';
  const isHighValue = data?.value && BigInt(data.value) > BigInt(1000000000000000000); // > 1 ETH
  
  // Different styling based on transaction direction and value
  const labelBgColor = isIncoming 
    ? isHighValue ? 'rgba(22, 163, 74, 0.95)' : 'rgba(67, 160, 71, 0.9)' 
    : isHighValue ? 'rgba(225, 29, 72, 0.95)' : 'rgba(255, 0, 114, 0.9)';
  
  const formattedDate = data?.timestamp ? formatTimestamp(data.timestamp) : '';
  const truncatedHash = data?.hash ? `${data.hash.slice(0, 6)}...${data.hash.slice(-4)}` : '';
  
  // Updated edge colors to match image (green for incoming, pink/red for outgoing)
  const edgeColor = isIncoming ? '#4ade80' : '#f43f5e';
  const edgeStrokeWidth = isHighValue ? 3 : 2;
  const edgeStroke = selected ? 'white' : edgeColor;
  
  // Make edges more visible with dashed style as shown in the image
  const strokeDasharray = data?.direction === 'incoming' ? undefined : '5,5';

  return (
    <>
      <path
        id={id}
        style={{
          ...style,
          stroke: edgeStroke,
          strokeWidth: selected ? edgeStrokeWidth + 1 : edgeStrokeWidth,
          strokeDasharray: strokeDasharray,
        }}
        d={edgePath}
        className="react-flow__edge-path cursor-pointer"
        markerEnd={markerEnd}
        onClick={handleEdgeClick}
      />
      {data && (
        <>
          <foreignObject
            width={160}
            height={50}
            x={labelX - 80}
            y={labelY - 25}
            className="overflow-visible pointer-events-none"
            requiredExtensions="http://www.w3.org/1999/xhtml"
          >
            <div className="flex flex-col items-center justify-center">
              <div 
                className="px-2 py-1 rounded text-xs text-white max-w-[160px] truncate text-center shadow-md"
                style={{ backgroundColor: labelBgColor }}
              >
                <div className="font-bold">{formatEtherValue(data.value || '0')}</div>
                <div className="text-[10px] opacity-90">{truncatedHash || 'Unknown'}</div>
                <div className="text-[8px] opacity-80">{formattedDate || 'Unknown date'}</div>
              </div>
            </div>
          </foreignObject>
        </>
      )}
    </>
  );
};

export default TransactionEdge;
