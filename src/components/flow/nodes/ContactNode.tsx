import { Handle, Position } from '@xyflow/react';
import { Phone } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function ContactNode({ data }: { data: FlowNodeData }) {
  return (
    <div className="min-w-[180px] rounded-xl border-2 border-node-contact/30 bg-card shadow-lg animate-node-enter">
      <Handle type="target" position={Position.Left} className="!bg-node-contact !border-node-contact" />
      <div className="flex items-center gap-2 rounded-t-xl bg-node-contact/10 px-3 py-2">
        <Phone className="h-4 w-4 text-node-contact" />
        <span className="text-xs font-bold text-node-contact">{data.label}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-foreground/80 truncate">{data.contactFirstName || 'Nome do contato...'}</p>
        <p className="text-[10px] text-muted-foreground truncate">{data.contactPhone || 'Telefone...'}</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-node-contact !border-node-contact" />
    </div>
  );
}
