
import { Node, Position } from "reactflow";
import { Transaction } from "../types/transactionTypes";
import { fetchAddressDetails, fetchAddressTransactions } from "../api/etherscanApi";

// Process expanded addresses to create additional nodes and edges
export const processExpandedNode = async (
  expandedAddress: string,
  centralAddress: string,
  addressesIncluded: Set<string>,
  addressLevels: Map<string, number>,
  MAX_DEPTH: number = 1  // Will be determined by the global max level
): Promise<{
  newNodes: Node[];
  transactions: Transaction[];
  newRecipients: string[];
}> => {
  const newNodes: Node[] = [];
  let transactions: Transaction[] = [];
  let newRecipients: string[] = [];
  
  // Only expand addresses that are in our graph and haven't reached max depth
  if (!addressesIncluded.has(expandedAddress.toLowerCase())) {
    return { newNodes, transactions, newRecipients };
  }
  
  const currentLevel = addressLevels.get(expandedAddress.toLowerCase()) || 0;
  if (currentLevel >= MAX_DEPTH) {
    console.log(`Address ${expandedAddress} is at max depth ${currentLevel}, not expanding further`);
    return { newNodes, transactions, newRecipients };
  }
  
  try {
    // Fetch transactions for this expanded address
    transactions = await fetchAddressTransactions(expandedAddress);
    const outgoingFromExpanded = transactions.filter(tx => 
      tx.from.toLowerCase() === expandedAddress.toLowerCase()
    ).slice(0, 5); // Limit to top 5 outgoing transactions
    
    // For each outgoing transaction, add recipient if not already in graph
    newRecipients = Array.from(
      new Set(
        outgoingFromExpanded.map(tx => tx.to.toLowerCase())
      )
    ).filter(addr => !addressesIncluded.has(addr));
    
    // Get details for new recipients with error handling
    const newRecipientDetailsMap = new Map();
    
    try {
      const newRecipientDetailsPromises = newRecipients.map(async (address) => {
        try {
          const details = await fetchAddressDetails(address);
          return { address, details };
        } catch (error) {
          console.error(`Error fetching details for ${address}:`, error);
          return { address, details: { balance: "0", txCount: 0 } };
        }
      });
      
      const newRecipientDetails = await Promise.all(newRecipientDetailsPromises);
      newRecipientDetails.forEach(({ address, details }) => {
        newRecipientDetailsMap.set(address, details);
      });
    } catch (error) {
      console.error("Error fetching new recipient details:", error);
    }
    
    // Find the node for the expanded address
    const nextLevel = currentLevel + 1;
    
    // Add new recipient nodes at next level
    newRecipients.forEach((recipient, index) => {
      const details = newRecipientDetailsMap.get(recipient) || { balance: "0", txCount: 0 };
      
      // Set level for this new address
      addressLevels.set(recipient, nextLevel);
      
      // Calculate position (this will be adjusted by layout)
      const baseX = 700 + (nextLevel * 300);
      const baseY = 100 + (index * 80);
      
      newNodes.push({
        id: recipient,
        type: 'address',
        data: { 
          label: `${recipient.slice(0, 6)}...${recipient.slice(-4)}`,
          address: recipient,
          direction: 'recipient',
          balanceEth: details.balance,
          txCount: details.txCount,
          isExpanded: false,
          level: nextLevel
        },
        position: { x: baseX, y: baseY },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        draggable: true, // Ensure nodes are draggable
      });
    });
    
  } catch (error) {
    console.error(`Error processing expanded address ${expandedAddress}:`, error);
  }
  
  return { newNodes, transactions, newRecipients };
};
