import { Handle, Position } from '@xyflow/react';
import { Webhook, Link2 } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function WebhookNode({ data }: { data: FlowNodeData }) {
  const prefix = String(data.webhookSaveVariable || 'webhook');
  return (
    <div className="min-w-[200px] rounded-xl border-2 border-indigo-500/30 bg-card shadow-lg animate-node-enter">
      <Handle type="target" position={Position.Left} className="!bg-indigo-500 !border-indigo-500" />
      <div className="flex items-center gap-2 rounded-t-xl bg-indigo-500/10 px-3 py-2">
        <Webhook className="h-4 w-4 text-indigo-400" />
        <span className="text-xs font-bold text-indigo-400">{data.label}</span>
      </div>
      <div className="px-3 py-2">
        <div className="flex items-center gap-1 text-[10px] text-indigo-300">
          <Link2 className="h-3 w-3" />
          <span>Recebe POST → {`{{${prefix}.*}}`}</span>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          JSON parseado em variáveis individuais
        </p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-indigo-500 !border-indigo-500" />
    </div>
  );
}
