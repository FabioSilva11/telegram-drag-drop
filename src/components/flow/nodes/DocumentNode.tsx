import { Handle, Position } from '@xyflow/react';
import { FileText } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function DocumentNode({ data }: { data: FlowNodeData }) {
  return (
    <div className="min-w-[180px] rounded-xl border-2 border-node-document/30 bg-card shadow-lg animate-node-enter">
      <Handle type="target" position={Position.Left} className="!bg-node-document !border-node-document" />
      <div className="flex items-center gap-2 rounded-t-xl bg-node-document/10 px-3 py-2">
        <FileText className="h-4 w-4 text-node-document" />
        <span className="text-xs font-bold text-node-document">{data.label}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-muted-foreground truncate">{data.documentUrl || 'URL do documento...'}</p>
        {data.documentFilename && <p className="mt-1 text-[10px] text-foreground/70 truncate">📎 {data.documentFilename}</p>}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-node-document !border-node-document" />
    </div>
  );
}
