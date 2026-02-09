import { Handle, Position, NodeProps } from '@xyflow/react';
import { ImageIcon } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function ImageNode({ data }: NodeProps) {
  const nodeData = data as FlowNodeData;
  return (
    <div className="animate-node-enter group relative min-w-[220px] max-w-[280px] rounded-xl border border-node-image/30 bg-card p-0 shadow-lg shadow-node-image/10 transition-all hover:shadow-xl hover:shadow-node-image/20">
      <Handle
        type="target"
        position={Position.Top}
        className="!border-node-image/50 !bg-node-image"
      />
      <div className="flex items-center gap-2 rounded-t-xl px-4 py-2.5" style={{ background: 'var(--gradient-image)' }}>
        <ImageIcon className="h-4 w-4 text-primary-foreground" />
        <span className="text-sm font-semibold text-primary-foreground">{nodeData.label}</span>
      </div>
      <div className="px-4 py-3 space-y-1">
        {nodeData.imageUrl ? (
          <div className="rounded-lg border border-node-image/20 bg-node-image/5 p-2">
            <p className="text-[10px] text-muted-foreground truncate">📎 {nodeData.imageUrl}</p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Nenhuma imagem definida</p>
        )}
        {nodeData.caption && (
          <p className="text-[10px] text-secondary-foreground truncate">💬 {nodeData.caption}</p>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!border-node-image/50 !bg-node-image"
      />
    </div>
  );
}
