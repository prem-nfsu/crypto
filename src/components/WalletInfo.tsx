
import { ArrowUpRight, Diamond } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface WalletInfoProps {
  lastTransactionDate: string | null;
  firstTransactionDate: string | null;
  fundingSource: { source: string; txHash: string } | null;
  onAddressClick: (address: string) => void;
}

export const WalletInfo = ({ 
  lastTransactionDate, 
  firstTransactionDate, 
  fundingSource, 
  onAddressClick 
}: WalletInfoProps) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">More Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-sm text-muted-foreground uppercase">PRIVATE NAME TAGS</h3>
          <Button variant="outline" size="sm" className="mt-1">
            + Add
          </Button>
        </div>
        
        <div>
          <h3 className="text-sm text-muted-foreground uppercase">TRANSACTIONS SENT</h3>
          <div className="flex flex-wrap gap-4 mt-1">
            {lastTransactionDate || firstTransactionDate ? (
              <>
                {lastTransactionDate && (
                  <div>
                    <span className="text-sm font-medium">Latest:</span>{" "}
                    <span className="flex items-center text-sm">
                      {lastTransactionDate} <ArrowUpRight className="h-3 w-3 ml-1" />
                    </span>
                  </div>
                )}
                {firstTransactionDate && (
                  <div>
                    <span className="text-sm font-medium">First:</span>{" "}
                    <span className="flex items-center text-sm">
                      {firstTransactionDate} <ArrowUpRight className="h-3 w-3 ml-1" />
                    </span>
                  </div>
                )}
              </>
            ) : (
              <span className="text-sm text-muted-foreground">No transaction history</span>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm text-muted-foreground uppercase">FUNDED BY</h3>
          {fundingSource ? (
            <div className="mt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Diamond className="h-4 w-4 text-blue-400 flex-shrink-0" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-blue-500 font-normal text-xs truncate max-w-[140px]"
                        onClick={() => onAddressClick(fundingSource.source)}
                      >
                        {fundingSource.source}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{fundingSource.source}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="mt-1 ml-6">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-blue-500 font-normal text-xs"
                  onClick={() => onAddressClick(fundingSource.txHash)}
                >
                  at txn {fundingSource.txHash.slice(0, 10)}...
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm mt-1">No funding source found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
