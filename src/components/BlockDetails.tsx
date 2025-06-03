
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatTimestamp } from "@/utils/transactionUtils";

interface BlockDetailsProps {
  blockData: {
    blockNumber: string;
    timeStamp: string;
    blockMiner: string;
    blockReward: string;
    uncles: Array<{
      miner: string;
      unclePosition: string;
      blockreward: string;
    }>;
    uncleInclusionReward: string;
  };
}

export const BlockDetails = ({ blockData }: BlockDetailsProps) => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const { toast } = useToast();

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      toast({
        description: `${label} copied to clipboard`,
      });
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      toast({
        variant: "destructive",
        description: "Failed to copy to clipboard",
      });
    }
  };

  const timestampInSecs = parseInt(blockData.timeStamp);
  const formattedTimestamp = formatTimestamp(timestampInSecs);

  // Convert wei to ETH
  const weiToEth = (wei: string) => {
    return (parseInt(wei) / 1e18).toFixed(18).replace(/\.?0+$/, "");
  };

  return (
    <Card className="w-full max-w-2xl p-6 glass animate-fade-up space-y-4">
      <h2 className="text-2xl font-bold mb-4">Block #{blockData.blockNumber} Details</h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-48 flex-shrink-0">
            <label className="text-sm font-medium text-muted-foreground">Timestamp:</label>
          </div>
          <p className="text-sm">
            {formattedTimestamp.timeAgo} ({formattedTimestamp.fullDate})
          </p>
        </div>

        <div className="flex items-start gap-2">
          <div className="w-48 flex-shrink-0">
            <label className="text-sm font-medium text-muted-foreground">Block Miner:</label>
          </div>
          <div className="flex-grow">
            <div className="group relative">
              <p className="font-mono text-sm break-all">{blockData.blockMiner}</p>
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => handleCopy(blockData.blockMiner, "Block miner address")}
              >
                {copiedText === blockData.blockMiner ? (
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
            <label className="text-sm font-medium text-muted-foreground">Block Reward:</label>
          </div>
          <p className="font-mono text-sm">{weiToEth(blockData.blockReward)} ETH</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-48 flex-shrink-0">
            <label className="text-sm font-medium text-muted-foreground">Uncle Inclusion Reward:</label>
          </div>
          <p className="font-mono text-sm">{weiToEth(blockData.uncleInclusionReward)} ETH</p>
        </div>
      </div>

      {blockData.uncles && blockData.uncles.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Uncles</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Position</TableHead>
                <TableHead>Miner</TableHead>
                <TableHead>Reward</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockData.uncles.map((uncle, index) => (
                <TableRow key={index}>
                  <TableCell>{uncle.unclePosition}</TableCell>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center">
                      <span className="truncate max-w-[200px]">{uncle.miner}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-2"
                        onClick={() => handleCopy(uncle.miner, "Uncle miner address")}
                      >
                        {copiedText === uncle.miner ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{weiToEth(uncle.blockreward)} ETH</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};
