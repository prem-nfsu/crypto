
import axios from "axios";
import { formatEther } from "ethers";

const ETHERSCAN_API_KEY = "QDZPQ7RP1PKFNZG9592M7ET2Q9TE9KQIJD";
const ETHERSCAN_API_URL = "https://api.etherscan.io/api";

export interface Transaction {
  hash: string;
  blockNumber: string;
  timeStamp: string;
  from: string;
  to: string;
  value: string;
  gasPrice: string;
  gasUsed: string;
  input: string;
  methodId: string;
  functionName: string;
}

export const getAddressBalance = async (address: string): Promise<string> => {
  try {
    const response = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: 'account',
        action: 'balance',
        address: address,
        tag: 'latest',
        apikey: ETHERSCAN_API_KEY
      }
    });

    if (response.data.status === '1') {
      // Convert Wei to ETH
      return formatEther(response.data.result);
    } else {
      throw new Error(response.data.message || 'Failed to fetch balance');
    }
  } catch (error) {
    console.error('Error fetching address balance:', error);
    throw error;
  }
};

export const getAddressTransactions = async (
  address: string, 
  page: number = 1, 
  pageSize: number = 10
): Promise<{ transactions: Transaction[], totalCount: number }> => {
  try {
    const response = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: page,
        offset: pageSize,
        sort: 'desc',
        apikey: ETHERSCAN_API_KEY
      }
    });

    if (response.data.status === '1') {
      return { 
        transactions: response.data.result,
        // Etherscan doesn't provide a total count in the response, so we estimate based on the max (10000)
        totalCount: Math.min(10000, response.data.result.length * 10) 
      };
    } else {
      // If no transactions are found, return an empty array
      if (response.data.message === 'No transactions found') {
        return { transactions: [], totalCount: 0 };
      }
      throw new Error(response.data.message || 'Failed to fetch transactions');
    }
  } catch (error) {
    console.error('Error fetching address transactions:', error);
    throw error;
  }
};

export const isValidEthereumAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const getTransactionMethod = (input: string, functionName: string): string => {
  if (input === '0x') {
    return 'Transfer';
  }
  
  if (functionName) {
    // Extract the function name part before the parameters
    const match = functionName.match(/^([^\(]+)/);
    return match ? match[0] : 'Contract Interaction';
  }
  
  return 'Contract Interaction';
};

export const formatTimeSince = (timestamp: number): string => {
  const now = Date.now();
  const txTime = timestamp * 1000; // Convert to milliseconds
  const diffSeconds = Math.floor((now - txTime) / 1000);
  
  if (diffSeconds < 60) {
    return `${diffSeconds} sec${diffSeconds !== 1 ? 's' : ''} ago`;
  }
  
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
  }
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
};

export const formatWeiToEth = (wei: string): string => {
  const eth = formatEther(wei);
  // If the amount is very small, show scientific notation
  if (Number(eth) < 0.00001) {
    return Number(eth).toExponential(4);
  }
  return Number(eth).toFixed(6);
};

export const calculateTxnFee = (gasUsed: string, gasPrice: string): string => {
  const txnFeeWei = BigInt(gasUsed) * BigInt(gasPrice);
  return formatWeiToEth(txnFeeWei.toString());
};

export const truncateAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
