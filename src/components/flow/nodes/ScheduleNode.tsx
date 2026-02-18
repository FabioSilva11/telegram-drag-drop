import { Handle, Position, NodeProps } from '@xyflow/react';
import { Clock } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function ScheduleNode({ data }: NodeProps) {
  const nodeData = data as FlowNodeData;
  const interval = nodeData.scheduleInterval || 1;
  const unit = nodeData.scheduleIntervalUnit || 'hours';
  const time = nodeData.scheduleTime || '';
  const unitLabels: Record<string, string> = { minutes: 'min', hours: 'h', days: 'd' };

  return (
    <div className="animate-node-enter group relative min-w-[220px] max-w-[280px] rounded-xl border border-amber-500/30 bg-card p-0 shadow-lg shadow-amber-500/10 transition-all hover:shadow-xl hover:shadow-amber-500/20">
      <Handle type="target" position={Position.Top} className="!border-amber-500/50 !bg-amber-500" />
      <div className="flex items-center gap-2 rounded-t-xl bg-gradient-to-r from-amber-600 to-orange-500 px-4 py-2.5">
        <Clock className="h-4 w-4 text-primary-foreground" />
        <span className="text-sm font-semibold text-primary-foreground">{nodeData.label}</span>
      </div>
      <div className="px-4 py-3 space-y-1">
        <p className="text-xs text-muted-foreground">
          A cada <span className="font-semibold text-amber-400">{interval}{unitLabels[unit]}</span>
        </p>
        {time && (
          <p className="text-xs text-muted-foreground">
            Horário: <span className="font-semibold text-amber-400">{time}</span>
          </p>
        )}
        {nodeData.scheduleDays && nodeData.scheduleDays.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Dias: <span className="font-semibold text-amber-400">{nodeData.scheduleDays.join(', ')}</span>
          </p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="!border-amber-500/50 !bg-amber-500" />
    </div>
  );
}
