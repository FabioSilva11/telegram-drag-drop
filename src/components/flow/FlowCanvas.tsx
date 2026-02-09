import { useCallback, useRef, useState } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  ReactFlowInstance,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { FlowNode, FlowEdge, FlowNodeData, NodeType } from '@/types/flow';
import { StartNode } from './nodes/StartNode';
import { MessageNode } from './nodes/MessageNode';
import { ConditionNode } from './nodes/ConditionNode';
import { ButtonReplyNode } from './nodes/ButtonReplyNode';
import { ActionNode } from './nodes/ActionNode';
import { DelayNode } from './nodes/DelayNode';

const nodeTypes: NodeTypes = {
  start: StartNode,
  message: MessageNode,
  condition: ConditionNode,
  buttonReply: ButtonReplyNode,
  action: ActionNode,
  delay: DelayNode,
};

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
};

export function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);

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
    },
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type || !reactFlowInstance) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: FlowNode = {
        id: getNewId(),
        type,
        position,
        data: {
          type,
          ...defaultNodeData[type],
        } as FlowNodeData,
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: 'hsl(200, 85%, 50%)', strokeWidth: 2 },
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="hsl(220, 15%, 18%)"
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              start: 'hsl(142, 70%, 45%)',
              message: 'hsl(200, 85%, 50%)',
              condition: 'hsl(35, 90%, 55%)',
              buttonReply: 'hsl(270, 65%, 60%)',
              action: 'hsl(0, 72%, 55%)',
              delay: 'hsl(45, 90%, 55%)',
            };
            return colors[node.type || ''] || 'hsl(220, 15%, 30%)';
          }}
          maskColor="hsl(220, 20%, 7%, 0.8)"
          style={{ backgroundColor: 'hsl(220, 18%, 11%)' }}
        />
      </ReactFlow>
    </div>
  );
}
