import { Handle, Position } from '@xyflow/react';
import { Dices } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function DiceNode({ data }: { data: FlowNodeData }) {
  return (
    <div className="min-w-[180px] rounded-xl border-2 border-node-dice/30 bg-card shadow-lg animate-node-enter">
      <Handle type="target" position={Position.Left} className="!bg-node-dice !border-node-dice" />
      <div className="flex items-center gap-2 rounded-t-xl bg-node-dice/10 px-3 py-2">
        <Dices className="h-4 w-4 text-node-dice" />
        <span className="text-xs font-bold text-node-dice">{data.label}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-foreground/80">{data.diceEmoji || '🎲'} Dado aleatório</p>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-node-dice !border-node-dice" />
    </div>
  );
}
