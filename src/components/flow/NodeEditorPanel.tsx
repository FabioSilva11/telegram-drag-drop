import { X, MessageSquare, GitBranch, MousePointerClick, Zap, Timer, Play, ImageIcon, MessageCircleQuestion, MapPin, Globe, Video, Music, FileText, Film, Smile, BarChart3, Phone, Home, Dices, CreditCard, Pencil, Trash2, Images, Bot, Cpu, Sparkles, Clock } from 'lucide-react';
import { FileUploadField } from './FileUploadField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useFlow } from '@/contexts/FlowContext';
import { NodeType } from '@/types/flow';

const iconMap: Record<NodeType, React.ReactNode> = {
  start: <Play className="h-4 w-4" />, message: <MessageSquare className="h-4 w-4" />,
  condition: <GitBranch className="h-4 w-4" />, buttonReply: <MousePointerClick className="h-4 w-4" />,
  action: <Zap className="h-4 w-4" />, delay: <Timer className="h-4 w-4" />,
  image: <ImageIcon className="h-4 w-4" />, userInput: <MessageCircleQuestion className="h-4 w-4" />,
  location: <MapPin className="h-4 w-4" />, httpRequest: <Globe className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />, audio: <Music className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />, animation: <Film className="h-4 w-4" />,
  sticker: <Smile className="h-4 w-4" />, poll: <BarChart3 className="h-4 w-4" />,
  contact: <Phone className="h-4 w-4" />, venue: <Home className="h-4 w-4" />,
  dice: <Dices className="h-4 w-4" />, invoice: <CreditCard className="h-4 w-4" />,
  editMessage: <Pencil className="h-4 w-4" />, deleteMessage: <Trash2 className="h-4 w-4" />,
  mediaGroup: <Images className="h-4 w-4" />,
  chatgpt: <Bot className="h-4 w-4" />, groq: <Cpu className="h-4 w-4" />,
  gemini: <Sparkles className="h-4 w-4" />, schedule: <Clock className="h-4 w-4" />,
};

const colorMap: Record<NodeType, string> = {
  start: 'text-node-start', message: 'text-node-message', condition: 'text-node-condition',
  buttonReply: 'text-node-button', action: 'text-node-action', delay: 'text-node-delay',
  image: 'text-node-image', userInput: 'text-node-userInput', location: 'text-node-location',
  httpRequest: 'text-node-httpRequest', video: 'text-node-video', audio: 'text-node-audio',
  document: 'text-node-document', animation: 'text-node-animation', sticker: 'text-node-sticker',
  poll: 'text-node-poll', contact: 'text-node-contact', venue: 'text-node-venue',
  dice: 'text-node-dice', invoice: 'text-node-invoice', editMessage: 'text-node-editMessage',
  deleteMessage: 'text-node-deleteMessage', mediaGroup: 'text-node-mediaGroup',
  chatgpt: 'text-node-chatgpt', groq: 'text-node-groq',
  gemini: 'text-node-gemini', schedule: 'text-amber-500',
};

export function NodeEditorPanel() {
  const { selectedNode, setSelectedNode, updateNodeData } = useFlow();
  if (!selectedNode) return null;
  const nodeType = selectedNode.data.type;

  return (
    <div className="absolute right-4 top-4 z-10 w-80 rounded-xl border border-border bg-card shadow-xl animate-in slide-in-from-right-4 max-h-[calc(100vh-120px)] overflow-y-auto" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3 sticky top-0 bg-card rounded-t-xl z-10">
        <div className="flex items-center gap-2">
          <span className={colorMap[nodeType]}>{iconMap[nodeType]}</span>
          <span className="font-semibold text-foreground">{selectedNode.data.label}</span>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedNode(null)}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 p-4">
        {/* Label */}
        <div className="space-y-2">
          <Label htmlFor="label" className="text-xs text-muted-foreground">Nome do bloco</Label>
          <Input id="label" value={selectedNode.data.label} onChange={(e) => updateNodeData(selectedNode.id, { label: e.target.value })} className="h-9" />
        </div>

        {/* Start */}
        {nodeType === 'start' && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Comando de trigger</Label>
            <Input value={selectedNode.data.content || '/start'} onChange={(e) => updateNodeData(selectedNode.id, { content: e.target.value })} className="h-9 font-mono" placeholder="/start" />
          </div>
        )}

        {/* Message */}
        {nodeType === 'message' && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Mensagem</Label>
            <Textarea value={selectedNode.data.content || ''} onChange={(e) => updateNodeData(selectedNode.id, { content: e.target.value })} className="min-h-[100px] resize-none" placeholder="Digite a mensagem..." />
          </div>
        )}

        {/* Condition */}
        {nodeType === 'condition' && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Condição</Label>
            <Input value={selectedNode.data.condition || ''} onChange={(e) => updateNodeData(selectedNode.id, { condition: e.target.value })} className="h-9 font-mono text-sm" placeholder='user.message == "sim"' />
            <p className="text-[10px] text-muted-foreground">Use variáveis como user.message, user.name, etc.</p>
          </div>
        )}

        {/* Button Reply */}
        {nodeType === 'buttonReply' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Texto da pergunta</Label>
              <Textarea value={selectedNode.data.content || ''} onChange={(e) => updateNodeData(selectedNode.id, { content: e.target.value })} className="min-h-[60px] resize-none" placeholder="Escolha uma opção:" />
            </div>
            <Label className="text-xs text-muted-foreground">Botões</Label>
            {selectedNode.data.buttons?.map((button, index) => (
              <div key={button.id} className="flex gap-2">
                <Input value={button.text} onChange={(e) => { const nb = [...(selectedNode.data.buttons || [])]; nb[index] = { ...nb[index], text: e.target.value }; updateNodeData(selectedNode.id, { buttons: nb }); }} className="h-9" placeholder={`Botão ${index + 1}`} />
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive/70 hover:text-destructive" onClick={() => updateNodeData(selectedNode.id, { buttons: selectedNode.data.buttons?.filter((_, i) => i !== index) })}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => updateNodeData(selectedNode.id, { buttons: [...(selectedNode.data.buttons || []), { id: Date.now().toString(), text: '' }] })}>Adicionar botão</Button>
          </div>
        )}

        {/* Action */}
        {nodeType === 'action' && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Ação</Label>
            <Select value={selectedNode.data.action || 'send_api_request'} onValueChange={(v) => updateNodeData(selectedNode.id, { action: v })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
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

        {/* Delay */}
        {nodeType === 'delay' && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tempo de espera</Label>
            <div className="flex gap-2">
              <Input type="number" value={selectedNode.data.delay || 5} onChange={(e) => updateNodeData(selectedNode.id, { delay: parseInt(e.target.value) || 0 })} className="h-9" min={1} />
              <Select value={selectedNode.data.delayUnit || 'seconds'} onValueChange={(v) => updateNodeData(selectedNode.id, { delayUnit: v as any })}>
                <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="seconds">Segundos</SelectItem>
                  <SelectItem value="minutes">Minutos</SelectItem>
                  <SelectItem value="hours">Horas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Image */}
        {nodeType === 'image' && (
          <div className="space-y-3">
            <FileUploadField label="Imagem" value={selectedNode.data.imageUrl || ''} onChange={(url) => updateNodeData(selectedNode.id, { imageUrl: url })} accept="image/*" placeholder="https://exemplo.com/imagem.jpg" />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Legenda (opcional)</Label>
              <Textarea value={selectedNode.data.caption || ''} onChange={(e) => updateNodeData(selectedNode.id, { caption: e.target.value })} className="min-h-[60px] resize-none" placeholder="Legenda..." />
            </div>
          </div>
        )}

        {/* User Input */}
        {nodeType === 'userInput' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Pergunta para o usuário</Label>
              <Textarea value={selectedNode.data.promptText || ''} onChange={(e) => updateNodeData(selectedNode.id, { promptText: e.target.value })} className="min-h-[80px] resize-none" placeholder="Qual é o seu nome?" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Salvar resposta na variável</Label>
              <Input value={selectedNode.data.variableName || ''} onChange={(e) => updateNodeData(selectedNode.id, { variableName: e.target.value })} className="h-9 font-mono" placeholder="user_name" />
            </div>
          </div>
        )}

        {/* Location */}
        {nodeType === 'location' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Título</Label>
              <Input value={selectedNode.data.locationTitle || ''} onChange={(e) => updateNodeData(selectedNode.id, { locationTitle: e.target.value })} className="h-9" placeholder="Nosso escritório" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">Latitude</Label>
                <Input type="number" step="any" value={selectedNode.data.latitude || ''} onChange={(e) => updateNodeData(selectedNode.id, { latitude: parseFloat(e.target.value) || 0 })} className="h-9 font-mono text-sm" />
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">Longitude</Label>
                <Input type="number" step="any" value={selectedNode.data.longitude || ''} onChange={(e) => updateNodeData(selectedNode.id, { longitude: parseFloat(e.target.value) || 0 })} className="h-9 font-mono text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* HTTP Request */}
        {nodeType === 'httpRequest' && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="w-28 space-y-2">
                <Label className="text-xs text-muted-foreground">Método</Label>
                <Select value={selectedNode.data.httpMethod || 'GET'} onValueChange={(v) => updateNodeData(selectedNode.id, { httpMethod: v as any })}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GET">GET</SelectItem><SelectItem value="POST">POST</SelectItem>
                    <SelectItem value="PUT">PUT</SelectItem><SelectItem value="DELETE">DELETE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">URL</Label>
                <Input value={selectedNode.data.httpUrl || ''} onChange={(e) => updateNodeData(selectedNode.id, { httpUrl: e.target.value })} className="h-9 font-mono text-sm" placeholder="https://api.exemplo.com" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Headers (JSON)</Label>
              <Textarea value={selectedNode.data.httpHeaders || ''} onChange={(e) => updateNodeData(selectedNode.id, { httpHeaders: e.target.value })} className="min-h-[60px] resize-none font-mono text-sm" placeholder='{"Authorization": "Bearer token"}' />
            </div>
            {(selectedNode.data.httpMethod === 'POST' || selectedNode.data.httpMethod === 'PUT') && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Body (JSON)</Label>
                <Textarea value={selectedNode.data.httpBody || ''} onChange={(e) => updateNodeData(selectedNode.id, { httpBody: e.target.value })} className="min-h-[60px] resize-none font-mono text-sm" placeholder='{"key": "value"}' />
              </div>
            )}
          </div>
        )}

        {/* Video */}
        {nodeType === 'video' && (
          <div className="space-y-3">
            <FileUploadField label="Vídeo" value={selectedNode.data.videoUrl || ''} onChange={(url) => updateNodeData(selectedNode.id, { videoUrl: url })} accept="video/*" placeholder="https://exemplo.com/video.mp4" />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Legenda (opcional)</Label>
              <Textarea value={selectedNode.data.caption || ''} onChange={(e) => updateNodeData(selectedNode.id, { caption: e.target.value })} className="min-h-[60px] resize-none" placeholder="Legenda do vídeo..." />
            </div>
          </div>
        )}

        {/* Audio */}
        {nodeType === 'audio' && (
          <div className="space-y-3">
            <FileUploadField label="Áudio" value={selectedNode.data.audioUrl || ''} onChange={(url) => updateNodeData(selectedNode.id, { audioUrl: url })} accept="audio/*" placeholder="https://exemplo.com/audio.mp3" />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Legenda (opcional)</Label>
              <Textarea value={selectedNode.data.caption || ''} onChange={(e) => updateNodeData(selectedNode.id, { caption: e.target.value })} className="min-h-[60px] resize-none" placeholder="Título do áudio..." />
            </div>
          </div>
        )}

        {/* Document */}
        {nodeType === 'document' && (
          <div className="space-y-3">
            <FileUploadField label="Documento" value={selectedNode.data.documentUrl || ''} onChange={(url) => updateNodeData(selectedNode.id, { documentUrl: url })} accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" placeholder="https://exemplo.com/doc.pdf" />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Nome do arquivo</Label>
              <Input value={selectedNode.data.documentFilename || ''} onChange={(e) => updateNodeData(selectedNode.id, { documentFilename: e.target.value })} className="h-9" placeholder="relatorio.pdf" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Legenda (opcional)</Label>
              <Textarea value={selectedNode.data.caption || ''} onChange={(e) => updateNodeData(selectedNode.id, { caption: e.target.value })} className="min-h-[60px] resize-none" placeholder="Legenda..." />
            </div>
          </div>
        )}

        {/* Animation/GIF */}
        {nodeType === 'animation' && (
          <div className="space-y-3">
            <FileUploadField label="GIF/Animação" value={selectedNode.data.animationUrl || ''} onChange={(url) => updateNodeData(selectedNode.id, { animationUrl: url })} accept="image/gif,.gif" placeholder="https://exemplo.com/anim.gif" />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Legenda (opcional)</Label>
              <Textarea value={selectedNode.data.caption || ''} onChange={(e) => updateNodeData(selectedNode.id, { caption: e.target.value })} className="min-h-[60px] resize-none" placeholder="Legenda..." />
            </div>
          </div>
        )}

        {/* Sticker */}
        {nodeType === 'sticker' && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">File ID do Sticker</Label>
            <Input value={selectedNode.data.stickerFileId || ''} onChange={(e) => updateNodeData(selectedNode.id, { stickerFileId: e.target.value })} className="h-9 font-mono text-sm" placeholder="CAACAgIAAxkB..." />
            <p className="text-[10px] text-muted-foreground">Obtenha o file_id encaminhando um sticker para @getidsbot</p>
          </div>
        )}

        {/* Poll */}
        {nodeType === 'poll' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Pergunta</Label>
              <Input value={selectedNode.data.pollQuestion || ''} onChange={(e) => updateNodeData(selectedNode.id, { pollQuestion: e.target.value })} className="h-9" placeholder="Qual é sua cor favorita?" />
            </div>
            <Label className="text-xs text-muted-foreground">Opções</Label>
            {(selectedNode.data.pollOptions || []).map((opt, i) => (
              <div key={i} className="flex gap-2">
                <Input value={opt} onChange={(e) => { const no = [...(selectedNode.data.pollOptions || [])]; no[i] = e.target.value; updateNodeData(selectedNode.id, { pollOptions: no }); }} className="h-9" placeholder={`Opção ${i + 1}`} />
                <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-destructive/70" onClick={() => updateNodeData(selectedNode.id, { pollOptions: (selectedNode.data.pollOptions || []).filter((_, idx) => idx !== i) })}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => updateNodeData(selectedNode.id, { pollOptions: [...(selectedNode.data.pollOptions || []), ''] })}>Adicionar opção</Button>
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Anônima</Label>
              <Switch checked={selectedNode.data.pollIsAnonymous !== false} onCheckedChange={(v) => updateNodeData(selectedNode.id, { pollIsAnonymous: v })} />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Tipo</Label>
              <Select value={selectedNode.data.pollType || 'regular'} onValueChange={(v) => updateNodeData(selectedNode.id, { pollType: v as any })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Enquete</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedNode.data.pollType === 'quiz' && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Índice da resposta correta (0-based)</Label>
                <Input type="number" value={selectedNode.data.pollCorrectOption ?? 0} onChange={(e) => updateNodeData(selectedNode.id, { pollCorrectOption: parseInt(e.target.value) || 0 })} className="h-9" min={0} />
              </div>
            )}
          </div>
        )}

        {/* Contact */}
        {nodeType === 'contact' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Telefone</Label>
              <Input value={selectedNode.data.contactPhone || ''} onChange={(e) => updateNodeData(selectedNode.id, { contactPhone: e.target.value })} className="h-9" placeholder="+5511999999999" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Nome</Label>
              <Input value={selectedNode.data.contactFirstName || ''} onChange={(e) => updateNodeData(selectedNode.id, { contactFirstName: e.target.value })} className="h-9" placeholder="João" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Sobrenome</Label>
              <Input value={selectedNode.data.contactLastName || ''} onChange={(e) => updateNodeData(selectedNode.id, { contactLastName: e.target.value })} className="h-9" placeholder="Silva" />
            </div>
          </div>
        )}

        {/* Venue */}
        {nodeType === 'venue' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Nome do local</Label>
              <Input value={selectedNode.data.locationTitle || ''} onChange={(e) => updateNodeData(selectedNode.id, { locationTitle: e.target.value })} className="h-9" placeholder="Restaurante XYZ" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Endereço</Label>
              <Input value={selectedNode.data.venueAddress || ''} onChange={(e) => updateNodeData(selectedNode.id, { venueAddress: e.target.value })} className="h-9" placeholder="Rua das Flores, 123" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">Latitude</Label>
                <Input type="number" step="any" value={selectedNode.data.latitude || ''} onChange={(e) => updateNodeData(selectedNode.id, { latitude: parseFloat(e.target.value) || 0 })} className="h-9 font-mono text-sm" />
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">Longitude</Label>
                <Input type="number" step="any" value={selectedNode.data.longitude || ''} onChange={(e) => updateNodeData(selectedNode.id, { longitude: parseFloat(e.target.value) || 0 })} className="h-9 font-mono text-sm" />
              </div>
            </div>
          </div>
        )}

        {/* Dice */}
        {nodeType === 'dice' && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tipo de emoji</Label>
            <Select value={selectedNode.data.diceEmoji || '🎲'} onValueChange={(v) => updateNodeData(selectedNode.id, { diceEmoji: v as any })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="🎲">🎲 Dado</SelectItem>
                <SelectItem value="🎯">🎯 Dardo</SelectItem>
                <SelectItem value="🏀">🏀 Basquete</SelectItem>
                <SelectItem value="⚽">⚽ Futebol</SelectItem>
                <SelectItem value="🎳">🎳 Boliche</SelectItem>
                <SelectItem value="🎰">🎰 Caça-níquel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Invoice */}
        {nodeType === 'invoice' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Título</Label>
              <Input value={selectedNode.data.invoiceTitle || ''} onChange={(e) => updateNodeData(selectedNode.id, { invoiceTitle: e.target.value })} className="h-9" placeholder="Produto Premium" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Descrição</Label>
              <Textarea value={selectedNode.data.invoiceDescription || ''} onChange={(e) => updateNodeData(selectedNode.id, { invoiceDescription: e.target.value })} className="min-h-[60px] resize-none" placeholder="Descrição do produto..." />
            </div>
            <div className="flex gap-2">
              <div className="w-24 space-y-2">
                <Label className="text-xs text-muted-foreground">Moeda</Label>
                <Input value={selectedNode.data.invoiceCurrency || 'BRL'} onChange={(e) => updateNodeData(selectedNode.id, { invoiceCurrency: e.target.value })} className="h-9" />
              </div>
              <div className="flex-1 space-y-2">
                <Label className="text-xs text-muted-foreground">Preço (centavos)</Label>
                <Input type="number" value={selectedNode.data.invoicePrice || 0} onChange={(e) => updateNodeData(selectedNode.id, { invoicePrice: parseInt(e.target.value) || 0 })} className="h-9" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Provider Token</Label>
              <Input value={selectedNode.data.invoiceProviderToken || ''} onChange={(e) => updateNodeData(selectedNode.id, { invoiceProviderToken: e.target.value })} className="h-9 font-mono text-sm" placeholder="Token do provedor de pagamento" />
            </div>
          </div>
        )}

        {/* Edit Message */}
        {nodeType === 'editMessage' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Message ID (variável)</Label>
              <Input value={selectedNode.data.editMessageId || ''} onChange={(e) => updateNodeData(selectedNode.id, { editMessageId: e.target.value })} className="h-9 font-mono text-sm" placeholder="{{last_message_id}}" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Novo texto</Label>
              <Textarea value={selectedNode.data.editText || ''} onChange={(e) => updateNodeData(selectedNode.id, { editText: e.target.value })} className="min-h-[80px] resize-none" placeholder="Novo conteúdo da mensagem..." />
            </div>
          </div>
        )}

        {/* Delete Message */}
        {nodeType === 'deleteMessage' && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Message ID (variável)</Label>
            <Input value={selectedNode.data.deleteMessageId || ''} onChange={(e) => updateNodeData(selectedNode.id, { deleteMessageId: e.target.value })} className="h-9 font-mono text-sm" placeholder="{{last_message_id}}" />
            <p className="text-[10px] text-muted-foreground">Use variáveis como {'{{last_message_id}}'} para referenciar mensagens enviadas anteriormente.</p>
          </div>
        )}

        {/* Media Group */}
        {nodeType === 'mediaGroup' && (
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">Mídias do grupo</Label>
            {(selectedNode.data.mediaGroupItems || []).map((item, i) => (
              <div key={i} className="space-y-2 rounded-lg border border-border p-2">
                <div className="flex gap-2">
                  <Select value={item.type} onValueChange={(v) => { const ni = [...(selectedNode.data.mediaGroupItems || [])]; ni[i] = { ...ni[i], type: v as any }; updateNodeData(selectedNode.id, { mediaGroupItems: ni }); }}>
                    <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="photo">Foto</SelectItem>
                      <SelectItem value="video">Vídeo</SelectItem>
                      <SelectItem value="document">Doc</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0 text-destructive/70" onClick={() => updateNodeData(selectedNode.id, { mediaGroupItems: (selectedNode.data.mediaGroupItems || []).filter((_, idx) => idx !== i) })}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <Input value={item.url} onChange={(e) => { const ni = [...(selectedNode.data.mediaGroupItems || [])]; ni[i] = { ...ni[i], url: e.target.value }; updateNodeData(selectedNode.id, { mediaGroupItems: ni }); }} className="h-8 text-xs font-mono" placeholder="URL da mídia" />
                <Input value={item.caption || ''} onChange={(e) => { const ni = [...(selectedNode.data.mediaGroupItems || [])]; ni[i] = { ...ni[i], caption: e.target.value }; updateNodeData(selectedNode.id, { mediaGroupItems: ni }); }} className="h-8 text-xs" placeholder="Legenda (opcional)" />
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full" onClick={() => updateNodeData(selectedNode.id, { mediaGroupItems: [...(selectedNode.data.mediaGroupItems || []), { type: 'photo', url: '', caption: '' }] })}>Adicionar mídia</Button>
          </div>
        )}

        {/* ChatGPT */}
        {nodeType === 'chatgpt' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">API URL</Label>
              <Input value={String(selectedNode.data.aiApiUrl || 'https://api.openai.com/v1/chat/completions')} onChange={(e) => updateNodeData(selectedNode.id, { aiApiUrl: e.target.value })} className="h-9 font-mono text-sm" placeholder="https://api.openai.com/v1/chat/completions" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">API Key</Label>
              <Input type="password" value={String(selectedNode.data.aiApiKey || '')} onChange={(e) => updateNodeData(selectedNode.id, { aiApiKey: e.target.value })} className="h-9 font-mono text-sm" placeholder="sk-..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Modelo</Label>
              <Select value={String(selectedNode.data.aiModel || 'gpt-4')} onValueChange={(v) => updateNodeData(selectedNode.id, { aiModel: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Prompt</Label>
              <Textarea value={String(selectedNode.data.aiPrompt || '')} onChange={(e) => updateNodeData(selectedNode.id, { aiPrompt: e.target.value })} className="min-h-[80px] resize-none" placeholder="Responda como assistente de vendas..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Salvar resposta na variável</Label>
              <Input value={String(selectedNode.data.aiSaveVariable || '')} onChange={(e) => updateNodeData(selectedNode.id, { aiSaveVariable: e.target.value })} className="h-9 font-mono" placeholder="ai_response" />
            </div>
          </div>
        )}

        {/* Groq */}
        {nodeType === 'groq' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">API URL</Label>
              <Input value={String(selectedNode.data.aiApiUrl || 'https://api.groq.com/openai/v1/chat/completions')} onChange={(e) => updateNodeData(selectedNode.id, { aiApiUrl: e.target.value })} className="h-9 font-mono text-sm" placeholder="https://api.groq.com/openai/v1/chat/completions" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">API Key</Label>
              <Input type="password" value={String(selectedNode.data.aiApiKey || '')} onChange={(e) => updateNodeData(selectedNode.id, { aiApiKey: e.target.value })} className="h-9 font-mono text-sm" placeholder="gsk_..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Modelo</Label>
              <Select value={String(selectedNode.data.aiModel || 'llama3-70b-8192')} onValueChange={(v) => updateNodeData(selectedNode.id, { aiModel: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="llama3-70b-8192">Llama 3 70B</SelectItem>
                  <SelectItem value="llama3-8b-8192">Llama 3 8B</SelectItem>
                  <SelectItem value="mixtral-8x7b-32768">Mixtral 8x7B</SelectItem>
                  <SelectItem value="gemma-7b-it">Gemma 7B</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Prompt</Label>
              <Textarea value={String(selectedNode.data.aiPrompt || '')} onChange={(e) => updateNodeData(selectedNode.id, { aiPrompt: e.target.value })} className="min-h-[80px] resize-none" placeholder="Responda como assistente..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Salvar resposta na variável</Label>
              <Input value={String(selectedNode.data.aiSaveVariable || '')} onChange={(e) => updateNodeData(selectedNode.id, { aiSaveVariable: e.target.value })} className="h-9 font-mono" placeholder="ai_response" />
            </div>
          </div>
        )}

        {/* Gemini */}
        {nodeType === 'gemini' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">API URL</Label>
              <Input value={String(selectedNode.data.aiApiUrl || 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent')} onChange={(e) => updateNodeData(selectedNode.id, { aiApiUrl: e.target.value })} className="h-9 font-mono text-sm" placeholder="URL da API Gemini" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">API Key</Label>
              <Input type="password" value={String(selectedNode.data.aiApiKey || '')} onChange={(e) => updateNodeData(selectedNode.id, { aiApiKey: e.target.value })} className="h-9 font-mono text-sm" placeholder="AIza..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Modelo</Label>
              <Select value={String(selectedNode.data.aiModel || 'gemini-pro')} onValueChange={(v) => updateNodeData(selectedNode.id, { aiModel: v })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                  <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Prompt</Label>
              <Textarea value={String(selectedNode.data.aiPrompt || '')} onChange={(e) => updateNodeData(selectedNode.id, { aiPrompt: e.target.value })} className="min-h-[80px] resize-none" placeholder="Responda como assistente..." />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Salvar resposta na variável</Label>
              <Input value={String(selectedNode.data.aiSaveVariable || '')} onChange={(e) => updateNodeData(selectedNode.id, { aiSaveVariable: e.target.value })} className="h-9 font-mono" placeholder="ai_response" />
            </div>
          </div>
        )}

        {/* Schedule */}
        {nodeType === 'schedule' && (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Intervalo</Label>
              <div className="flex gap-2">
                <Input type="number" value={selectedNode.data.scheduleInterval || 1} onChange={(e) => updateNodeData(selectedNode.id, { scheduleInterval: parseInt(e.target.value) || 1 })} className="h-9" min={1} />
                <Select value={selectedNode.data.scheduleIntervalUnit || 'hours'} onValueChange={(v) => updateNodeData(selectedNode.id, { scheduleIntervalUnit: v as any })}>
                  <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minutes">Minutos</SelectItem>
                    <SelectItem value="hours">Horas</SelectItem>
                    <SelectItem value="days">Dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Horário de disparo</Label>
              <Input type="time" value={selectedNode.data.scheduleTime || '08:00'} onChange={(e) => updateNodeData(selectedNode.id, { scheduleTime: e.target.value })} className="h-9" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Dias da semana (deixe vazio para todos)</Label>
              <div className="flex flex-wrap gap-1.5">
                {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((day) => {
                  const selected = (selectedNode.data.scheduleDays || []).includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${selected ? 'border-amber-500 bg-amber-500/20 text-amber-400' : 'border-border bg-muted/10 text-muted-foreground hover:bg-muted/20'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        const days = selectedNode.data.scheduleDays || [];
                        updateNodeData(selectedNode.id, { scheduleDays: selected ? days.filter(d => d !== day) : [...days, day] });
                      }}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground">Este bloco dispara automaticamente no horário configurado e executa todos os blocos conectados abaixo dele, sem necessidade de interação do usuário.</p>
          </div>
        )}

      </div>
    </div>
  );
}
