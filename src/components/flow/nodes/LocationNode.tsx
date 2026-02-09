import { Handle, Position, NodeProps } from '@xyflow/react';
import { MapPin } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function LocationNode({ data }: NodeProps) {
  const nodeData = data as FlowNodeData;
  return (
    <div className="animate-node-enter group relative min-w-[220px] max-w-[280px] rounded-xl border border-node-location/30 bg-card p-0 shadow-lg shadow-node-location/10 transition-all hover:shadow-xl hover:shadow-node-location/20">
      <Handle
        type="target"
        position={Position.Top}
        className="!border-node-location/50 !bg-node-location"
      />
      <div className="flex items-center gap-2 rounded-t-xl px-4 py-2.5" style={{ background: 'var(--gradient-location)' }}>
        <MapPin className="h-4 w-4 text-primary-foreground" />
        <span className="text-sm font-semibold text-primary-foreground">{nodeData.label}</span>
      </div>
      <div className="px-4 py-3 space-y-1">
        {nodeData.latitude && nodeData.longitude ? (
          <>
            <p className="font-mono text-[10px] text-muted-foreground">
              📍 {nodeData.latitude}, {nodeData.longitude}
            </p>
            {nodeData.locationTitle && (
              <p className="text-xs text-secondary-foreground">{nodeData.locationTitle}</p>
            )}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Localização não definida</p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!border-node-location/50 !bg-node-location"
      />
    </div>
  );
}
