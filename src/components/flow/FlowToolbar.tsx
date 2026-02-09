import { Save, Undo2, Redo2, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFlow } from '@/contexts/FlowContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function FlowToolbar() {
  const { undo, redo, clearCanvas, canUndo, canRedo } = useFlow();

  return (
    <div className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
          onClick={undo}
          disabled={!canUndo}
        >
          <Undo2 className="h-3.5 w-3.5" />
          Desfazer
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground disabled:opacity-40"
          onClick={redo}
          disabled={!canRedo}
        >
          <Redo2 className="h-3.5 w-3.5" />
          Refazer
        </Button>
        <div className="mx-2 h-5 w-px bg-border" />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 text-xs text-destructive/70 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Limpar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Limpar canvas?</AlertDialogTitle>
              <AlertDialogDescription>
                Isso removerá todos os blocos do canvas, mantendo apenas o bloco inicial.
                Esta ação pode ser desfeita com o botão Desfazer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={clearCanvas}>Limpar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-[11px] text-muted-foreground">
          Clique em um bloco para editar suas propriedades
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 gap-1.5 border-border text-xs">
          <Save className="h-3.5 w-3.5" />
          Salvar
        </Button>
        <Button size="sm" className="h-8 gap-1.5 bg-node-start text-xs text-primary-foreground hover:bg-node-start/90">
          <Play className="h-3.5 w-3.5" />
          Publicar Bot
        </Button>
      </div>
    </div>
  );
}
