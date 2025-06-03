import axios from "axios";
import { Transaction } from "../types/transactionTypes";

// Default API key that can be overridden
const DEFAULT_API_KEY = "ZJGPNVKI9W7BQAD85BZC7PAATZGE33NQPE";
let ETHERSCAN_API_KEY = DEFAULT_API_KEY;
const ETHERSCAN_API_URL = "https://api.etherscan.io/api";

// Function to update the API key
export const setEtherscanApiKey = (apiKey: string) => {
  if (apiKey && apiKey.trim()) {
    ETHERSCAN_API_KEY = apiKey.trim();
    
    // Save to localStorage for persistence
    try {
      localStorage.setItem('etherscan_api_key', apiKey.trim());
    } catch (error) {
      console.error("Failed to save API key to localStorage:", error);
    }
    
    return true;
  }
  return false;
};

// Load API key from localStorage on initial load, fallback to default
try {
  const savedApiKey = localStorage.getItem('etherscan_api_key');
  if (savedApiKey && savedApiKey.trim() !== '') {
    ETHERSCAN_API_KEY = savedApiKey;
  } else {
    // If no saved key, use default
    ETHERSCAN_API_KEY = DEFAULT_API_KEY;
  }
} catch (error) {
  console.error("Failed to load API key from localStorage:", error);
  // Fallback to default on error
  ETHERSCAN_API_KEY = DEFAULT_API_KEY;
}

// Function to get the current API key (masked for UI)
export const getEtherscanApiKey = () => {
  return ETHERSCAN_API_KEY;
};

// Function to get the default API key
export const getDefaultApiKey = () => {
  return DEFAULT_API_KEY;
};

// Function to reset to default API key
export const resetToDefaultApiKey = () => {
  ETHERSCAN_API_KEY = DEFAULT_API_KEY;
  try {
    localStorage.removeItem('etherscan_api_key');
  } catch (error) {
    console.error("Failed to remove API key from localStorage:", error);
  }
  return true;
};

// Add timeout to axios requests
const axiosInstance = axios.create({
  timeout: 10000, // 10 seconds timeout
});

export interface AddressDetails {
  balance: string;
  txCount: number;
}

export const fetchAddressTransactions = async (
  address: string,
  limit: number = 50
): Promise<Transaction[]> => {
  try {
    // Fetch both normal and internal transactions
    const [normalTxResponse, internalTxResponse] = await Promise.allSettled([
      axiosInstance.get(
        `${ETHERSCAN_API_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${ETHERSCAN_API_KEY}`
      ),
      axiosInstance.get(
        `${ETHERSCAN_API_URL}?module=account&action=txlistinternal&address=${address}&startblock=0&endblock=99999999&page=1&offset=${limit}&sort=desc&apikey=${ETHERSCAN_API_KEY}`
      )
    ]);

    // Extract results from the successful responses
    const normalTxs = normalTxResponse.status === 'fulfilled' && 
                     normalTxResponse.value.data.status === "1" 
                     ? normalTxResponse.value.data.result : [];
                     
    const internalTxs = internalTxResponse.status === 'fulfilled' && 
                        internalTxResponse.value.data.status === "1" 
                        ? internalTxResponse.value.data.result : [];

    // Combine transactions
    const combinedTransactions = [...normalTxs, ...internalTxs];
    
    if (combinedTransactions.length === 0) {
      console.log(`No transactions found for address ${address}`);
      return [];
    }

    // Sort by timestamp, newest first
    return combinedTransactions.sort((a, b) => 
      parseInt(b.timeStamp) - parseInt(a.timeStamp)
    );
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
};

// Function to get balance and tx count for an address
export const fetchAddressDetails = async (address: string): Promise<AddressDetails> => {
  try {
    const [balanceResponse, txCountResponse] = await Promise.allSettled([
      axiosInstance.get(
        `${ETHERSCAN_API_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
      ),
      axiosInstance.get(
        `${ETHERSCAN_API_URL}?module=proxy&action=eth_getTransactionCount&address=${address}&tag=latest&apikey=${ETHERSCAN_API_KEY}`
      )
    ]);

    // Extract balance
    const balance = balanceResponse.status === 'fulfilled' && balanceResponse.value.data.status === "1" 
      ? (parseInt(balanceResponse.value.data.result) / 1e18).toFixed(4)
      : "0";
      
    // Extract transaction count  
    const txCount = txCountResponse.status === 'fulfilled' && txCountResponse.value.data.result 
      ? parseInt(txCountResponse.value.data.result, 16)
      : 0;

    return { balance, txCount };
  } catch (error) {
    console.error("Error fetching address details:", error);
    return { balance: "0", txCount: 0 };
  }
};

// Function to get related transactions for addresses with improved error handling
export const fetchRelatedTransactions = async (address: string, maxDepth: number = 2): Promise<Transaction[]> => {
  try {
    // Start with the main address
    let allAddresses = new Set([address.toLowerCase()]);
    let allTransactions: Transaction[] = [];
    let currentDepth = 0;
    let addressesToProcess = [address];
    
    while (currentDepth < maxDepth && addressesToProcess.length > 0) {
      const newAddressesToProcess: string[] = [];
      
      // Process each address at the current depth level
      for (const addr of addressesToProcess) {
        try {
          const transactions = await fetchAddressTransactions(addr, 20);
          allTransactions = [...allTransactions, ...transactions];
          
          // Collect next level of addresses for processing
          transactions.forEach(tx => {
            if (!allAddresses.has(tx.from.toLowerCase())) {
              allAddresses.add(tx.from.toLowerCase());
              newAddressesToProcess.push(tx.from);
            }
            if (!allAddresses.has(tx.to.toLowerCase())) {
              allAddresses.add(tx.to.toLowerCase());
              newAddressesToProcess.push(tx.to);
            }
          });
        } catch (error) {
          console.error(`Error processing address ${addr} at depth ${currentDepth}:`, error);
          // Continue with other addresses even if one fails
        }
      }
      
      // Limit the number of addresses to process per level to prevent API overload
      addressesToProcess = newAddressesToProcess.slice(0, 5);
      currentDepth++;
    }
    
    // Filter out duplicates based on hash
    const uniqueTransactions = Array.from(
      new Map(allTransactions.map(tx => [tx.hash, tx])).values()
    );
    
    return uniqueTransactions;
  } catch (error) {
    console.error("Error fetching related transactions:", error);
    return [];
  }
};
