import { Node, Edge } from '@xyflow/react';

export type NodeType = 'start' | 'message' | 'condition' | 'buttonReply' | 'action' | 'delay' | 'image' | 'userInput' | 'location' | 'httpRequest';

export interface FlowNodeData {
  label: string;
  type: NodeType;
  content?: string;
  buttons?: { id: string; text: string }[];
  condition?: string;
  action?: string;
  delay?: number;
  delayUnit?: 'seconds' | 'minutes' | 'hours';
  imageUrl?: string;
  caption?: string;
  variableName?: string;
  promptText?: string;
  latitude?: number;
  longitude?: number;
  locationTitle?: string;
  httpUrl?: string;
  httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  httpHeaders?: string;
  httpBody?: string;
  [key: string]: unknown;
}

export type FlowNode = Node<FlowNodeData>;
export type FlowEdge = Edge;

export interface BotCredentials {
  token: string;
  botName: string;
  webhookUrl?: string;
}

export interface DragItem {
  type: NodeType;
  label: string;
  icon: string;
  description: string;
}
