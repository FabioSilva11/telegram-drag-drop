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
import { ImageNode } from './nodes/ImageNode';
import { UserInputNode } from './nodes/UserInputNode';
import { LocationNode } from './nodes/LocationNode';
import { HttpRequestNode } from './nodes/HttpRequestNode';
import { VideoNode } from './nodes/VideoNode';
import { AudioNode } from './nodes/AudioNode';
import { DocumentNode } from './nodes/DocumentNode';
import { AnimationNode } from './nodes/AnimationNode';
import { StickerNode } from './nodes/StickerNode';
import { PollNode } from './nodes/PollNode';
import { ContactNode } from './nodes/ContactNode';
import { VenueNode } from './nodes/VenueNode';
import { DiceNode } from './nodes/DiceNode';
import { InvoiceNode } from './nodes/InvoiceNode';
import { EditMessageNode } from './nodes/EditMessageNode';
import { DeleteMessageNode } from './nodes/DeleteMessageNode';
import { MediaGroupNode } from './nodes/MediaGroupNode';
import { ChatGPTNode } from './nodes/ChatGPTNode';
import { GroqNode } from './nodes/GroqNode';
import { GeminiNode } from './nodes/GeminiNode';
import { ScheduleNode } from './nodes/ScheduleNode';
import { useFlow } from '@/contexts/FlowContext';

const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  condition: ConditionNode,
  buttonReply: ButtonReplyNode,
  action: ActionNode,
  delay: DelayNode,
  image: ImageNode,
  userInput: UserInputNode,
  location: LocationNode,
  httpRequest: HttpRequestNode,
  video: VideoNode,
  audio: AudioNode,
  document: DocumentNode,
  animation: AnimationNode,
  sticker: StickerNode,
  poll: PollNode,
  contact: ContactNode,
  venue: VenueNode,
  dice: DiceNode,
  invoice: InvoiceNode,
  editMessage: EditMessageNode,
  deleteMessage: DeleteMessageNode,
  mediaGroup: MediaGroupNode,
  chatgpt: ChatGPTNode,
  groq: GroqNode,
  gemini: GeminiNode,
  schedule: ScheduleNode,
};

const validNodeTypes: NodeType[] = ['start', 'message', 'condition', 'buttonReply', 'action', 'delay', 'image', 'userInput', 'location', 'httpRequest', 'video', 'audio', 'document', 'animation', 'sticker', 'poll', 'contact', 'venue', 'dice', 'invoice', 'editMessage', 'deleteMessage', 'mediaGroup', 'chatgpt', 'groq', 'gemini', 'schedule'];

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
      let type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) type = event.dataTransfer.getData('text/plain') as NodeType;
      if (!type || !validNodeTypes.includes(type)) return;
      if (!reactFlowInstance) return;
      const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
      addNode(type, position);
    },
    [reactFlowInstance, addNode]
  );

  const onNodeClick: NodeMouseHandler = useCallback(
    (_, node) => { setSelectedNode(node as FlowNode); },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => { setSelectedNode(null); }, [setSelectedNode]);

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
        onInit={(instance) => setReactFlowInstance(instance)}
        nodeTypes={nodeTypes}
        snapToGrid
        snapGrid={[16, 16]}
        defaultEdgeOptions={{ animated: true, style: { stroke: 'hsl(200, 85%, 50%)', strokeWidth: 2 } }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="hsl(220, 15%, 18%)" />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            const colors: Record<string, string> = {
              start: 'hsl(142, 70%, 45%)', message: 'hsl(200, 85%, 50%)', condition: 'hsl(35, 90%, 55%)',
              buttonReply: 'hsl(270, 65%, 60%)', action: 'hsl(0, 72%, 55%)', delay: 'hsl(45, 90%, 55%)',
              image: 'hsl(170, 70%, 45%)', userInput: 'hsl(300, 65%, 55%)', location: 'hsl(15, 80%, 55%)',
              httpRequest: 'hsl(190, 75%, 45%)', video: 'hsl(340, 70%, 50%)', audio: 'hsl(260, 70%, 55%)',
              document: 'hsl(50, 70%, 50%)', animation: 'hsl(320, 70%, 55%)', sticker: 'hsl(30, 80%, 55%)',
              poll: 'hsl(210, 70%, 50%)', contact: 'hsl(160, 60%, 45%)', venue: 'hsl(25, 75%, 50%)',
              dice: 'hsl(280, 65%, 55%)', invoice: 'hsl(145, 65%, 45%)', editMessage: 'hsl(55, 75%, 50%)',
              deleteMessage: 'hsl(0, 65%, 45%)', mediaGroup: 'hsl(230, 65%, 55%)',
              chatgpt: 'hsl(160, 80%, 40%)', groq: 'hsl(20, 90%, 55%)', gemini: 'hsl(220, 80%, 60%)',
              schedule: 'hsl(38, 92%, 50%)',
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
