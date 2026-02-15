import { DragItem, NodeType, Platform } from '@/types/flow';
import {
  Play, MessageSquare, GitBranch, MousePointerClick, Zap, Timer, Bot, Settings,
  ImageIcon, MessageCircleQuestion, MapPin, Globe, Video, Music, FileText, Film,
  Smile, BarChart3, Phone, Home, Dices, CreditCard, Pencil, Trash2, Images, Lock,
  Cpu, Sparkles, MessageCircle, Hash,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
import { isBlockLocked } from '@/lib/planLimits';
import { toast } from 'sonner';

const allNodeItems: DragItem[] = [
  { type: 'start', label: 'Início', icon: 'play', description: 'Ponto de entrada do fluxo' },
  { type: 'message', label: 'Mensagem', icon: 'message', description: 'Enviar mensagem de texto' },
  { type: 'image', label: 'Imagem', icon: 'image', description: 'Enviar foto ou imagem' },
  { type: 'buttonReply', label: 'Botões', icon: 'button', description: 'Resposta com botões' },
  { type: 'userInput', label: 'Entrada', icon: 'userInput', description: 'Aguardar resposta do usuário' },
  { type: 'condition', label: 'Condição', icon: 'branch', description: 'Desvio condicional' },
  { type: 'video', label: 'Vídeo', icon: 'video', description: 'Enviar vídeo ou nota de vídeo' },
  { type: 'audio', label: 'Áudio', icon: 'audio', description: 'Enviar áudio ou voz' },
  { type: 'document', label: 'Documento', icon: 'document', description: 'Enviar documento ou arquivo' },
  { type: 'animation', label: 'GIF', icon: 'animation', description: 'Enviar animação ou GIF' },
  { type: 'sticker', label: 'Sticker', icon: 'sticker', description: 'Enviar adesivo' },
  { type: 'poll', label: 'Enquete', icon: 'poll', description: 'Enviar enquete ou quiz' },
  { type: 'contact', label: 'Contato', icon: 'contact', description: 'Enviar ou solicitar contato' },
  { type: 'venue', label: 'Venue', icon: 'venue', description: 'Enviar local com endereço' },
  { type: 'location', label: 'Localização', icon: 'location', description: 'Enviar localização no mapa' },
  { type: 'dice', label: 'Dado', icon: 'dice', description: 'Enviar dado ou emoji animado' },
  { type: 'invoice', label: 'Fatura', icon: 'invoice', description: 'Enviar fatura para pagamento' },
  { type: 'editMessage', label: 'Editar Msg', icon: 'editMessage', description: 'Editar mensagem existente' },
  { type: 'deleteMessage', label: 'Deletar Msg', icon: 'deleteMessage', description: 'Deletar mensagem' },
  { type: 'mediaGroup', label: 'Grupo Mídia', icon: 'mediaGroup', description: 'Enviar grupo de mídias' },
  { type: 'action', label: 'Ação', icon: 'action', description: 'Executar ação ou API' },
  { type: 'httpRequest', label: 'HTTP Request', icon: 'httpRequest', description: 'Fazer requisição HTTP/API' },
  { type: 'delay', label: 'Atraso', icon: 'delay', description: 'Aguardar antes de continuar' },
  { type: 'chatgpt', label: 'ChatGPT', icon: 'chatgpt', description: 'IA via API OpenAI' },
  { type: 'groq', label: 'Groq', icon: 'groq', description: 'IA ultra-rápida via Groq' },
  { type: 'gemini', label: 'Gemini', icon: 'gemini', description: 'IA Google Gemini' },
];

// Blocks available per platform
const telegramBlocks: NodeType[] = [
  'start', 'message', 'image', 'buttonReply', 'userInput', 'condition',
  'video', 'audio', 'document', 'animation', 'sticker', 'poll', 'contact',
  'venue', 'location', 'dice', 'invoice', 'editMessage', 'deleteMessage',
  'mediaGroup', 'action', 'httpRequest', 'delay', 'chatgpt', 'groq', 'gemini',
];

const whatsappBlocks: NodeType[] = [
  'start', 'message', 'image', 'buttonReply', 'userInput', 'condition',
  'video', 'audio', 'document', 'location', 'contact',
  'action', 'httpRequest', 'delay', 'chatgpt', 'groq', 'gemini',
];

const discordBlocks: NodeType[] = [
  'start', 'message', 'image', 'buttonReply', 'userInput', 'condition',
  'action', 'httpRequest', 'delay', 'chatgpt', 'groq', 'gemini',
];

const platformBlockMap: Record<Platform, NodeType[]> = {
  telegram: telegramBlocks,
  whatsapp: whatsappBlocks,
  discord: discordBlocks,
};

const platformLabels: Record<Platform, { title: string; subtitle: string }> = {
  telegram: { title: 'FlowBot Builder', subtitle: 'Construtor de Bots Telegram' },
  whatsapp: { title: 'FlowBot Builder', subtitle: 'Construtor de Bots WhatsApp' },
  discord: { title: 'FlowBot Builder', subtitle: 'Construtor de Bots Discord' },
};

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
  video: <Video className="h-4 w-4" />,
  audio: <Music className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  animation: <Film className="h-4 w-4" />,
  sticker: <Smile className="h-4 w-4" />,
  poll: <BarChart3 className="h-4 w-4" />,
  contact: <Phone className="h-4 w-4" />,
  venue: <Home className="h-4 w-4" />,
  dice: <Dices className="h-4 w-4" />,
  invoice: <CreditCard className="h-4 w-4" />,
  editMessage: <Pencil className="h-4 w-4" />,
  deleteMessage: <Trash2 className="h-4 w-4" />,
  mediaGroup: <Images className="h-4 w-4" />,
  chatgpt: <Bot className="h-4 w-4" />,
  groq: <Cpu className="h-4 w-4" />,
  gemini: <Sparkles className="h-4 w-4" />,
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
  video: 'border-node-video/40 hover:border-node-video/70 text-node-video bg-node-video/5 hover:bg-node-video/10',
  audio: 'border-node-audio/40 hover:border-node-audio/70 text-node-audio bg-node-audio/5 hover:bg-node-audio/10',
  document: 'border-node-document/40 hover:border-node-document/70 text-node-document bg-node-document/5 hover:bg-node-document/10',
  animation: 'border-node-animation/40 hover:border-node-animation/70 text-node-animation bg-node-animation/5 hover:bg-node-animation/10',
  sticker: 'border-node-sticker/40 hover:border-node-sticker/70 text-node-sticker bg-node-sticker/5 hover:bg-node-sticker/10',
  poll: 'border-node-poll/40 hover:border-node-poll/70 text-node-poll bg-node-poll/5 hover:bg-node-poll/10',
  contact: 'border-node-contact/40 hover:border-node-contact/70 text-node-contact bg-node-contact/5 hover:bg-node-contact/10',
  venue: 'border-node-venue/40 hover:border-node-venue/70 text-node-venue bg-node-venue/5 hover:bg-node-venue/10',
  dice: 'border-node-dice/40 hover:border-node-dice/70 text-node-dice bg-node-dice/5 hover:bg-node-dice/10',
  invoice: 'border-node-invoice/40 hover:border-node-invoice/70 text-node-invoice bg-node-invoice/5 hover:bg-node-invoice/10',
  editMessage: 'border-node-editMessage/40 hover:border-node-editMessage/70 text-node-editMessage bg-node-editMessage/5 hover:bg-node-editMessage/10',
  deleteMessage: 'border-node-deleteMessage/40 hover:border-node-deleteMessage/70 text-node-deleteMessage bg-node-deleteMessage/5 hover:bg-node-deleteMessage/10',
  mediaGroup: 'border-node-mediaGroup/40 hover:border-node-mediaGroup/70 text-node-mediaGroup bg-node-mediaGroup/5 hover:bg-node-mediaGroup/10',
  chatgpt: 'border-node-chatgpt/40 hover:border-node-chatgpt/70 text-node-chatgpt bg-node-chatgpt/5 hover:bg-node-chatgpt/10',
  groq: 'border-node-groq/40 hover:border-node-groq/70 text-node-groq bg-node-groq/5 hover:bg-node-groq/10',
  gemini: 'border-node-gemini/40 hover:border-node-gemini/70 text-node-gemini bg-node-gemini/5 hover:bg-node-gemini/10',
};

const platformIconMap: Record<Platform, React.ReactNode> = {
  telegram: <Bot className="h-5 w-5 text-primary" />,
  whatsapp: <MessageCircle className="h-5 w-5 text-node-start" />,
  discord: <Hash className="h-5 w-5 text-node-button" />,
};

export function NodesSidebar({ platform = 'telegram' }: { platform?: Platform }) {
  const navigate = useNavigate();
  const { plan, loading: subLoading } = useSubscription();

  const availableTypes = platformBlockMap[platform] || telegramBlocks;
  const nodeItems = allNodeItems.filter(item => availableTypes.includes(item.type));
  const labels = platformLabels[platform];

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    if (!subLoading && isBlockLocked(nodeType, plan)) {
      event.preventDefault();
      toast.error('Bloco disponível apenas no plano Pro ou superior. Faça upgrade!');
      return;
    }
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('text/plain', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-sidebar">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
          {platformIconMap[platform]}
        </div>
        <div>
          <h1 className="text-sm font-bold text-foreground">{labels.title}</h1>
          <p className="text-[11px] text-muted-foreground">{labels.subtitle}</p>
        </div>
      </div>

      <div className="border-b border-border px-4 py-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex w-full items-center gap-2.5 rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
        >
          <Settings className="h-4 w-4 text-primary" />
          <div>
            <span className="font-medium">Voltar ao Dashboard</span>
            <p className="text-[10px] text-muted-foreground">Gerenciar bots</p>
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Blocos — {platformLabels[platform].subtitle.split(' ').pop()}
        </h2>
        <div className="space-y-2">
          {nodeItems.map((item) => {
            const locked = !subLoading && isBlockLocked(item.type, plan);
            return (
              <div
                key={item.type}
                draggable={!locked}
                onDragStart={(e) => onDragStart(e, item.type)}
                className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all ${
                  locked
                    ? 'cursor-not-allowed opacity-50 border-border bg-muted/5'
                    : `cursor-grab active:cursor-grabbing ${colorMap[item.type]}`
                }`}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-current/20 bg-current/10">
                  {iconMap[item.icon]}
                </div>
                <div className="flex-1">
                  <span className="block text-sm font-medium">{item.label}</span>
                  <span className="block text-[10px] text-muted-foreground">{item.description}</span>
                </div>
                {locked && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-border px-4 py-3">
        <p className="text-center text-[10px] text-muted-foreground">
          Arraste os blocos para o canvas →
        </p>
      </div>
    </aside>
  );
}
