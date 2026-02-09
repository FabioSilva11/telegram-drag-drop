import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Node, Edge, useNodesState, useEdgesState, addEdge, Connection } from '@xyflow/react';
import { FlowNode, FlowEdge, FlowNodeData, NodeType } from '@/types/flow';

const initialNodes: FlowNode[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 400, y: 80 },
    data: { label: 'Início', type: 'start', content: '/start' },
  },
];

const initialEdges: FlowEdge[] = [];

let nodeId = 1;
const getNewId = () => `node_${Date.now()}_${nodeId++}`;

const defaultNodeData: Record<NodeType, Partial<FlowNodeData>> = {
  start: { label: 'Início', content: '/start' },
  message: { label: 'Mensagem', content: 'Digite sua mensagem aqui...' },
  condition: { label: 'Condição', condition: 'user.message == "sim"' },
  buttonReply: { label: 'Botões', buttons: [{ id: '1', text: 'Opção 1' }, { id: '2', text: 'Opção 2' }] },
  action: { label: 'Ação', action: 'send_api_request' },
  delay: { label: 'Atraso', delay: 5, delayUnit: 'seconds' },
  image: { label: 'Imagem', imageUrl: '', caption: '' },
  userInput: { label: 'Entrada', promptText: 'Digite sua resposta:', variableName: 'user_response' },
  location: { label: 'Localização', latitude: 0, longitude: 0, locationTitle: '' },
  httpRequest: { label: 'HTTP Request', httpUrl: '', httpMethod: 'GET', httpHeaders: '', httpBody: '' },
};

interface HistoryState {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface FlowContextType {
  nodes: FlowNode[];
  edges: FlowEdge[];
  setNodes: React.Dispatch<React.SetStateAction<FlowNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<FlowEdge[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: NodeType, position: { x: number; y: number }) => void;
  selectedNode: FlowNode | null;
  setSelectedNode: (node: FlowNode | null) => void;
  updateNodeData: (nodeId: string, data: Partial<FlowNodeData>) => void;
  undo: () => void;
  redo: () => void;
  clearCanvas: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

const FlowContext = createContext<FlowContextType | null>(null);

export function FlowProvider({ children }: { children: React.ReactNode }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  
  // History for undo/redo
  const historyRef = useRef<HistoryState[]>([{ nodes: initialNodes, edges: initialEdges }]);
  const historyIndexRef = useRef(0);
  const isUndoRedoRef = useRef(false);

  const saveHistory = useCallback(() => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }
    
    // Remove future states if we're not at the end
    historyRef.current = historyRef.current.slice(0, historyIndexRef.current + 1);
    
    // Add current state
    historyRef.current.push({
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
    });
    
    historyIndexRef.current = historyRef.current.length - 1;
    
    // Limit history size
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
      historyIndexRef.current--;
    }
  }, [nodes, edges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: 'hsl(200, 85%, 50%)', strokeWidth: 2 },
          },
          eds
        )
      );
      setTimeout(saveHistory, 0);
    },
    [setEdges, saveHistory]
  );

  const addNode = useCallback(
    (type: NodeType, position: { x: number; y: number }) => {
      const newNode: FlowNode = {
        id: getNewId(),
        type,
        position,
        data: {
          type,
          ...defaultNodeData[type],
        } as FlowNodeData,
      };

      setNodes((nds) => [...nds, newNode]);
      setTimeout(saveHistory, 0);
    },
    [setNodes, saveHistory]
  );

  const updateNodeData = useCallback(
    (nodeId: string, data: Partial<FlowNodeData>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...data } as FlowNodeData }
            : node
        )
      );
      
      // Also update selectedNode if it's the one being edited
      setSelectedNode((current) => {
        if (current && current.id === nodeId) {
          return { ...current, data: { ...current.data, ...data } as FlowNodeData };
        }
        return current;
      });
      
      setTimeout(saveHistory, 0);
    },
    [setNodes, saveHistory]
  );

  const undo = useCallback(() => {
    if (historyIndexRef.current > 0) {
      historyIndexRef.current--;
      const state = historyRef.current[historyIndexRef.current];
      isUndoRedoRef.current = true;
      setNodes(JSON.parse(JSON.stringify(state.nodes)));
      setEdges(JSON.parse(JSON.stringify(state.edges)));
    }
  }, [setNodes, setEdges]);

  const redo = useCallback(() => {
    if (historyIndexRef.current < historyRef.current.length - 1) {
      historyIndexRef.current++;
      const state = historyRef.current[historyIndexRef.current];
      isUndoRedoRef.current = true;
      setNodes(JSON.parse(JSON.stringify(state.nodes)));
      setEdges(JSON.parse(JSON.stringify(state.edges)));
    }
  }, [setNodes, setEdges]);

  const clearCanvas = useCallback(() => {
    setNodes(initialNodes);
    setEdges([]);
    setTimeout(saveHistory, 0);
  }, [setNodes, setEdges, saveHistory]);

  const canUndo = historyIndexRef.current > 0;
  const canRedo = historyIndexRef.current < historyRef.current.length - 1;

  return (
    <FlowContext.Provider
      value={{
        nodes,
        edges,
        setNodes,
        setEdges,
        onNodesChange,
        onEdgesChange,
        onConnect,
        addNode,
        selectedNode,
        setSelectedNode,
        updateNodeData,
        undo,
        redo,
        clearCanvas,
        canUndo,
        canRedo,
      }}
    >
      {children}
    </FlowContext.Provider>
  );
}

export function useFlow() {
  const context = useContext(FlowContext);
  if (!context) {
    throw new Error('useFlow must be used within a FlowProvider');
  }
  return context;
}
