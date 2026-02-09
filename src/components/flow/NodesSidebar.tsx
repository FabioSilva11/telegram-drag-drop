import { DragItem, NodeType } from '@/types/flow';
import {
  Play,
  MessageSquare,
  GitBranch,
  MousePointerClick,
  Zap,
  Timer,
  Bot,
  Settings,
  ImageIcon,
  MessageCircleQuestion,
  MapPin,
  Globe,
} from 'lucide-react';
import { BotSettingsDialog } from './BotSettingsDialog';
import { useState } from 'react';

const nodeItems: DragItem[] = [
  {
    type: 'start',
    label: 'Início',
    icon: 'play',
    description: 'Ponto de entrada do fluxo',
  },
  {
    type: 'message',
    label: 'Mensagem',
    icon: 'message',
    description: 'Enviar mensagem de texto',
  },
  {
    type: 'image',
    label: 'Imagem',
    icon: 'image',
    description: 'Enviar foto ou imagem',
  },
  {
    type: 'buttonReply',
    label: 'Botões',
    icon: 'button',
    description: 'Resposta com botões (saídas individuais)',
  },
  {
    type: 'userInput',
    label: 'Entrada',
    icon: 'userInput',
    description: 'Aguardar resposta do usuário',
  },
  {
    type: 'condition',
    label: 'Condição',
    icon: 'branch',
    description: 'Desvio condicional (Se/Senão)',
  },
  {
    type: 'action',
    label: 'Ação',
    icon: 'action',
    description: 'Executar ação ou API',
  },
  {
    type: 'httpRequest',
    label: 'HTTP Request',
    icon: 'httpRequest',
    description: 'Fazer requisição HTTP/API',
  },
  {
    type: 'location',
    label: 'Localização',
    icon: 'location',
    description: 'Enviar localização no mapa',
  },
  {
    type: 'delay',
    label: 'Atraso',
    icon: 'delay',
    description: 'Aguardar antes de continuar',
  },
];

const iconMap: Record<string, React.ReactNode> = {
  play: <Play className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
  branch: <GitBranch className="h-4 w-4" />,
  button: <MousePointerClick className="h-4 w-4" />,
  action: <Zap className="h-4 w-4" />,
  delay: <Timer className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />,
  userInput: <MessageCircleQuestion className="h-4 w-4" />,
  location: <MapPin className="h-4 w-4" />,
  httpRequest: <Globe className="h-4 w-4" />,
};

const colorMap: Record<NodeType, string> = {
  start: 'border-node-start/40 hover:border-node-start/70 text-node-start bg-node-start/5 hover:bg-node-start/10',
  message: 'border-node-message/40 hover:border-node-message/70 text-node-message bg-node-message/5 hover:bg-node-message/10',
  condition: 'border-node-condition/40 hover:border-node-condition/70 text-node-condition bg-node-condition/5 hover:bg-node-condition/10',
  buttonReply: 'border-node-button/40 hover:border-node-button/70 text-node-button bg-node-button/5 hover:bg-node-button/10',
  action: 'border-node-action/40 hover:border-node-action/70 text-node-action bg-node-action/5 hover:bg-node-action/10',
  delay: 'border-node-delay/40 hover:border-node-delay/70 text-node-delay bg-node-delay/5 hover:bg-node-delay/10',
  image: 'border-node-image/40 hover:border-node-image/70 text-node-image bg-node-image/5 hover:bg-node-image/10',
  userInput: 'border-node-userInput/40 hover:border-node-userInput/70 text-node-userInput bg-node-userInput/5 hover:bg-node-userInput/10',
  location: 'border-node-location/40 hover:border-node-location/70 text-node-location bg-node-location/5 hover:bg-node-location/10',
  httpRequest: 'border-node-httpRequest/40 hover:border-node-httpRequest/70 text-node-httpRequest bg-node-httpRequest/5 hover:bg-node-httpRequest/10',
};

export function NodesSidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false);

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground">FlowBot Builder</h1>
          <p className="text-[11px] text-muted-foreground">Construtor de Bots Telegram</p>
        </div>
      </div>

      {/* Bot Settings Button */}
      <div className="border-b border-border px-4 py-3">
        <button
          onClick={() => setSettingsOpen(true)}
          className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <Settings className="h-4 w-4 text-primary" />
          <div>
            <span className="font-medium">Credenciais do Bot</span>
            <p className="text-[10px] text-muted-foreground">Token & Configurações</p>
          </div>
        </button>
      </div>

      {/* Nodes */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Blocos
        </h2>
        <div className="space-y-2">
          {nodeItems.map((item) => (
            <div
              key={item.type}
              draggable
              onDragStart={(e) => onDragStart(e, item.type)}
              className={`flex cursor-grab items-center gap-3 rounded-lg border px-3 py-2.5 transition-all active:cursor-grabbing ${colorMap[item.type]}`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-current/20 bg-current/10">
                {iconMap[item.icon]}
              </div>
              <div>
                <span className="block text-sm font-medium">{item.label}</span>
                <span className="block text-[10px] text-muted-foreground">{item.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <p className="text-center text-[10px] text-muted-foreground">
          Arraste os blocos para o canvas →
        </p>
      </div>

      <BotSettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </aside>
  );
}
