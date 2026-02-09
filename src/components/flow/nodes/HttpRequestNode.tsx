import { Handle, Position, NodeProps } from '@xyflow/react';
import { Globe } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function HttpRequestNode({ data }: NodeProps) {
  const nodeData = data as FlowNodeData;
  
  const methodColors: Record<string, string> = {
    GET: 'text-node-start',
    POST: 'text-node-message',
    PUT: 'text-node-condition',
    DELETE: 'text-node-action',
  };

  return (
    <div className="animate-node-enter group relative min-w-[220px] max-w-[280px] rounded-xl border border-node-httpRequest/30 bg-card p-0 shadow-lg shadow-node-httpRequest/10 transition-all hover:shadow-xl hover:shadow-node-httpRequest/20">
      <Handle
        type="target"
        position={Position.Top}
        className="!border-node-httpRequest/50 !bg-node-httpRequest"
      />
      <div className="flex items-center gap-2 rounded-t-xl px-4 py-2.5" style={{ background: 'var(--gradient-httpRequest)' }}>
        <Globe className="h-4 w-4 text-primary-foreground" />
        <span className="text-sm font-semibold text-primary-foreground">{nodeData.label}</span>
      </div>
      <div className="px-4 py-3 space-y-1">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold ${methodColors[nodeData.httpMethod || 'GET'] || 'text-muted-foreground'}`}>
            {nodeData.httpMethod || 'GET'}
          </span>
          <p className="font-mono text-[10px] text-muted-foreground truncate flex-1">
            {nodeData.httpUrl || 'URL não definida'}
          </p>
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!border-node-httpRequest/50 !bg-node-httpRequest"
      />
    </div>
  );
}
