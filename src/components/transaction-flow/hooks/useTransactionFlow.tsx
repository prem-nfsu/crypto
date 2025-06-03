import { useCallback, useEffect, useState, useRef } from 'react';
import { Edge, Node, useReactFlow } from 'reactflow';
import { 
  fetchAddressTransactions, 
  fetchRelatedTransactions,
  generateTransactionFlowData,
  Transaction,
  getEtherscanApiKey
} from '@/utils/transactionFlowUtils';
import { useToast } from '@/hooks/use-toast';
import { useGlobalMaxLevel } from './useGlobalMaxLevel';
import { applyLayout } from '@/utils/graph/layoutUtils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

export const useTransactionFlow = (address: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [expandedAddresses, setExpandedAddresses] = useState<Set<string>>(new Set([address.toLowerCase()]));
  const [autoLayout, setAutoLayout] = useState(true);
  const { fitView } = useReactFlow();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { maxLevel, setMaxLevel } = useGlobalMaxLevel();
  
  const loadedFromDb = useRef(false);

  const validateApiKey = useCallback(() => {
    const apiKey = getEtherscanApiKey();
    if (!apiKey || apiKey === "YourAPIKeyHere") {
      toast({
        variant: "destructive",
        title: "API Key Required",
        description: "Please set your Etherscan API key in the settings to view transaction graphs.",
      });
      return false;
    }
    return true;
  }, [toast]);
  
  const saveGraphToDatabase = useCallback(async () => {
    if (!user || nodes.length === 0 || edges.length === 0) return;
    
    try {
      console.log("Saving graph to database:", address.toLowerCase());
      
      const uniqueEdges = edges.reduce((acc: Edge[], curr: Edge) => {
        const isDuplicate = acc.some(edge => 
          edge.source === curr.source && 
          edge.target === curr.target &&
          edge.id === curr.id
        );
        if (!isDuplicate) acc.push(curr);
        return acc;
      }, []);
      
      const graphData = {
        nodes,
        edges: uniqueEdges,
        expandedAddresses: Array.from(expandedAddresses)
      };
      
      const { data: existingData, error: checkError } = await supabase
        .from('graph_data')
        .select('id')
        .eq('user_id', user.id)
        .eq('address', address.toLowerCase())
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingData) {
        const { error } = await supabase
          .from('graph_data')
          .update({
            max_level: maxLevel,
            graph_json: graphData,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData.id);
        
        if (error) throw error;
        console.log("Graph data updated successfully");
      } else {
        const { error } = await supabase
          .from('graph_data')
          .insert({
            user_id: user.id,
            address: address.toLowerCase(),
            max_level: maxLevel,
            graph_json: graphData
          });
        
        if (error) throw error;
        console.log("Graph data saved successfully");
      }
    } catch (error) {
      console.error("Error saving graph to database:", error);
    }
  }, [user, nodes, edges, expandedAddresses, address, maxLevel]);
  
  const loadGraphFromDatabase = useCallback(async () => {
    if (!user || loadedFromDb.current) return;
    
    setIsLoading(true);
    try {
      console.log("Loading graph from database:", address.toLowerCase());
      
      const { data, error } = await supabase
        .from('graph_data')
        .select('graph_json, max_level')
        .eq('user_id', user.id)
        .eq('address', address.toLowerCase())
        .maybeSingle();
      
      if (error) throw error;
      
      if (data && data.graph_json && Object.keys(data.graph_json).length > 0) {
        console.log("Found saved graph data:", data);
        
        const graphData = data.graph_json;
        
        const uniqueEdges = graphData.edges ? 
          graphData.edges.reduce((acc: Edge[], curr: Edge) => {
            const isDuplicate = acc.some(edge => 
              edge.source === curr.source && 
              edge.target === curr.target &&
              edge.id === curr.id
            );
            if (!isDuplicate) acc.push(curr);
            return acc;
          }, []) : [];
        
        setNodes(graphData.nodes || []);
        setEdges(uniqueEdges);
        
        if (graphData.expandedAddresses && graphData.expandedAddresses.length > 0) {
          setExpandedAddresses(new Set(graphData.expandedAddresses));
        }
        
        if (data.max_level) {
          setMaxLevel(data.max_level);
        }
        
        loadedFromDb.current = true;
        
        setIsLoading(false);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error loading graph from database:", error);
      return false;
    }
  }, [user, address, setMaxLevel]);

  const loadTransactions = useCallback(async () => {
    if (!validateApiKey()) {
      setIsLoading(false);
      return;
    }
    
    const loadedFromDatabase = await loadGraphFromDatabase();
    if (loadedFromDatabase) {
      console.log("Using graph data from database");
      return;
    }
    
    setIsLoading(true);
    try {
      console.log("Loading transactions for address:", address);
      const timeoutPromise = new Promise<Transaction[]>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      const transactionsPromise = fetchAddressTransactions(address);
      const transactions = await Promise.race([transactionsPromise, timeoutPromise]);
      
      console.log("Transactions loaded:", transactions.length);
      
      const { nodes: initialNodes, edges: initialEdges } = await generateTransactionFlowData(
        transactions,
        address,
        10,
        expandedAddresses
      );
      
      console.log("Generated nodes:", initialNodes.length);
      console.log("Generated edges:", initialEdges.length);
      
      const layoutedNodes = applyLayout(initialNodes, initialEdges);
      
      setNodes(layoutedNodes);
      setEdges(initialEdges);
      
      const highestLevel = layoutedNodes.reduce((max, node) => {
        const level = node.data?.level;
        return level !== undefined && level > max ? level : max;
      }, 0);
      
      if (highestLevel > 0) {
        setMaxLevel(highestLevel);
      }
      
      loadedFromDb.current = true;
      
      setTimeout(() => {
        fitView({ padding: 0.4 });
        console.log("Fit view triggered");
      }, 300);
      
    } catch (error) {
      console.error("Error loading transaction flow data:", error);
      const fallbackNode: Node = {
        id: address.toLowerCase(),
        type: 'address',
        data: { 
          label: `${address.slice(0, 6)}...${address.slice(-4)}`,
          address,
          isCentral: true,
          balanceEth: "0",
          txCount: 0,
          isExpanded: true,
          level: 0
        },
        position: { x: 400, y: 300 },
        draggable: true
      };
      
      setNodes([fallbackNode]);
      setEdges([]);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load transaction data. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [address, expandedAddresses, toast, fitView, validateApiKey, setMaxLevel, loadGraphFromDatabase]);

  const applyAutoLayout = useCallback(() => {
    if (!autoLayout || nodes.length === 0) return;
    
    const layoutedNodes = applyLayout(nodes, edges);
    setNodes(layoutedNodes);
  }, [autoLayout, nodes, edges]);

  const onNodeClick = useCallback(async (event: React.MouseEvent, node: Node) => {
    if (node.data?.isCentral || isLoading) return;
    
    const nodeAddress = node.id;
    
    if (expandedAddresses.has(nodeAddress)) return;
    
    const nodeLevel = node.data?.level !== undefined ? node.data.level : 1;
    if (nodeLevel >= maxLevel) {
      toast({
        title: "Maximum Depth Reached",
        description: `Cannot expand beyond maximum level ${maxLevel}. Adjust the maximum level in the header controls.`,
        variant: "default"
      });
      return;
    }
    
    if (!validateApiKey()) {
      return;
    }
    
    setIsLoading(true);
    toast({
      title: "Expanding Address",
      description: `Loading transactions for ${node.data?.label}...`,
    });
    
    try {
      const timeoutPromise = new Promise<Transaction[]>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 15000)
      );
      
      setExpandedAddresses(prev => new Set([...prev, nodeAddress]));
      
      const transactionsPromise = fetchAddressTransactions(nodeAddress);
      const transactions = await Promise.race([transactionsPromise, timeoutPromise]);
      
      const { nodes: newNodes, edges: newEdges } = await generateTransactionFlowData(
        transactions, 
        address,
        10,
        new Set([...expandedAddresses, nodeAddress])
      );
      
      const layoutedNodes = applyLayout(newNodes, newEdges);
      
      setNodes(layoutedNodes);
      setEdges(newEdges);
      
      const highestLevel = layoutedNodes.reduce((max, node) => {
        const level = node.data?.level;
        return level !== undefined && level > max ? level : max;
      }, 0);
      
      if (highestLevel > maxLevel) {
        setMaxLevel(highestLevel);
      }
      
      setTimeout(() => saveGraphToDatabase(), 500);
      
      toast({
        title: "Address Expanded",
        description: `Successfully loaded transactions for ${node.data?.label}`,
      });
    } catch (error) {
      console.error("Error expanding node:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to expand address. Please try again later.",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => fitView({ padding: 0.4 }), 300);
    }
  }, [address, expandedAddresses, isLoading, fitView, toast, maxLevel, validateApiKey, setMaxLevel, saveGraphToDatabase]);

  const handleRefresh = useCallback(() => {
    if (!validateApiKey()) {
      return;
    }
    
    loadedFromDb.current = false;
    
    loadTransactions();
    toast({
      description: "Refreshing transaction data...",
    });
  }, [loadTransactions, toast, validateApiKey]);

  const handleNextLevel = useCallback(async () => {
    if (!validateApiKey()) {
      return;
    }
    
    if (maxLevel <= 0) {
      toast({
        title: "Invalid Level",
        description: "Maximum level must be greater than 0",
        variant: "default"
      });
      return;
    }
    
    setIsLoading(true);
    toast({
      description: `Expanding to next level. This may take a moment...`,
    });
    
    try {
      const timeoutPromise = new Promise<Transaction[]>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 20000)
      );
      
      const transactionsPromise = fetchRelatedTransactions(address, maxLevel);
      const allTransactions = await Promise.race([transactionsPromise, timeoutPromise]);
      
      const currentLevelNodes = nodes.filter(node => 
        node.data?.level === maxLevel - 1 && !expandedAddresses.has(node.id)
      );
      
      if (currentLevelNodes.length === 0) {
        toast({
          description: "No more nodes to expand at this level",
        });
        setIsLoading(false);
        return;
      }
      
      const nodesToExpand = currentLevelNodes.slice(0, 3);
      const newExpandedAddresses = new Set(expandedAddresses);
      
      nodesToExpand.forEach(node => {
        newExpandedAddresses.add(node.id);
      });
      
      const { nodes: newNodes, edges: newEdges } = await generateTransactionFlowData(
        allTransactions, 
        address,
        15,
        newExpandedAddresses
      );
      
      const layoutedNodes = applyLayout(newNodes, newEdges);
      
      setNodes(layoutedNodes);
      setEdges(newEdges);
      setExpandedAddresses(newExpandedAddresses);
      
      setTimeout(() => saveGraphToDatabase(), 500);
      
      toast({
        title: "Success",
        description: `Expanded to next level`,
      });
    } catch (error) {
      console.error("Error expanding to next level:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to expand to next level. Try expanding individual addresses instead.",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => fitView({ padding: 0.4 }), 300);
    }
  }, [address, expandedAddresses, nodes, fitView, toast, validateApiKey, maxLevel, saveGraphToDatabase]);

  const handleFullExpand = useCallback(async () => {
    if (!validateApiKey()) {
      return;
    }
    
    if (maxLevel <= 0) {
      toast({
        title: "Invalid Level",
        description: "Maximum level must be greater than 0",
        variant: "default"
      });
      return;
    }
    
    setIsLoading(true);
    toast({
      description: `Generating transaction graph (level ${maxLevel}). This may take a moment...`,
    });
    
    try {
      const timeoutPromise = new Promise<Transaction[]>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 20000)
      );
      
      const transactionsPromise = fetchRelatedTransactions(address, maxLevel);
      const allTransactions = await Promise.race([transactionsPromise, timeoutPromise]);
      
      const uniqueAddresses = new Set([address.toLowerCase()]);
      allTransactions.forEach(tx => {
        uniqueAddresses.add(tx.from.toLowerCase());
        uniqueAddresses.add(tx.to.toLowerCase());
      });
      
      const { nodes: fullNodes, edges: fullEdges } = await generateTransactionFlowData(
        allTransactions, 
        address,
        15,
        uniqueAddresses
      );
      
      const layoutedNodes = applyLayout(fullNodes, fullEdges);
      
      setNodes(layoutedNodes);
      setEdges(fullEdges);
      setExpandedAddresses(uniqueAddresses);
      
      setTimeout(() => saveGraphToDatabase(), 500);
      
      toast({
        title: "Success",
        description: `Level ${maxLevel} transaction graph generated`,
      });
    } catch (error) {
      console.error("Error expanding full graph:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate graph. Try expanding individual addresses instead.",
      });
    } finally {
      setIsLoading(false);
      setTimeout(() => fitView({ padding: 0.4 }), 300);
    }
  }, [address, fitView, toast, validateApiKey, maxLevel, saveGraphToDatabase]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    if (nodes.length > 0 && !isLoading) {
      console.log("Applying auto layout and fit view");
      if (autoLayout) {
        const layoutedNodes = applyLayout(nodes, edges);
        setNodes(layoutedNodes);
      }
      
      setTimeout(() => {
        fitView({ padding: 0.4 });
      }, 300);
    }
  }, [nodes.length, isLoading, fitView, autoLayout, edges]);

  return {
    nodes,
    edges,
    isLoading,
    onNodeClick,
    handleRefresh,
    handleFullExpand,
    handleNextLevel,
    maxLevel,
    setNodes,
    saveGraphToDatabase,
    loadGraphFromDatabase
  };
};
