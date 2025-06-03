
import { formatEther, formatUnits } from "ethers";

export const formatEtherValue = (value: string): string => {
  const etherValue = parseInt(value) / 1e18;
  if (etherValue < 0.001) {
    return "<0.001 ETH";
  }
  return `${etherValue.toFixed(3)} ETH`;
};

export const formatTimestamp = (timestamp: string | number): string => {
  const timestampNum = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
  const date = new Date(timestampNum * 1000);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
};

export const formatRelativeTimestamp = (timestamp: number) => {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  let timeAgo;
  if (diff < 60) timeAgo = `${diff} secs ago`;
  else if (diff < 3600) timeAgo = `${Math.floor(diff / 60)} mins ago`;
  else if (diff < 86400) timeAgo = `${Math.floor(diff / 3600)} hrs ago`;
  else timeAgo = `${Math.floor(diff / 86400)} days ago`;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getUTCMonth()];
  const day = date.getUTCDate();
  const year = date.getUTCFullYear();
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = (hours % 12 || 12).toString().padStart(2, '0');

  const fullDate = `${month}-${day}-${year} ${formattedHours}:${minutes}:${seconds} ${ampm} UTC`;

  return {
    timeAgo,
    fullDate
  };
};

export const formatAddress = (address: string, isExpanded: boolean) => {
  return isExpanded ? address : `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatEtherWithPrice = (amount: bigint, ethPrice: number): { formatted: string, usdValue: string } => {
  const ethValue = Number(formatEther(amount));
  return {
    formatted: ethValue.toFixed(6) + " ETH",
    usdValue: (ethValue * ethPrice).toFixed(2)
  };
};

export const formatGasPrice = (gasPrice: bigint): string => {
  return formatUnits(gasPrice, 'gwei') + " Gwei";
};

export const getTransactionType = (type?: number) => {
  switch (type) {
    case 2:
      return "2 (EIP-1559)";
    case 1:
      return "1 (EIP-2930)";
    case 0:
      return "Legacy";
    default:
      return "Unknown";
  }
};
