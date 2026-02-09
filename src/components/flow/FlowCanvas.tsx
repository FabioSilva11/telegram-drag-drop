import { useCallback, useRef, useState, DragEvent } from 'react';
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  ReactFlowInstance,
  NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { FlowNode, NodeType } from '@/types/flow';
import { StartNode } from './nodes/StartNode';
import { MessageNode } from './nodes/MessageNode';
import { ConditionNode } from './nodes/ConditionNode';
import { ButtonReplyNode } from './nodes/ButtonReplyNode';
import { ActionNode } from './nodes/ActionNode';
import { DelayNode } from './nodes/DelayNode';
import { useFlow } from '@/contexts/FlowContext';

const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  condition: ConditionNode,
  buttonReply: ButtonReplyNode,
  action: ActionNode,
  delay: DelayNode,
};

const validNodeTypes: NodeType[] = ['start', 'message', 'condition', 'buttonReply', 'action', 'delay'];

export function FlowCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
  } = useFlow();

  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      // Try application/reactflow first, fallback to text/plain
      let type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) {
        type = event.dataTransfer.getData('text/plain') as NodeType;
      }

      if (!type || !validNodeTypes.includes(type)) {
        return;
      }
      
      if (!reactFlowInstance) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      setSelectedNode(node as FlowNode);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onInit={(instance) => {
          setReactFlowInstance(instance);
        }}
        nodeTypes={nodeTypes}
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
