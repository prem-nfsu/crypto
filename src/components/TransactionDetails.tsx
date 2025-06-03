import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatEther } from "ethers";
import { Copy, Check, Coins } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransactionAddress } from "@/components/TransactionAddress";
import { GasInformation } from "@/components/GasInformation";
import { 
  formatRelativeTimestamp, 
  getTransactionType 
} from "@/utils/formatting/transactionFormatters";
import { calculateGasFees, calculateUsdValue } from "@/utils/transactionUtils";

interface TransactionDetailsProps {
  transaction: {
    hash: string;
    blockNumber: number;
    from: string;
    to: string;
    value: bigint;
    gasPrice: bigint;
    gasLimit: bigint;
    nonce: number;
    status?: number;
    timestamp?: number;
    maxFeePerGas?: bigint;
    maxPriorityFeePerGas?: bigint;
    baseFeePerGas?: bigint;
    gasUsed?: bigint;
    type?: number;
  };
  currentBlockNumber?: number;
  onAddressSearch?: (address: string) => void;
}

export const TransactionDetails = ({ 
  transaction, 
  currentBlockNumber,
  onAddressSearch 
}: TransactionDetailsProps) => {
  const [ethPrice, setEthPrice] = useState<number>(0);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEthPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    };

    fetchEthPrice();
    const interval = setInterval(fetchEthPrice, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      toast({
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy to clipboard",
      });
    }
  };

  const handleAddressClick = (address: string) => {
    if (onAddressSearch) {
      onAddressSearch(address);
    }
  };

  const getBlockConfirmations = () => {
    if (!currentBlockNumber || !transaction.blockNumber) return 0;
    return currentBlockNumber - transaction.blockNumber;
  };

  const handleCopyAll = async () => {
    const allDetails = `Transaction Details:
Hash: ${transaction.hash}
Status: ${transaction.status === 1 ? 'Success' : 'Failed'}
Block: ${transaction.blockNumber}
${transaction.timestamp ? `Timestamp: ${formatRelativeTimestamp(transaction.timestamp).timeAgo} (${formatRelativeTimestamp(transaction.timestamp).fullDate})` : ''}
From: ${transaction.from}
To: ${transaction.to}
Value: ${formatEther(transaction.value)} ETH
Gas Price: ${transaction.gasPrice.toString()}
Gas Limit: ${transaction.gasLimit.toString()}
Gas Used: ${transaction.gasUsed?.toString() || 'N/A'}
Nonce: ${transaction.nonce}
Type: ${transaction.type || 'Legacy'}`;

    try {
      await navigator.clipboard.writeText(allDetails);
      toast({
        description: "All details copied to clipboard",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy to clipboard",
      });
    }
  };

  const gasFees = calculateGasFees(transaction, ethPrice);
  const blockConfirmations = getBlockConfirmations();
  const gasUsagePercentage = transaction.gasUsed 
    ? Math.round((Number(transaction.gasUsed) / Number(transaction.gasLimit)) * 100)
    : 0;

  return (
    <Card className="w-full max-w-2xl p-6 glass animate-fade-up space-y-4">
      <div className="space-y-4">
        <div className="flex items-start gap-2">
          <div className="w-48 flex-shrink-0">
            <label className="text-sm font-medium text-muted-foreground">Transaction Hash:</label>
          </div>
          <div className="flex-grow">
            <div className="group relative">
              <p className="font-mono text-sm break-all">{transaction.hash}</p>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy(transaction.hash, "Transaction hash")}
              >
                {copiedAddress === transaction.hash ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-48 flex-shrink-0">
            <label className="text-sm font-medium text-muted-foreground">Status:</label>
          </div>
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            transaction.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {transaction.status === 1 ? 'Success' : 'Failed'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-48 flex-shrink-0">
            <label className="text-sm font-medium text-muted-foreground">Block:</label>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{transaction.blockNumber}</span>
            <span className="text-sm text-muted-foreground">
              {blockConfirmations} Block Confirmation{blockConfirmations !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {transaction.timestamp && (
          <div className="flex items-center gap-2">
            <div className="w-48 flex-shrink-0">
              <label className="text-sm font-medium text-muted-foreground">Timestamp:</label>
            </div>
            <p className="text-sm">
              {formatRelativeTimestamp(transaction.timestamp).timeAgo} ({formatRelativeTimestamp(transaction.timestamp).fullDate})
            </p>
          </div>
        )}

        <TransactionAddress 
          label="From"
          address={transaction.from}
          onCopy={handleCopy}
          copiedAddress={copiedAddress}
          onAddressClick={handleAddressClick}
        />

        <TransactionAddress 
          label="To"
          address={transaction.to}
          onCopy={handleCopy}
          copiedAddress={copiedAddress}
          onAddressClick={handleAddressClick}
        />

        <div className="flex items-center gap-2">
          <div className="w-48 flex-shrink-0">
            <label className="text-sm font-medium text-muted-foreground">Value:</label>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            <span className="font-mono text-sm">{formatEther(transaction.value)} ETH</span>
            <span className="text-sm text-muted-foreground">
              (${calculateUsdValue(transaction.value, ethPrice)})
            </span>
          </div>
        </div>

        <GasInformation 
          transaction={transaction}
          gasFees={gasFees}
          gasUsagePercentage={gasUsagePercentage}
        />

        <div className="flex items-start gap-2">
          <div className="w-48 flex-shrink-0">
            <label className="text-sm font-medium text-muted-foreground">Other Attributes:</label>
          </div>
          <div className="space-y-1">
            <p className="text-sm">Txn Type: {getTransactionType(transaction.type)}</p>
            <p className="text-sm">Nonce: {transaction.nonce}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          variant="outline"
          className="flex items-center gap-2"
          onClick={handleCopyAll}
        >
          <Copy className="h-4 w-4" />
          Copy All Details
        </Button>
      </div>
    </Card>
  );
};
