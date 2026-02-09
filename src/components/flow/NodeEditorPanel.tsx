import { X, MessageSquare, GitBranch, MousePointerClick, Zap, Timer, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFlow } from '@/contexts/FlowContext';
import { NodeType } from '@/types/flow';

const iconMap: Record<NodeType, React.ReactNode> = {
  start: <Play className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
  condition: <GitBranch className="h-4 w-4" />,
  buttonReply: <MousePointerClick className="h-4 w-4" />,
  action: <Zap className="h-4 w-4" />,
  delay: <Timer className="h-4 w-4" />,
};

const colorMap: Record<NodeType, string> = {
  start: 'text-node-start',
  message: 'text-node-message',
  condition: 'text-node-condition',
  buttonReply: 'text-node-button',
  action: 'text-node-action',
  delay: 'text-node-delay',
};

export function NodeEditorPanel() {
  const { selectedNode, setSelectedNode, updateNodeData } = useFlow();

  if (!selectedNode) return null;

  const nodeType = selectedNode.data.type;

  return (
    <div className="absolute right-4 top-4 z-10 w-80 rounded-xl border border-border bg-card shadow-xl animate-in slide-in-from-right-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={colorMap[nodeType]}>{iconMap[nodeType]}</span>
          <span className="font-semibold text-foreground">{selectedNode.data.label}</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setSelectedNode(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="space-y-4 p-4">
        {/* Label field for all nodes */}
        <div className="space-y-2">
          <Label htmlFor="label" className="text-xs text-muted-foreground">
            Nome do bloco
          </Label>
          <Input
            id="label"
            value={selectedNode.data.label}
            onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })}
            className="h-9"
          />
        </div>

        {/* Start node */}
        {nodeType === 'start' && (
          <div className="space-y-2">
            <Label htmlFor="trigger" className="text-xs text-muted-foreground">
              Comando de trigger
            </Label>
            <Input
              id="trigger"
              value={selectedNode.data.content || '/start'}
              onChange={(e) => updateNodeData(selectedNode.id, { content: e.target.value })}
              className="h-9 font-mono"
              placeholder="/start"
            />
          </div>
        )}

        {/* Message node */}
        {nodeType === 'message' && (
          <div className="space-y-2">
            <Label htmlFor="message" className="text-xs text-muted-foreground">
              Mensagem
            </Label>
            <Textarea
              id="message"
              value={selectedNode.data.content || ''}
              onChange={(e) => updateNodeData(selectedNode.id, { content: e.target.value })}
              className="min-h-[100px] resize-none"
              placeholder="Digite a mensagem que será enviada..."
            />
          </div>
        )}

        {/* Condition node */}
        {nodeType === 'condition' && (
          <div className="space-y-2">
            <Label htmlFor="condition" className="text-xs text-muted-foreground">
              Condição
            </Label>
            <Input
              id="condition"
              value={selectedNode.data.condition || ''}
              onChange={(e) => updateNodeData(selectedNode.id, { condition: e.target.value })}
              className="h-9 font-mono text-sm"
              placeholder='user.message == "sim"'
            />
            <p className="text-[10px] text-muted-foreground">
              Use variáveis como user.message, user.name, etc.
            </p>
          </div>
        )}

        {/* Button Reply node */}
        {nodeType === 'buttonReply' && (
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Botões</Label>
            {selectedNode.data.buttons?.map((button, index) => (
              <div key={button.id} className="flex gap-2">
                <Input
                  value={button.text}
                  onChange={(e) => {
                    const newButtons = [...(selectedNode.data.buttons || [])];
                    newButtons[index] = { ...newButtons[index], text: e.target.value };
                    updateNodeData(selectedNode.id, { buttons: newButtons });
                  }}
                  className="h-9"
                  placeholder={`Botão ${index + 1}`}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 shrink-0 text-destructive/70 hover:text-destructive"
                  onClick={() => {
                    const newButtons = selectedNode.data.buttons?.filter((_, i) => i !== index);
                    updateNodeData(selectedNode.id, { buttons: newButtons });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                const newButtons = [
                  ...(selectedNode.data.buttons || []),
                  { id: Date.now().toString(), text: '' },
                ];
                updateNodeData(selectedNode.id, { buttons: newButtons });
              }}
            >
              Adicionar botão
            </Button>
          </div>
        )}

        {/* Action node */}
        {nodeType === 'action' && (
          <div className="space-y-2">
            <Label htmlFor="action" className="text-xs text-muted-foreground">
              Ação
            </Label>
            <Select
              value={selectedNode.data.action || 'send_api_request'}
              onValueChange={(value) => updateNodeData(selectedNode.id, { action: value })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="send_api_request">Enviar requisição API</SelectItem>
                <SelectItem value="set_variable">Definir variável</SelectItem>
                <SelectItem value="send_email">Enviar email</SelectItem>
                <SelectItem value="add_tag">Adicionar tag</SelectItem>
                <SelectItem value="remove_tag">Remover tag</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Delay node */}
        {nodeType === 'delay' && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tempo de espera</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={selectedNode.data.delay || 5}
                onChange={(e) => updateNodeData(selectedNode.id, { delay: parseInt(e.target.value) || 0 })}
                className="h-9"
                min={1}
              />
              <Select
                value={selectedNode.data.delayUnit || 'seconds'}
                onValueChange={(value) => updateNodeData(selectedNode.id, { delayUnit: value as any })}
              >
                <SelectTrigger className="h-9 w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Segundos</SelectItem>
                  <SelectItem value="minutes">Minutos</SelectItem>
                  <SelectItem value="hours">Horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
