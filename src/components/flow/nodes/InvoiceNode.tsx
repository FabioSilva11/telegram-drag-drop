import { Handle, Position } from '@xyflow/react';
import { CreditCard } from 'lucide-react';
import { FlowNodeData } from '@/types/flow';

export function InvoiceNode({ data }: { data: FlowNodeData }) {
  return (
    <div className="min-w-[180px] rounded-xl border-2 border-node-invoice/30 bg-card shadow-lg animate-node-enter">
      <Handle type="target" position={Position.Left} className="!bg-node-invoice !border-node-invoice" />
      <div className="flex items-center gap-2 rounded-t-xl bg-node-invoice/10 px-3 py-2">
        <CreditCard className="h-4 w-4 text-node-invoice" />
        <span className="text-xs font-bold text-node-invoice">{data.label}</span>
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-foreground/80 truncate">{data.invoiceTitle || 'Título da fatura...'}</p>
        {data.invoicePrice && <p className="text-[10px] text-muted-foreground">{data.invoiceCurrency || 'BRL'} {(data.invoicePrice / 100).toFixed(2)}</p>}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-node-invoice !border-node-invoice" />
    </div>
  );
}
