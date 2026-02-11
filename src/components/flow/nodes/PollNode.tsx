import { Handle, Position } from '@xyflow/react';
import { BarChart3 } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function PollNode({ data }: { data: FlowNodeData }) {
  return (
    <div className="min-w-[180px] rounded-xl border-2 border-node-poll/30 bg-card shadow-lg animate-node-enter">
      <Handle type="target" position={Position.Left} className="!bg-node-poll !border-node-poll" />
      <div className="flex items-center gap-2 rounded-t-xl bg-node-poll/10 px-3 py-2">
        <BarChart3 className="h-4 w-4 text-node-poll" />
        <span className="text-xs font-bold text-node-poll">{data.label}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-foreground/80 truncate">{data.pollQuestion || 'Pergunta da enquete...'}</p>
        <p className="mt-1 text-[10px] text-muted-foreground">{data.pollOptions?.length || 0} opções • {data.pollType === 'quiz' ? 'Quiz' : 'Enquete'}</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-node-poll !border-node-poll" />
    </div>
  );
}
