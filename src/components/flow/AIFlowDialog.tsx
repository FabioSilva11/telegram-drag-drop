import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useFlow } from '@/contexts/FlowContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FlowNode, FlowEdge } from '@/types/flow';

export function AIFlowDialog() {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { setNodes, setEdges } = useFlow();

  const generateFlow = async () => {
    if (!prompt.trim()) { toast.error('Descreva o fluxo que deseja gerar.'); return; }
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-flow', { body: { prompt } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      const nodes: FlowNode[] = data.nodes || [];
      const edges: FlowEdge[] = data.edges || [];

      if (nodes.length === 0) { toast.error('A IA não conseguiu gerar um fluxo válido. Tente com outra descrição.'); return; }

      setNodes(nodes);
      setEdges(edges);
      toast.success(`Fluxo gerado com ${nodes.length} blocos!`);
      setOpen(false);
      setPrompt('');
    } catch (err: any) {
      console.error('AI generate error:', err);
      toast.error(err.message || 'Erro ao gerar fluxo com IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10">
          <Sparkles className="h-3.5 w-3.5" />
          Gerar com IA
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerar Fluxo com IA
          </DialogTitle>
          <DialogDescription>
            Descreva o bot que deseja criar e a IA gerará o fluxo automaticamente.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Bot de atendimento ao cliente que pergunta o nome, apresenta um menu com 3 opções (Suporte, Vendas, Financeiro) e direciona para mensagens diferentes..."
            className="min-h-[120px] resize-none"
          />
          <p className="text-[10px] text-muted-foreground">
            ⚠️ Isso substituirá o fluxo atual. Certifique-se de salvar antes.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={generateFlow} disabled={isGenerating} className="gap-1.5">
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isGenerating ? 'Gerando...' : 'Gerar Fluxo'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
