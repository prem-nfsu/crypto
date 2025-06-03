
import { Coins, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WalletOverviewProps {
  balance: string | null;
  ethPrice: number;
  tokenHoldings: {
    tokenName: string;
    tokenSymbol: string;
    balance: string;
    tokenDecimals: string;
    contractAddress: string;
    usdValue: number;
  }[];
}

export const WalletOverview = ({ balance, ethPrice, tokenHoldings }: WalletOverviewProps) => {
  // Calculate ETH value in USD
  const ethValueUsd = balance ? (parseFloat(balance) * ethPrice).toFixed(2) : '0.00';
  
  // Calculate total token value
  const totalTokenValue = tokenHoldings.reduce((sum, token) => sum + token.usdValue, 0);
  
  // Calculate total portfolio value
  const totalPortfolioValue = (parseFloat(ethValueUsd) + totalTokenValue).toFixed(2);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-50/50">
            <h3 className="text-sm text-muted-foreground uppercase font-medium">ETH BALANCE</h3>
            <p className="font-mono text-2xl flex items-center gap-1 mt-1">
              <Coins className="h-5 w-5 text-blue-500" />
              {balance ? parseFloat(balance).toFixed(8) : '0'} ETH
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-green-50/50">
            <h3 className="text-sm text-muted-foreground uppercase font-medium">ETH VALUE</h3>
            <p className="font-mono text-2xl mt-1">
              ${ethValueUsd}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              @ ${ethPrice.toFixed(2)}/ETH
            </p>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-50/50">
            <h3 className="text-sm text-muted-foreground uppercase font-medium">PORTFOLIO VALUE</h3>
            <p className="font-mono text-2xl flex items-center gap-1 mt-1">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              ${totalPortfolioValue}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span className="flex items-center">
                <Coins className="h-3 w-3 mr-1" /> ${ethValueUsd}
              </span>
              <span>+</span>
              <span className="flex items-center">
                <CreditCard className="h-3 w-3 mr-1" /> ${totalTokenValue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
