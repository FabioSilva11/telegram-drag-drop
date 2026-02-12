import { NodeType } from '@/types/flow';
import { PlanKey } from './plans';

// Basic blocks available to all plans (including free)
export const FREE_BLOCKS: NodeType[] = [
  'start', 'message', 'image', 'buttonReply', 'userInput', 'condition',
];

// All blocks - premium users get everything
export const ALL_BLOCKS: NodeType[] = [
  'start', 'message', 'image', 'buttonReply', 'userInput', 'condition',
  'video', 'audio', 'document', 'animation', 'sticker', 'poll',
  'contact', 'venue', 'location', 'dice', 'invoice', 'editMessage',
  'deleteMessage', 'mediaGroup', 'action', 'httpRequest', 'delay',
];

export function getAvailableBlocks(plan: PlanKey): NodeType[] {
  if (plan === 'starter') return FREE_BLOCKS;
  return ALL_BLOCKS;
}

export function canUseAI(plan: PlanKey): boolean {
  return plan !== 'starter';
}

export function isBlockLocked(type: NodeType, plan: PlanKey): boolean {
  if (plan !== 'starter') return false;
  return !FREE_BLOCKS.includes(type);
}
