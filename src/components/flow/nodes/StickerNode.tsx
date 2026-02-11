import { Handle, Position } from '@xyflow/react';
import { Smile } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function StickerNode({ data }: { data: FlowNodeData }) {
  return (
    <div className="min-w-[180px] rounded-xl border-2 border-node-sticker/30 bg-card shadow-lg animate-node-enter">
      <Handle type="target" position={Position.Left} className="!bg-node-sticker !border-node-sticker" />
      <div className="flex items-center gap-2 rounded-t-xl bg-node-sticker/10 px-3 py-2">
        <Smile className="h-4 w-4 text-node-sticker" />
        <span className="text-xs font-bold text-node-sticker">{data.label}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-muted-foreground truncate">{data.stickerFileId || 'File ID do sticker...'}</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-node-sticker !border-node-sticker" />
    </div>
  );
}
