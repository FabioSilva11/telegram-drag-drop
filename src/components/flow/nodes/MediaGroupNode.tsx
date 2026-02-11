import { Handle, Position } from '@xyflow/react';
import { Images } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function MediaGroupNode({ data }: { data: FlowNodeData }) {
  return (
    <div className="min-w-[180px] rounded-xl border-2 border-node-mediaGroup/30 bg-card shadow-lg animate-node-enter">
      <Handle type="target" position={Position.Left} className="!bg-node-mediaGroup !border-node-mediaGroup" />
      <div className="flex items-center gap-2 rounded-t-xl bg-node-mediaGroup/10 px-3 py-2">
        <Images className="h-4 w-4 text-node-mediaGroup" />
        <span className="text-xs font-bold text-node-mediaGroup">{data.label}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-muted-foreground">{data.mediaGroupItems?.length || 0} mídias no grupo</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-node-mediaGroup !border-node-mediaGroup" />
    </div>
  );
}
