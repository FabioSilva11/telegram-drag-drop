import { Handle, Position } from '@xyflow/react';
import { Trash2 } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function DeleteMessageNode({ data }: { data: FlowNodeData }) {
  return (
    <div className="min-w-[180px] rounded-xl border-2 border-node-deleteMessage/30 bg-card shadow-lg animate-node-enter">
      <Handle type="target" position={Position.Left} className="!bg-node-deleteMessage !border-node-deleteMessage" />
      <div className="flex items-center gap-2 rounded-t-xl bg-node-deleteMessage/10 px-3 py-2">
        <Trash2 className="h-4 w-4 text-node-deleteMessage" />
        <span className="text-xs font-bold text-node-deleteMessage">{data.label}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-muted-foreground">Deletar mensagem por ID</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-node-deleteMessage !border-node-deleteMessage" />
    </div>
  );
}
