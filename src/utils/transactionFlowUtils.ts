
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

// Re-exporting functions and types from api/etherscanApi.ts
export { 
  fetchAddressTransactions,
  fetchAddressDetails,
  fetchRelatedTransactions,
  getEtherscanApiKey,
  setEtherscanApiKey,
  type AddressDetails
} from './api/etherscanApi';

// Re-exporting from graph/transactionGraph.ts
export { generateTransactionFlowData } from './graph/transactionGraph';

// Re-exporting from types/transactionTypes.ts
export { type Transaction, type TransactionFlowData } from './types/transactionTypes';

// Re-exporting from formatting/transactionFormatters.ts if needed
export {
  formatEtherValue,
  formatTimestamp,
  formatAddress,
  formatEtherWithPrice,
  formatGasPrice,
  getTransactionType
} from './formatting/transactionFormatters';

// Re-exporting from transactionUtils.ts if needed
export {
  calculateUsdValue,
  calculateGasFees
} from './transactionUtils';

