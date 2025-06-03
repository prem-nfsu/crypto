
import { useState } from "react";
import { ChevronsDown, ChevronsUp, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TokenHolding {
  tokenName: string;
  tokenSymbol: string;
  balance: string;
  tokenDecimals: string;
  contractAddress: string;
  usdValue: number;
}

interface TokenHoldingsProps {
  tokenHoldings: TokenHolding[];
  totalTokenValue: number;
}

export const TokenHoldings = ({ tokenHoldings, totalTokenValue }: TokenHoldingsProps) => {
  const [showAllTokens, setShowAllTokens] = useState(false);
  const displayedTokens = showAllTokens ? tokenHoldings : tokenHoldings.slice(0, 3);

  return (
    <div>
      {tokenHoldings.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium flex items-center gap-1">
              <CreditCard className="h-4 w-4 text-indigo-500" />
              ${totalTokenValue.toFixed(2)}
            </span>
            <Badge variant="outline" className="text-xs font-normal">
              {tokenHoldings.length} Token{tokenHoldings.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="space-y-2 bg-secondary/30 p-3 rounded-md">
            {displayedTokens.map((token, index) => (
              <div key={index} className="flex justify-between items-center text-sm py-1 border-b border-secondary/50 last:border-0">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-medium text-indigo-600">
                    {token.tokenSymbol.substring(0, 1)}
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center gap-1 cursor-pointer">
                          <span className="truncate max-w-[100px]">{token.tokenName}</span>
                          <span className="text-xs text-muted-foreground">({token.tokenSymbol})</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{token.tokenName} ({token.tokenSymbol})</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {token.contractAddress.slice(0, 6)}...{token.contractAddress.slice(-4)}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <a 
                    href={`https://etherscan.io/token/${token.contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono">{token.balance}</span>
                  <span className="text-xs text-muted-foreground">${(token.usdValue).toFixed(2)}</span>
                </div>
              </div>
            ))}
            
            {tokenHoldings.length > 3 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs flex items-center justify-center gap-1 mt-2"
                onClick={() => setShowAllTokens(!showAllTokens)}
              >
                {showAllTokens ? (
                  <>
                    <ChevronsUp className="h-3 w-3" />
                    Show Less
                  </>
                ) : (
                  <>
                    <ChevronsDown className="h-3 w-3" />
                    Show All ({tokenHoldings.length - 3} more)
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 bg-muted/20 rounded-md">
          <p className="text-muted-foreground text-sm">No token holdings found</p>
        </div>
      )}
    </div>
  );
};
