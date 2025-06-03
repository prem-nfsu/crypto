
import { FC } from 'react';
import { Panel } from 'reactflow';

interface LegendItem {
  color: string;
  label: string;
  borderColor?: string;
}

const NodeTypeLegend: FC = () => {
  const legendItems: LegendItem[] = [
    { color: 'bg-primary', label: 'Central Address', borderColor: 'border-primary' },
    { color: 'bg-blue-900/80', label: 'Sender Address', borderColor: 'border-blue-500' },
    { color: 'bg-amber-800/80', label: 'Recipient Address', borderColor: 'border-amber-500' },
  ];

  const edgeItems: LegendItem[] = [
    { color: 'bg-green-500', label: 'Incoming Transaction' },
    { color: 'bg-rose-500', label: 'Outgoing Transaction' },
  ];

  return (
    <Panel position="bottom-left" className="ml-2 mb-12 p-3 bg-card/80 backdrop-blur-sm rounded-md border border-border shadow">
      <div className="text-xs font-semibold mb-2">Node Types</div>
      <div className="space-y-2">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded ${item.color} ${item.borderColor ? `border-l-4 ${item.borderColor}` : ''}`}></div>
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>
      
      <div className="text-xs font-semibold mt-3 mb-2">Transaction Types</div>
      <div className="space-y-2">
        {edgeItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className={`w-8 h-1 rounded ${item.color}`}></div>
            <span className="text-xs">{item.label}</span>
          </div>
        ))}
      </div>
    </Panel>
  );
};

export default NodeTypeLegend;
