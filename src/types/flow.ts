import { Node, Edge } from '@xyflow/react';

export type Platform = 'telegram' | 'whatsapp' | 'discord';

export type NodeType = 'start' | 'message' | 'condition' | 'buttonReply' | 'action' | 'delay' | 'image' | 'userInput' | 'location' | 'httpRequest' | 'video' | 'audio' | 'document' | 'animation' | 'sticker' | 'poll' | 'contact' | 'venue' | 'dice' | 'invoice' | 'editMessage' | 'deleteMessage' | 'mediaGroup' | 'chatgpt' | 'groq' | 'gemini' | 'schedule' | 'webhook';

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
  // Video
  videoUrl?: string;
  // Audio
  audioUrl?: string;
  // Document
  documentUrl?: string;
  documentFilename?: string;
  // Animation/GIF
  animationUrl?: string;
  // Sticker
  stickerFileId?: string;
  // Poll
  pollQuestion?: string;
  pollOptions?: string[];
  pollIsAnonymous?: boolean;
  pollType?: 'regular' | 'quiz';
  pollCorrectOption?: number;
  // Contact
  contactPhone?: string;
  contactFirstName?: string;
  contactLastName?: string;
  // Venue
  venueAddress?: string;
  // Dice
  diceEmoji?: '🎲' | '🎯' | '🏀' | '⚽' | '🎳' | '🎰';
  // Invoice
  invoiceTitle?: string;
  invoiceDescription?: string;
  invoiceCurrency?: string;
  invoicePrice?: number;
  invoiceProviderToken?: string;
  // Edit Message
  editMessageId?: string;
  editText?: string;
  // Delete Message
  deleteMessageId?: string;
  // Media Group
  mediaGroupItems?: { type: 'photo' | 'video' | 'document'; url: string; caption?: string }[];
  // AI Nodes
  aiPrompt?: string;
  aiModel?: string;
  aiApiUrl?: string;
  aiApiKey?: string;
  aiSaveVariable?: string;
  // Schedule
  scheduleCron?: string;
  scheduleInterval?: number;
  scheduleIntervalUnit?: 'minutes' | 'hours' | 'days';
  scheduleTime?: string;
  scheduleDays?: string[];
  // Webhook
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT';
  webhookHeaders?: string;
  webhookSaveVariable?: string;
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
