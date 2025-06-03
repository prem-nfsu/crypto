
import { Edge } from "reactflow";
import { Transaction } from "../types/transactionTypes";

// Function to create edges for incoming transactions
export const createIncomingEdges = (
  uniqueSenders: string[],
  incomingTxs: Transaction[],
  centralAddress: string
): Edge[] => {
  const edges: Edge[] = [];
  
  uniqueSenders.forEach(sender => {
    try {
      // Find the most recent transaction from this sender
      const relevantTx = incomingTxs.find(tx => tx.from.toLowerCase() === sender.toLowerCase());
      
      if (relevantTx) {
        edges.push({
          id: `e-in-${relevantTx.hash}`,
          source: sender.toLowerCase(),
          target: centralAddress.toLowerCase(),
          data: {
            value: relevantTx.value,
            hash: relevantTx.hash,
            timestamp: relevantTx.timeStamp,
            direction: 'incoming'
          },
          type: 'transaction',
          animated: true,
          style: { stroke: '#4ade80' }, // Incoming in green
          className: 'incoming-transaction',
        });
      }
    } catch (error) {
      console.error(`Error creating edge for sender ${sender}:`, error);
    }
  });
  
  return edges;
};

// Function to create edges for outgoing transactions
export const createOutgoingEdges = (
  uniqueRecipients: string[],
  outgoingTxs: Transaction[],
  centralAddress: string
): Edge[] => {
  const edges: Edge[] = [];
  
  uniqueRecipients.forEach(recipient => {
    try {
      // Find the most recent transaction to this recipient
      const relevantTx = outgoingTxs.find(tx => tx.to.toLowerCase() === recipient.toLowerCase());
      
      if (relevantTx) {
        edges.push({
          id: `e-out-${relevantTx.hash}`,
          source: centralAddress.toLowerCase(),
          target: recipient.toLowerCase(),
          data: {
            value: relevantTx.value,
            hash: relevantTx.hash,
            timestamp: relevantTx.timeStamp,
            direction: 'outgoing'
          },
          type: 'transaction',
          animated: true,
          style: { stroke: '#f43f5e' }, // Outgoing in red
          className: 'outgoing-transaction',
        });
      }
    } catch (error) {
      console.error(`Error creating edge for recipient ${recipient}:`, error);
    }
  });
  
  return edges;
};

// Function to create edges for expanded nodes
export const createExpandedNodeEdges = (
  outgoingFromExpanded: Transaction[],
  expandedAddress: string,
  newRecipients: string[]
): Edge[] => {
  const edges: Edge[] = [];
  
  newRecipients.forEach(recipient => {
    // Find the transaction from expanded to this recipient
    const relevantTx = outgoingFromExpanded.find(tx => 
      tx.to.toLowerCase() === recipient
    );
    
    if (relevantTx) {
      edges.push({
        id: `e-exp-${relevantTx.hash}`,
        source: expandedAddress.toLowerCase(),
        target: recipient,
        data: {
          value: relevantTx.value,
          hash: relevantTx.hash,
          timestamp: relevantTx.timeStamp,
          direction: 'outgoing'
        },
        type: 'transaction',
        animated: true,
        style: { stroke: '#f43f5e' }, // Outgoing in red
      });
    }
  });
  
  return edges;
};
