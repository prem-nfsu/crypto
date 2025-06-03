
import { Copy, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AddressHeaderProps {
  address: string;
  onCopy: (text: string) => Promise<void>;
}

export const AddressHeader = ({ 
  address, 
  onCopy
}: AddressHeaderProps) => {
  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 016 0v2h2V7a5 5 0 00-5-5z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold">Address</h2>
          <div className="flex items-center">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <code className="text-sm bg-slate-100 px-2 py-1 rounded cursor-pointer hover:bg-slate-200 transition-colors">
                    {address}
                  </code>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Click to copy address</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 ml-1"
                onClick={() => onCopy(address)}
                title="Copy address"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <a 
                href={`https://etherscan.io/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                title="View on Etherscan"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
