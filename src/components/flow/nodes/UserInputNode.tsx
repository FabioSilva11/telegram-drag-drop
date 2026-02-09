import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageCircleQuestion } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function UserInputNode({ data }: NodeProps) {
  const nodeData = data as FlowNodeData;
  return (
    <div className="animate-node-enter group relative min-w-[220px] max-w-[280px] rounded-xl border border-node-userInput/30 bg-card p-0 shadow-lg shadow-node-userInput/10 transition-all hover:shadow-xl hover:shadow-node-userInput/20">
      <Handle
        type="target"
        position={Position.Top}
        className="!border-node-userInput/50 !bg-node-userInput"
      />
      <div className="flex items-center gap-2 rounded-t-xl px-4 py-2.5" style={{ background: 'var(--gradient-userInput)' }}>
        <MessageCircleQuestion className="h-4 w-4 text-primary-foreground" />
        <span className="text-sm font-semibold text-primary-foreground">{nodeData.label}</span>
      </div>
      <div className="px-4 py-3 space-y-1">
        <p className="text-xs leading-relaxed text-secondary-foreground">
          {nodeData.promptText || 'Aguardando resposta do usuário...'}
        </p>
        {nodeData.variableName && (
          <p className="text-[10px] font-mono text-node-userInput">
            → {nodeData.variableName}
          </p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!border-node-userInput/50 !bg-node-userInput"
      />
    </div>
  );
}
