import { Handle, Position } from '@xyflow/react';
import { Pencil } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function EditMessageNode({ data }: { data: FlowNodeData }) {
  return (
    <div className="min-w-[180px] rounded-xl border-2 border-node-editMessage/30 bg-card shadow-lg animate-node-enter">
      <Handle type="target" position={Position.Left} className="!bg-node-editMessage !border-node-editMessage" />
      <div className="flex items-center gap-2 rounded-t-xl bg-node-editMessage/10 px-3 py-2">
        <Pencil className="h-4 w-4 text-node-editMessage" />
        <span className="text-xs font-bold text-node-editMessage">{data.label}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-foreground/80 truncate">{data.editText || 'Novo texto da mensagem...'}</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-node-editMessage !border-node-editMessage" />
    </div>
  );
}
