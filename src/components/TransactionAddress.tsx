
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

interface TransactionAddressProps {
  label: string;
  address: string;
  onCopy: (text: string, label: string) => Promise<void>;
  copiedAddress: string | null;
  onAddressClick: (address: string) => void;
}

export const TransactionAddress = ({ 
  label, 
  address, 
  onCopy, 
  copiedAddress,
  onAddressClick 
}: TransactionAddressProps) => {
  return (
    <div className="flex items-start gap-2">
      <div className="w-48 flex-shrink-0">
        <label className="text-sm font-medium text-muted-foreground">{label}:</label>
      </div>
      <div className="flex-grow">
        <div className="group relative">
          <div 
            className="flex items-center gap-2 cursor-pointer hover:bg-secondary/50 p-2 rounded-lg transition-colors"
            onClick={() => onAddressClick(address)}
          >
            <p className="font-mono text-sm break-all">
              {address}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onCopy(address, label);
            }}
          >
            {copiedAddress === address ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
