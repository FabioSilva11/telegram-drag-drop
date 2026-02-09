import { Handle, Position, NodeProps } from '@xyflow/react';
import { MousePointerClick } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function ButtonReplyNode({ data }: NodeProps) {
  const nodeData = data as FlowNodeData;
  const buttons = nodeData.buttons || [];

  return (
    <div className="animate-node-enter group relative min-w-[220px] max-w-[280px] rounded-xl border border-node-button/30 bg-card p-0 shadow-lg shadow-node-button/10 transition-all hover:shadow-xl hover:shadow-node-button/20">
      <Handle
        type="target"
        position={Position.Top}
        className="!border-node-button/50 !bg-node-button"
      />
      <div className="flex items-center gap-2 rounded-t-xl px-4 py-2.5" style={{ background: 'var(--gradient-button)' }}>
        <MousePointerClick className="h-4 w-4 text-primary-foreground" />
        <span className="text-sm font-semibold text-primary-foreground">{nodeData.label}</span>
      </div>
      <div className="space-y-1.5 px-4 py-3">
        {buttons.map((btn, index) => (
          <div key={btn.id} className="relative">
            <div className="rounded-lg border border-node-button/20 bg-node-button/10 px-3 py-1.5 text-center text-xs font-medium text-node-button">
              {btn.text || `Botão ${index + 1}`}
            </div>
            <Handle
              type="source"
              position={Position.Right}
              id={`btn-${btn.id}`}
              style={{ top: '50%', right: -8 }}
              className="!border-node-button/50 !bg-node-button !h-2.5 !w-2.5"
            />
          </div>
        ))}
        {buttons.length === 0 && (
          <p className="text-xs text-muted-foreground">Sem botões configurados</p>
        )}
      </div>
      {/* Fallback output for when no button is matched */}
      <div className="flex items-center justify-center border-t border-node-button/10 px-4 py-1.5">
        <span className="text-[10px] text-muted-foreground">Saída padrão ↓</span>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        id="default"
        className="!border-node-button/50 !bg-node-button"
      />
    </div>
  );
}
