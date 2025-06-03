
import { Node, Edge } from "reactflow";

// Function to apply layout to nodes
export const applyLayout = (
  nodes: Node[],
  edges: Edge[]
): Node[] => {
  // Find central node
  const centralNode = nodes.find(node => node.data.isCentral);
  if (!centralNode) return nodes;
  
  const centerX = 600;
  const centerY = 300;
  
  // Create a map to track node positions by level
  const nodesByLevel = new Map<number, Node[]>();
  
  // Group nodes by level and direction
  nodes.forEach(node => {
    const level = node.data.level !== undefined ? node.data.level : 1;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)?.push(node);
  });
  
  // Create a map to track node relationships
  const childrenByParent = new Map<string, string[]>();
  
  edges.forEach(edge => {
    if (!childrenByParent.has(edge.source)) {
      childrenByParent.set(edge.source, []);
    }
    childrenByParent.get(edge.source)?.push(edge.target);
  });
  
  // Position the central node in the center
  const layoutedNodes = nodes.map(node => {
    if (node.data.isCentral) {
      return {
        ...node,
        position: { x: centerX, y: centerY },
        draggable: true // Ensure central node is draggable
      };
    }
    
    const nodeLevel = node.data.level !== undefined ? node.data.level : 1;
    
    // Position senders on the left
    if (node.data.direction === 'sender') {
      const senderNodes = nodesByLevel.get(nodeLevel) || [];
      const sendersOfSameLevel = senderNodes.filter(n => n.data.direction === 'sender');
      const index = sendersOfSameLevel.findIndex(n => n.id === node.id);
      const totalSenders = sendersOfSameLevel.length;
      
      // Adjust vertical spacing based on level - more spacing for level 2
      const verticalSpacing = nodeLevel === 1 ? 80 : 110;
      
      // Adjust x position based on level - farther apart for higher levels
      const levelOffset = (nodeLevel - 1) * -200;
      
      return {
        ...node,
        position: { 
          x: centerX - 250 + levelOffset, 
          y: centerY - (totalSenders * verticalSpacing) / 2 + index * verticalSpacing
        },
        draggable: true // Make all nodes draggable
      };
    }
    
    // Position recipients on the right
    if (node.data.direction === 'recipient') {
      // First level recipients directly from central node
      if (nodeLevel === 1) {
        const firstLevelRecipients = nodesByLevel.get(1)?.filter(n => 
          n.data.direction === 'recipient'
        ) || [];
        
        const index = firstLevelRecipients.findIndex(n => n.id === node.id);
        const totalRecipients = firstLevelRecipients.length;
        
        // Use a larger vertical spacing for better readability
        const verticalSpacing = 80;
        
        return {
          ...node,
          position: { 
            x: centerX + 250, 
            y: centerY - (totalRecipients * verticalSpacing) / 2 + index * verticalSpacing
          },
          draggable: true
        };
      } 
      // Level 2 and higher recipients - improved layout
      else {
        // Find parent of this node by checking edges
        const parentEdge = edges.find(e => e.target === node.id);
        
        if (!parentEdge) {
          return {
            ...node,
            draggable: true
          }; // Keep current position if no parent found, but make draggable
        }
        
        const parentNode = nodes.find(n => n.id === parentEdge.source);
        
        if (!parentNode) {
          return {
            ...node,
            draggable: true
          }; // Keep current position if parent node not found, but make draggable
        }
        
        // Get children of this parent node to determine siblings
        const siblingTargets = edges
          .filter(e => e.source === parentNode.id)
          .map(e => e.target);
        
        const siblingNodes = nodes.filter(n => siblingTargets.includes(n.id));
        const index = siblingNodes.findIndex(n => n.id === node.id);
        const totalSiblings = siblingNodes.length;
        
        // Use much larger spacing for level 2 nodes to prevent overlapping
        const verticalSpacing = 140;
        
        // Calculate horizontal distance from parent - make it larger for higher levels
        const horizontalOffset = 200;
        
        // Stagger y positions slightly to avoid perfect alignment that causes visual confusion
        const staggerOffset = (index % 2) * 15;
        
        return {
          ...node,
          position: { 
            x: parentNode.position.x + horizontalOffset, 
            y: parentNode.position.y - ((totalSiblings - 1) * verticalSpacing) / 2 + index * verticalSpacing + staggerOffset
          },
          draggable: true
        };
      }
    }
    
    return {
      ...node,
      draggable: true // Make sure any other nodes are also draggable
    };
  });
  
  return layoutedNodes;
};
