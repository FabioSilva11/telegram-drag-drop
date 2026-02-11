import { Handle, Position } from '@xyflow/react';
import { Film } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function AnimationNode({ data }: { data: FlowNodeData }) {
  return (
    <div className="min-w-[180px] rounded-xl border-2 border-node-animation/30 bg-card shadow-lg animate-node-enter">
      <Handle type="target" position={Position.Left} className="!bg-node-animation !border-node-animation" />
      <div className="flex items-center gap-2 rounded-t-xl bg-node-animation/10 px-3 py-2">
        <Film className="h-4 w-4 text-node-animation" />
        <span className="text-xs font-bold text-node-animation">{data.label}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-muted-foreground truncate">{data.animationUrl || 'URL do GIF...'}</p>
        {data.caption && <p className="mt-1 text-[10px] text-foreground/70 truncate">{data.caption}</p>}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-node-animation !border-node-animation" />
    </div>
  );
}
