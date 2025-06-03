
import { Node, Position } from "reactflow";
import { Transaction } from "../types/transactionTypes";
import { fetchAddressDetails } from "../api/etherscanApi";

// Function to extract unique addresses from transactions
export const extractUniqueAddresses = (
  transactions: Transaction[],
  centralAddress: string,
  maxAddressesPerSide: number = 10
): {
  uniqueSenders: string[];
  uniqueRecipients: string[];
  addressesIncluded: Set<string>;
  addressLevels: Map<string, number>;
} => {
  const addressesIncluded = new Set<string>([centralAddress.toLowerCase()]);
  const addressLevels = new Map<string, number>();
  addressLevels.set(centralAddress.toLowerCase(), 0);
  
  // Group transactions by direction (incoming vs outgoing)
  const incomingTxs = transactions.filter(tx => tx.to.toLowerCase() === centralAddress.toLowerCase());
  const outgoingTxs = transactions.filter(tx => tx.from.toLowerCase() === centralAddress.toLowerCase());
  
  // Extract unique senders (for incoming transactions)
  const uniqueSenders = Array.from(
    new Set(
      incomingTxs.map(tx => tx.from.toLowerCase())
    )
  ).slice(0, maxAddressesPerSide);
  
  // Extract unique recipients (for outgoing transactions)
  const uniqueRecipients = Array.from(
    new Set(
      outgoingTxs.map(tx => tx.to.toLowerCase())
    )
  ).slice(0, maxAddressesPerSide);
  
  // Set level 1 for all direct connections
  uniqueSenders.forEach(addr => addressLevels.set(addr, 1));
  uniqueRecipients.forEach(addr => addressLevels.set(addr, 1));
  
  return { uniqueSenders, uniqueRecipients, addressesIncluded, addressLevels };
};

// Function to fetch details for multiple addresses
export const fetchAddressesDetails = async (addresses: string[]): Promise<Map<string, any>> => {
  const addressDetailsMap = new Map();
  
  try {
    const addressDetailsPromises = addresses.map(async (address) => {
      try {
        const details = await fetchAddressDetails(address);
        return { address, details };
      } catch (error) {
        console.error(`Error fetching details for ${address}:`, error);
        return { address, details: { balance: "0", txCount: 0 } };
      }
    });
    
    const addressDetailsResults = await Promise.all(addressDetailsPromises);
    addressDetailsResults.forEach(({ address, details }) => {
      addressDetailsMap.set(address, details);
    });
  } catch (error) {
    console.error("Error fetching address details:", error);
  }
  
  return addressDetailsMap;
};

// Function to create the central node
export const createCentralNode = (
  centralAddress: string, 
  centralAddrDetails: { balance: string; txCount: number }
): Node => {
  return {
    id: centralAddress.toLowerCase(),
    type: 'address',
    data: { 
      label: `${centralAddress.slice(0, 6)}...${centralAddress.slice(-4)}`,
      address: centralAddress,
      isCentral: true,
      balanceEth: centralAddrDetails.balance,
      txCount: centralAddrDetails.txCount,
      isExpanded: true,
      level: 0
    },
    position: { x: 400, y: 300 },
    className: 'central-node',
  };
};

// Function to create sender nodes
export const createSenderNodes = (
  uniqueSenders: string[],
  addressDetailsMap: Map<string, any>,
  expandedAddresses: Set<string>,
  addressesIncluded: Set<string>
): Node[] => {
  const nodes: Node[] = [];
  
  uniqueSenders.forEach((sender, index) => {
    const senderLower = sender.toLowerCase();
    const y = 100 + (index * 80);
    
    if (!addressesIncluded.has(senderLower)) {
      const details = addressDetailsMap.get(senderLower) || { balance: "0", txCount: 0 };
      
      nodes.push({
        id: senderLower,
        type: 'address',
        data: { 
          label: `${sender.slice(0, 6)}...${sender.slice(-4)}`,
          address: sender,
          direction: 'sender',
          balanceEth: details.balance,
          txCount: details.txCount,
          isExpanded: expandedAddresses.has(senderLower),
          level: 1
        },
        position: { x: 100, y },
        targetPosition: Position.Right,
        sourcePosition: Position.Right,
      });
      addressesIncluded.add(senderLower);
    }
  });
  
  return nodes;
};

// Function to create recipient nodes
export const createRecipientNodes = (
  uniqueRecipients: string[],
  addressDetailsMap: Map<string, any>,
  expandedAddresses: Set<string>,
  addressesIncluded: Set<string>
): Node[] => {
  const nodes: Node[] = [];
  
  uniqueRecipients.forEach((recipient, index) => {
    const recipientLower = recipient.toLowerCase();
    const y = 100 + (index * 80);
    
    if (!addressesIncluded.has(recipientLower)) {
      const details = addressDetailsMap.get(recipientLower) || { balance: "0", txCount: 0 };
      
      nodes.push({
        id: recipientLower,
        type: 'address',
        data: { 
          label: `${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
          address: recipient,
          direction: 'recipient',
          balanceEth: details.balance,
          txCount: details.txCount,
          isExpanded: expandedAddresses.has(recipientLower),
          level: 1
        },
        position: { x: 700, y },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
      });
      addressesIncluded.add(recipientLower);
    }
  });
  
  return nodes;
};
