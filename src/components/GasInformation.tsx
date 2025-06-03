
import { formatUnits, formatEther } from "ethers";
import { Flame, Coins } from "lucide-react";

interface GasInformationProps {
  transaction: {
    gasPrice: bigint;
    gasLimit: bigint;
    gasUsed?: bigint;
    type?: number;
  };
  gasFees: {
    baseFeeGwei: string;
    maxFeeGwei: string;
    priorityFeeGwei: string;
    burntFeesEth: string;
    burntFeesUsd: string;
    savingsEth: string;
    savingsUsd: string;
  } | null;
  gasUsagePercentage: number;
}

export const GasInformation = ({ transaction, gasFees, gasUsagePercentage }: GasInformationProps) => {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-48 flex-shrink-0">
            <label className="text-sm font-medium text-muted-foreground">Gas Price:</label>
          </div>
          <p className="font-mono text-sm">
            {formatUnits(transaction.gasPrice, 'gwei')} Gwei ({formatEther(transaction.gasPrice)} ETH)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-48 flex-shrink-0">
            <label className="text-sm font-medium text-muted-foreground">Gas Limit & Usage:</label>
          </div>
          <p className="font-mono text-sm">
            {transaction.gasLimit.toString()} | {transaction.gasUsed?.toString() || 'N/A'} ({gasUsagePercentage}%)
          </p>
        </div>

        {transaction.type === 2 && gasFees && (
          <div className="flex items-start gap-2">
            <div className="w-48 flex-shrink-0">
              <label className="text-sm font-medium text-muted-foreground">Gas Fees:</label>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-sm">
                Base: {gasFees.baseFeeGwei} Gwei
              </p>
              <p className="font-mono text-sm">
                Max Fee: {gasFees.maxFeeGwei} Gwei
              </p>
              <p className="font-mono text-sm">
                Max Priority: {gasFees.priorityFeeGwei} Gwei
              </p>
            </div>
          </div>
        )}
      </div>

      {gasFees && (
        <div className="flex items-start gap-2">
          <div className="w-48 flex-shrink-0">
            <label className="text-sm font-medium text-muted-foreground">Burnt & Txn Savings:</label>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-sm">
                Burnt: {gasFees.burntFeesEth} ETH (${gasFees.burntFeesUsd})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4 text-green-500" />
              <span className="text-sm">
                Txn Savings: {gasFees.savingsEth} ETH (${gasFees.savingsUsd})
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
