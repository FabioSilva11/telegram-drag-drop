import { Handle, Position } from '@xyflow/react';
import { Music } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function AudioNode({ data }: { data: FlowNodeData }) {
  return (
    <div className="min-w-[180px] rounded-xl border-2 border-node-audio/30 bg-card shadow-lg animate-node-enter">
      <Handle type="target" position={Position.Left} className="!bg-node-audio !border-node-audio" />
      <div className="flex items-center gap-2 rounded-t-xl bg-node-audio/10 px-3 py-2">
        <Music className="h-4 w-4 text-node-audio" />
        <span className="text-xs font-bold text-node-audio">{data.label}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-muted-foreground truncate">{data.audioUrl || 'URL do áudio...'}</p>
        {data.caption && <p className="mt-1 text-[10px] text-foreground/70 truncate">{data.caption}</p>}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-node-audio !border-node-audio" />
    </div>
  );
}
