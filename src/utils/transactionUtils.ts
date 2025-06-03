
import { formatEther, formatUnits } from "ethers";
import { 
  formatAddress, 
  formatRelativeTimestamp, 
  formatEtherWithPrice, 
  formatGasPrice,
  getTransactionType 
} from "./formatting/transactionFormatters";

export { 
  formatAddress, 
  formatRelativeTimestamp as formatTimestamp, 
  getTransactionType 
};

export const calculateUsdValue = (ethAmount: bigint, ethPrice: number): string => {
  const ethValue = Number(formatEther(ethAmount));
  return (ethValue * ethPrice).toFixed(2);
};

export const calculateGasFees = (transaction: {
  gasUsed?: bigint;
  gasPrice: bigint;
  baseFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  maxFeePerGas?: bigint;
}, ethPrice: number) => {
  if (!transaction.gasUsed || !transaction.gasPrice) return null;

  const gasUsed = transaction.gasUsed;
  const baseFee = transaction.baseFeePerGas || 0n;
  const priorityFee = transaction.maxPriorityFeePerGas || 0n;
  const maxFee = transaction.maxFeePerGas || transaction.gasPrice;

  const actualGasPrice = transaction.gasPrice;
  const totalFee = actualGasPrice * gasUsed;

  const burntFees = baseFee * gasUsed;

  const maxPotentialFee = maxFee * gasUsed;
  const savings = maxPotentialFee - totalFee;

  return {
    burntFeesEth: formatEther(burntFees),
    burntFeesUsd: calculateUsdValue(burntFees, ethPrice),
    savingsEth: formatEther(savings),
    savingsUsd: calculateUsdValue(savings, ethPrice),
    baseFeeGwei: formatUnits(baseFee, 'gwei'),
    maxFeeGwei: formatUnits(maxFee, 'gwei'),
    priorityFeeGwei: formatUnits(priorityFee, 'gwei')
  };
};
