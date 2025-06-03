
import { Edge, Node } from "reactflow";

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  blockNumber: string;
  gasPrice?: string;
  gasUsed?: string;
  // Adding missing properties required by walletUtils.Transaction
  input?: string;
  methodId?: string;
  functionName?: string;
}

export interface TransactionFlowData {
  nodes: Node[];
  edges: Edge[];
}

export interface AddressNodeData {
  label: string;
  address: string;
  isCentral?: boolean;
  direction?: 'sender' | 'recipient';
  balanceEth?: string;
  txCount?: number;
  isExpanded?: boolean;
  level?: number;
}
