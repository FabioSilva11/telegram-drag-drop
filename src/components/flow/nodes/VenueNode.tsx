import { Handle, Position } from '@xyflow/react';
import { Home } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function VenueNode({ data }: { data: FlowNodeData }) {
  return (
    <div className="min-w-[180px] rounded-xl border-2 border-node-venue/30 bg-card shadow-lg animate-node-enter">
      <Handle type="target" position={Position.Left} className="!bg-node-venue !border-node-venue" />
      <div className="flex items-center gap-2 rounded-t-xl bg-node-venue/10 px-3 py-2">
        <Home className="h-4 w-4 text-node-venue" />
        <span className="text-xs font-bold text-node-venue">{data.label}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-foreground/80 truncate">{data.locationTitle || 'Nome do local...'}</p>
        <p className="text-[10px] text-muted-foreground truncate">{data.venueAddress || 'Endereço...'}</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-node-venue !border-node-venue" />
    </div>
  );
}
