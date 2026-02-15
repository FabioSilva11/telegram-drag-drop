import { useState, useRef } from 'react';
import { Save, Undo2, Redo2, Trash2, Play, Square, Loader2, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFlow } from '@/contexts/FlowContext';
import { useSubscription } from '@/hooks/useSubscription';
import { canUseAI } from '@/lib/planLimits';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AIFlowDialog } from './AIFlowDialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import type { Platform } from '@/types/flow';

export function FlowToolbar({ botId, platform = 'telegram' }: { botId?: string; platform?: Platform } = {}) {
  const { nodes, edges, setNodes, setEdges, undo, redo, clearCanvas, canUndo, canRedo } = useFlow();
  const { plan } = useSubscription();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isBotActive, setIsBotActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const exportFlow = () => {
    const flowData = JSON.stringify({ nodes, edges }, null, 2);
    const blob = new Blob([flowData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `flow-${botId || 'export'}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Fluxo exportado com sucesso!');
  };

  const importFlow = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.nodes && data.edges) {
          setNodes(data.nodes);
          setEdges(data.edges);
          toast.success('Fluxo importado com sucesso!');
        } else {
          toast.error('Arquivo inválido: formato incorreto.');
        }
      } catch {
        toast.error('Erro ao ler o arquivo JSON.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const publishBot = async () => {
    if (nodes.length <= 1) { toast.error('Adicione pelo menos um bloco além do início.'); return; }
    setIsPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('set-telegram-webhook', { body: { nodes, edges, botId, action: 'activate' } });
      if (error) throw error;
      if (data?.success) {
        setIsBotActive(true);
        toast.success(data.bot?.username ? `Bot @${data.bot.username} publicado!` : 'Bot publicado!');
      } else throw new Error(data?.error || 'Erro desconhecido');
    } catch (err: any) { toast.error(`Erro: ${err.message}`); } finally { setIsPublishing(false); }
  };

  const deactivateBot = async () => {
    setIsPublishing(true);
    try {
      const { data, error } = await supabase.functions.invoke('set-telegram-webhook', { body: { action: 'deactivate', botId } });
      if (error) throw error;
      setIsBotActive(false);
      toast.success('Bot desativado.');
    } catch (err: any) { toast.error(`Erro: ${err.message}`); } finally { setIsPublishing(false); }
  };

  return (
    <div className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40" onClick={undo} disabled={!canUndo}>
          <Undo2 className="h-3.5 w-3.5" /> Desfazer
        </Button>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40" onClick={redo} disabled={!canRedo}>
          <Redo2 className="h-3.5 w-3.5" /> Refazer
        </Button>
        <div className="mx-2 h-5 w-px bg-border" />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-destructive/70 hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" /> Limpar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Limpar canvas?</AlertDialogTitle>
              <AlertDialogDescription>Isso removerá todos os blocos, mantendo apenas o início.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={clearCanvas}>Limpar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <div className="mx-2 h-5 w-px bg-border" />
        {canUseAI(plan) ? (
          <AIFlowDialog />
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs border-border text-muted-foreground opacity-60 cursor-not-allowed"
            onClick={() => toast.error('Recurso disponível apenas no plano Pro ou superior.')}
          >
            <span className="h-3.5 w-3.5">🔒</span>
            Gerar com IA (Pro)
          </Button>
        )}
        <div className="mx-2 h-5 w-px bg-border" />
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={exportFlow}>
          <Download className="h-3.5 w-3.5" /> Exportar
        </Button>
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => fileInputRef.current?.click()}>
          <Upload className="h-3.5 w-3.5" /> Importar
        </Button>
        <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={importFlow} />
      </div>

      <div className="flex items-center gap-4">
        {isBotActive && (
          <span className="flex items-center gap-1.5 text-[11px] text-node-start">
            <span className="h-2 w-2 rounded-full bg-node-start animate-pulse" /> Bot ativo
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {isBotActive && (
          <Button variant="outline" size="sm" className="h-8 gap-1.5 border-destructive/30 text-xs text-destructive hover:bg-destructive/10" onClick={deactivateBot} disabled={isPublishing}>
            {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Square className="h-3.5 w-3.5" />} Desativar
          </Button>
        )}
        <Button size="sm" className="h-8 gap-1.5 bg-node-start text-xs text-primary-foreground hover:bg-node-start/90" onClick={publishBot} disabled={isPublishing}>
          {isPublishing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          {isBotActive ? 'Republicar' : 'Publicar Bot'}
        </Button>
      </div>
    </div>
  );
}
