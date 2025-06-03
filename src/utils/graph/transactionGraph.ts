
import { Edge, Node } from "reactflow";
import { Transaction, TransactionFlowData } from "../types/transactionTypes";
import { fetchAddressDetails } from "../api/etherscanApi";
import { 
  extractUniqueAddresses, 
  fetchAddressesDetails, 
  createCentralNode, 
  createSenderNodes, 
  createRecipientNodes 
} from "./transactionDataProcessor";
import {
  createIncomingEdges,
  createOutgoingEdges,
  createExpandedNodeEdges
} from "./edgeCreator";
import { processExpandedNode } from "./nodeExpander";
import { applyLayout } from "./layoutUtils";

export const generateTransactionFlowData = async (
  transactions: Transaction[],
  centralAddress: string,
  maxAddressesPerSide: number = 10,
  expandedAddresses: Set<string> = new Set([centralAddress])
): Promise<TransactionFlowData> => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];
  
  // Maximum depth level (3 levels including central node: central=0, first=1, second=2)
  const MAX_DEPTH = 2;
  
  // Extract unique addresses and setup data structures
  const { 
    uniqueSenders, 
    uniqueRecipients, 
    addressesIncluded, 
    addressLevels 
  } = extractUniqueAddresses(transactions, centralAddress, maxAddressesPerSide);
  
  // Group transactions by direction
  const incomingTxs = transactions.filter(tx => tx.to.toLowerCase() === centralAddress.toLowerCase());
  const outgoingTxs = transactions.filter(tx => tx.from.toLowerCase() === centralAddress.toLowerCase());
  
  // Fetch central address details with error handling
  let centralAddrDetails = { balance: "0", txCount: 0 };
  try {
    centralAddrDetails = await fetchAddressDetails(centralAddress);
  } catch (error) {
    console.error("Error fetching central address details:", error);
  }
  
  // Add central address node
  nodes.push(createCentralNode(centralAddress, centralAddrDetails));
  
  // Fetch details for all direct addresses in parallel
  const addressesToFetch = [...uniqueSenders, ...uniqueRecipients];
  const addressDetailsMap = await fetchAddressesDetails(addressesToFetch);
  
  // Add sender nodes
  nodes.push(...createSenderNodes(
    uniqueSenders, 
    addressDetailsMap, 
    expandedAddresses, 
    addressesIncluded
  ));
  
  // Add recipient nodes
  nodes.push(...createRecipientNodes(
    uniqueRecipients, 
    addressDetailsMap, 
    expandedAddresses, 
    addressesIncluded
  ));
  
  // Create edges for incoming transactions
  edges.push(...createIncomingEdges(uniqueSenders, incomingTxs, centralAddress));
  
  // Create edges for outgoing transactions
  edges.push(...createOutgoingEdges(uniqueRecipients, outgoingTxs, centralAddress));
  
  // Process expanded addresses for second and third level (excluding central address)
  for (const expandedAddress of Array.from(expandedAddresses)) {
    if (expandedAddress === centralAddress.toLowerCase()) continue;
    
    const { newNodes, transactions: expandedTxs, newRecipients } = await processExpandedNode(
      expandedAddress,
      centralAddress,
      addressesIncluded,
      addressLevels,
      MAX_DEPTH
    );
    
    // Add the new nodes
    nodes.push(...newNodes);
    newRecipients.forEach(addr => addressesIncluded.add(addr));
    
    // Create edges for the expanded nodes
    const outgoingFromExpanded = expandedTxs.filter(tx => 
      tx.from.toLowerCase() === expandedAddress.toLowerCase()
    ).slice(0, 5);
    
    edges.push(...createExpandedNodeEdges(
      outgoingFromExpanded, 
      expandedAddress, 
      newRecipients
    ));
  }
  
  // Apply layout to organize the nodes visually
  const layoutedNodes = applyLayout(nodes, edges);
  
  return { nodes: layoutedNodes, edges };
};
