import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { PLANS } from '@/lib/plans';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarFooter,
  SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu,
  SidebarMenuItem, SidebarMenuButton, SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  Bot, Plus, Pencil, Trash2, LogOut, Loader2, Crown, BarChart3, Check,
  MessageCircle, Hash, AlertCircle, ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import type { Platform } from '@/types/flow';

interface BotRecord {
  id: string;
  name: string;
  telegram_token: string | null;
  is_active: boolean;
  created_at: string;
  platform: Platform;
  is_group_bot: boolean;
  group_chat_id: string | null;
  whatsapp_phone_number_id: string | null;
  whatsapp_access_token: string | null;
  whatsapp_business_account_id: string | null;
  discord_bot_token: string | null;
  discord_application_id: string | null;
  discord_guild_id: string | null;
}

const TelegramIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="12" fill="#26A5E4"/>
    <path d="M5.5 11.5l10-4.5c.6-.25 1.1.1.9.8l-1.7 8c-.1.5-.5.7-.9.4l-2.5-1.9-1.2 1.1c-.1.1-.3.2-.5.2l.2-2.7 4.7-4.3c.2-.2 0-.3-.3-.1l-5.8 3.7-2.4-.8c-.5-.15-.5-.5.5-.85z" fill="white"/>
  </svg>
);

const WhatsAppIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="12" fill="#25D366"/>
    <path d="M17.5 14.4c-.3-.15-1.7-.85-2-1-.3-.1-.5-.15-.7.15-.2.3-.8 1-.95 1.2-.18.2-.35.22-.65.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.52-.08-.15-.7-1.7-.96-2.32-.25-.6-.5-.52-.7-.53-.18 0-.38-.02-.58-.02s-.52.08-.8.38c-.28.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.12 3.22 5.12 4.52.72.3 1.28.5 1.72.63.72.22 1.38.2 1.9.12.58-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35z" fill="white"/>
  </svg>
);

const DiscordIcon = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none">
    <circle cx="12" cy="12" r="12" fill="#5865F2"/>
    <path d="M17.27 7.4A14.9 14.9 0 0 0 14 6.5c-.14.25-.3.6-.4.86a13.8 13.8 0 0 0-3.2 0A9.3 9.3 0 0 0 10 6.5a14.9 14.9 0 0 0-3.28.9C5.02 10.03 4.6 12.6 4.8 15.13a14.9 14.9 0 0 0 4.55 2.3c.37-.5.7-1.03.98-1.6-.54-.2-1.05-.45-1.53-.74.13-.09.25-.19.37-.28a10.6 10.6 0 0 0 9.05 0c.12.1.24.2.37.28-.48.3-1 .54-1.53.74.28.57.61 1.1.98 1.6a14.8 14.8 0 0 0 4.54-2.3c.22-2.9-.37-5.44-1.8-7.73zM9.52 13.57c-.69 0-1.26-.63-1.26-1.4s.55-1.4 1.26-1.4c.7 0 1.27.63 1.26 1.4 0 .77-.56 1.4-1.26 1.4zm4.66 0c-.7 0-1.26-.63-1.26-1.4s.55-1.4 1.26-1.4c.7 0 1.27.63 1.26 1.4 0 .77-.56 1.4-1.26 1.4z" fill="white"/>
  </svg>
);

const platformMeta: Record<Platform, { label: string; icon: React.ReactNode; color: string }> = {
  telegram: { label: 'Telegram', icon: <TelegramIcon />, color: 'text-[#26A5E4]' },
  whatsapp: { label: 'WhatsApp', icon: <WhatsAppIcon />, color: 'text-[#25D366]' },
  discord: { label: 'Discord', icon: <DiscordIcon />, color: 'text-[#5865F2]' },
};

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { plan, subscribed, loading: subLoading, refresh: refreshSub } = useSubscription();
  const navigate = useNavigate();
  const [bots, setBots] = useState<BotRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotToken, setNewBotToken] = useState('');
  const [newBotPlatform, setNewBotPlatform] = useState<Platform>('telegram');
  const [creating, setCreating] = useState(false);
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);
  const [platformFilter, setPlatformFilter] = useState<Platform | 'all'>('all');

  // Telegram group bot fields
  const [isGroupBot, setIsGroupBot] = useState(false);
  const [groupChatId, setGroupChatId] = useState('');

  // WhatsApp fields
  const [waPhoneNumberId, setWaPhoneNumberId] = useState('');
  const [waAccessToken, setWaAccessToken] = useState('');
  const [waBusinessAccountId, setWaBusinessAccountId] = useState('');

  // Discord fields
  const [discordBotToken, setDiscordBotToken] = useState('');
  const [discordAppId, setDiscordAppId] = useState('');
  const [discordGuildId, setDiscordGuildId] = useState('');

  const planLimits = PLANS[plan];
  const canCreateBot = bots.length < planLimits.maxBots;
  const filteredBots = platformFilter === 'all' ? bots : bots.filter(b => b.platform === platformFilter);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) { fetchBots(); fetchProfile(); }
  }, [user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      toast.success('Assinatura ativada com sucesso!');
      refreshSub();
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('display_name').eq('user_id', user!.id).maybeSingle();
    setProfile(data);
  };

  const fetchBots = async () => {
    const { data, error } = await supabase.from('bots').select('*').order('created_at', { ascending: false });
    if (!error && data) setBots(data as BotRecord[]);
    setLoading(false);
  };

  const resetForm = () => {
    setNewBotName(''); setNewBotToken(''); setNewBotPlatform('telegram');
    setIsGroupBot(false); setGroupChatId('');
    setWaPhoneNumberId(''); setWaAccessToken(''); setWaBusinessAccountId('');
    setDiscordBotToken(''); setDiscordAppId(''); setDiscordGuildId('');
  };

  const createBot = async () => {
    if (!newBotName.trim()) return;
    if (!canCreateBot) {
      toast.error(`Seu plano ${planLimits.name} permite no máximo ${planLimits.maxBots} bot(s). Faça upgrade!`);
      return;
    }
    setCreating(true);

    const insertData: any = {
      name: newBotName.trim(),
      user_id: user!.id,
      platform: newBotPlatform,
      is_group_bot: false,
    };

    if (newBotPlatform === 'telegram') {
      insertData.telegram_token = newBotToken.trim() || null;
      insertData.is_group_bot = isGroupBot;
      insertData.group_chat_id = isGroupBot ? (groupChatId.trim() || null) : null;
    } else if (newBotPlatform === 'whatsapp') {
      insertData.whatsapp_phone_number_id = waPhoneNumberId.trim() || null;
      insertData.whatsapp_access_token = waAccessToken.trim() || null;
      insertData.whatsapp_business_account_id = waBusinessAccountId.trim() || null;
    } else if (newBotPlatform === 'discord') {
      insertData.discord_bot_token = discordBotToken.trim() || null;
      insertData.discord_application_id = discordAppId.trim() || null;
      insertData.discord_guild_id = discordGuildId.trim() || null;
    }

    const { error } = await supabase.from('bots').insert(insertData);
    if (error) toast.error('Erro ao criar bot');
    else { toast.success('Bot criado!'); setDialogOpen(false); resetForm(); fetchBots(); }
    setCreating(false);
  };

  const deleteBot = async (id: string) => {
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (!error) { toast.success('Bot removido'); fetchBots(); }
  };

  const handleUpgrade = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', { body: { priceId } });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch { toast.error('Erro ao iniciar checkout'); }
  };

  const maskToken = (token: string | null) => {
    if (!token) return '—';
    return '••••••' + token.slice(-6);
  };

  const handleReportBug = () => {
    const msg = encodeURIComponent('Olá! Encontrei um bug no FlowBot e gostaria de reportar.');
    window.open(`https://wa.me/5597984306291?text=${msg}`, '_blank');
  };

  if (authLoading || !user || subLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar */}
        <Sidebar collapsible="icon" className="border-r border-border">
          <SidebarHeader className="border-b border-border px-4 py-3">
            <a href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
              <Bot className="h-6 w-6 text-primary shrink-0" />
              <span className="group-data-[collapsible=icon]:hidden">FlowBot</span>
            </a>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={platformFilter === 'all'}
                      onClick={() => setPlatformFilter('all')}
                      tooltip="Meus Bots"
                    >
                      <Bot className="h-4 w-4" />
                      <span>Meus Bots</span>
                      <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>Plataformas</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {(['telegram', 'whatsapp', 'discord'] as Platform[]).map((p) => (
                    <SidebarMenuItem key={p}>
                      <SidebarMenuButton
                        isActive={platformFilter === p}
                        onClick={() => setPlatformFilter(p)}
                        tooltip={platformMeta[p].label}
                      >
                        {platformMeta[p].icon}
                        <span>{platformMeta[p].label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip={planLimits.name}>
                  <Crown className="h-4 w-4 text-primary" />
                  <span className="text-primary font-medium">{planLimits.name}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleReportBug} tooltip="Reportar Bug">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span>Reportar Bug</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => { signOut(); navigate('/'); }} tooltip="Sair">
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                {profile?.display_name || user.email}
              </span>
            </div>
          </header>

          <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto w-full">
            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2">
              {[
                { label: 'Total de Bots', value: `${bots.length} / ${planLimits.maxBots}` },
                { label: 'Plano Atual', value: planLimits.name },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-card p-5">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="mt-1 text-2xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Upgrade Banner */}
            {plan === 'starter' && (
              <div className="mb-8 rounded-xl border border-primary/30 bg-primary/5 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-primary">🚀 Faça upgrade para desbloquear mais recursos!</p>
                  <p className="text-sm text-muted-foreground">Mais bots, todos os blocos e suporte multiplataforma.</p>
                </div>
                <Button onClick={() => setUpgradeDialogOpen(true)} className="bg-primary text-primary-foreground whitespace-nowrap">
                  Ver Planos
                </Button>
              </div>
            )}

            {/* Platform Filter + Bot List Header */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <h2 className="text-xl font-bold">Meus Bots</h2>
                <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-secondary/50 p-0.5">
                  <button
                    onClick={() => setPlatformFilter('all')}
                    className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${platformFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    Todos
                  </button>
                  {(['telegram', 'whatsapp', 'discord'] as Platform[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlatformFilter(p)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${platformFilter === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                      {platformMeta[p].icon}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => {
                  if (!canCreateBot) { toast.error(`Limite de ${planLimits.maxBots} bot(s) atingido. Faça upgrade!`); return; }
                  setDialogOpen(true);
                }}
                className="gap-2 bg-primary text-primary-foreground w-full sm:w-auto"
              >
                <Plus className="h-4 w-4" /> Novo Bot
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : filteredBots.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
                <Bot className="mx-auto mb-3 h-10 w-10 opacity-30" />
                <p>{bots.length === 0 ? 'Nenhum bot criado ainda.' : 'Nenhum bot nesta plataforma.'}</p>
                <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>Criar primeiro bot</Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBots.map((bot) => {
                  const meta = platformMeta[bot.platform] || platformMeta.telegram;
                  return (
                    <div key={bot.id} className="rounded-xl border border-border bg-card p-5">
                      <div className="mb-3 flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          {meta.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{bot.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-medium uppercase ${bot.is_active ? 'text-green-500' : 'text-muted-foreground'}`}>
                              {bot.is_active ? 'ATIVO' : 'INATIVO'}
                            </span>
                            <span className={`rounded-full border border-border px-2 py-0.5 text-[10px] font-medium ${meta.color}`}>
                              {meta.label}
                            </span>
                            {bot.is_group_bot && (
                              <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Grupo</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {bot.platform === 'telegram' && (
                        <p className="mb-4 text-xs text-muted-foreground">Token: {maskToken(bot.telegram_token)}</p>
                      )}
                      {bot.platform === 'whatsapp' && (
                        <p className="mb-4 text-xs text-muted-foreground">Phone ID: {maskToken(bot.whatsapp_phone_number_id)}</p>
                      )}
                      {bot.platform === 'discord' && (
                        <p className="mb-4 text-xs text-muted-foreground">App ID: {maskToken(bot.discord_application_id)}</p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="flex-1 min-w-[100px] gap-1.5 border-border text-xs" onClick={() => navigate(`/editor/${bot.platform}/${bot.id}`)}>
                          <Pencil className="h-3.5 w-3.5" /> Editar
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5 border-border text-xs" onClick={() => navigate(`/analytics/${bot.id}`)}>
                          <BarChart3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => deleteBot(bot.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Create Bot Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="border-border bg-card sm:max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Bot</DialogTitle>
            <DialogDescription>
              {canCreateBot
                ? `Escolha a plataforma e configure o bot. (${bots.length}/${planLimits.maxBots} bots)`
                : `Limite atingido! Faça upgrade para criar mais bots.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Plataforma</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['telegram', 'whatsapp', 'discord'] as Platform[]).map((p) => {
                  const meta = platformMeta[p];
                  return (
                    <button
                      key={p}
                      onClick={() => setNewBotPlatform(p)}
                      className={`flex flex-col items-center gap-1.5 rounded-lg border p-3 transition-all ${
                        newBotPlatform === p
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-secondary/30 text-muted-foreground hover:border-primary/40'
                      }`}
                    >
                      {meta.icon}
                      <span className="text-xs font-medium">{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Nome do Bot</Label>
              <Input placeholder="Meu Bot de Vendas" value={newBotName} onChange={(e) => setNewBotName(e.target.value)} className="border-border bg-secondary" />
            </div>

            {/* Telegram fields */}
            {newBotPlatform === 'telegram' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Token do Bot</Label>
                  <Input placeholder="123456789:ABCdef..." value={newBotToken} onChange={(e) => setNewBotToken(e.target.value)} className="border-border bg-secondary font-mono text-xs" />
                  <p className="text-[10px] text-muted-foreground">Obtenha no @BotFather do Telegram.</p>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 p-3">
                  <div>
                    <Label className="text-xs font-medium">Bot em Grupo?</Label>
                    <p className="text-[10px] text-muted-foreground">Ative se o bot vai operar dentro de um grupo.</p>
                  </div>
                  <Switch checked={isGroupBot} onCheckedChange={setIsGroupBot} />
                </div>
                {isGroupBot && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">ID do Grupo (Chat ID)</Label>
                    <Input placeholder="-1001234567890" value={groupChatId} onChange={(e) => setGroupChatId(e.target.value)} className="border-border bg-secondary font-mono text-xs" />
                    <p className="text-[10px] text-muted-foreground">
                      Adicione o bot ao grupo, envie uma mensagem, e acesse:<br />
                      <code className="text-[9px] bg-muted px-1 py-0.5 rounded">https://api.telegram.org/bot{'<TOKEN>'}/getUpdates</code><br />
                      O chat.id negativo é o ID do grupo.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* WhatsApp fields */}
            {newBotPlatform === 'whatsapp' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Phone Number ID</Label>
                  <Input placeholder="1234567890" value={waPhoneNumberId} onChange={(e) => setWaPhoneNumberId(e.target.value)} className="border-border bg-secondary font-mono text-xs" />
                  <p className="text-[10px] text-muted-foreground">Meta Business → WhatsApp → API Setup → Phone Number ID</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Access Token (Permanente)</Label>
                  <Input placeholder="EAAx..." value={waAccessToken} onChange={(e) => setWaAccessToken(e.target.value)} className="border-border bg-secondary font-mono text-xs" type="password" />
                  <p className="text-[10px] text-muted-foreground">Token de acesso permanente do sistema da Meta Business.</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">WhatsApp Business Account ID</Label>
                  <Input placeholder="1234567890" value={waBusinessAccountId} onChange={(e) => setWaBusinessAccountId(e.target.value)} className="border-border bg-secondary font-mono text-xs" />
                  <p className="text-[10px] text-muted-foreground">Meta Business → WhatsApp → API Setup → WABA ID</p>
                </div>
              </>
            )}

            {/* Discord fields */}
            {newBotPlatform === 'discord' && (
              <>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Bot Token</Label>
                  <Input placeholder="MTIx..." value={discordBotToken} onChange={(e) => setDiscordBotToken(e.target.value)} className="border-border bg-secondary font-mono text-xs" type="password" />
                  <p className="text-[10px] text-muted-foreground">Discord Developer Portal → Bot → Token</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Application ID (Client ID)</Label>
                  <Input placeholder="123456789012345678" value={discordAppId} onChange={(e) => setDiscordAppId(e.target.value)} className="border-border bg-secondary font-mono text-xs" />
                  <p className="text-[10px] text-muted-foreground">Discord Developer Portal → General Information → Application ID</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Guild ID (Server ID)</Label>
                  <Input placeholder="123456789012345678" value={discordGuildId} onChange={(e) => setDiscordGuildId(e.target.value)} className="border-border bg-secondary font-mono text-xs" />
                  <p className="text-[10px] text-muted-foreground">Ative o Modo Desenvolvedor → Clique direito no servidor → Copiar ID</p>
                </div>
              </>
            )}

            <Button onClick={createBot} disabled={creating || !newBotName.trim() || !canCreateBot} className="w-full bg-primary text-primary-foreground">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Bot'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Escolha seu Plano</DialogTitle>
            <DialogDescription>Faça upgrade para desbloquear mais recursos</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2 py-4">
            {(['pro', 'enterprise'] as const).map((key) => {
              const p = PLANS[key];
              return (
                <div key={key} className={`rounded-xl border p-5 ${key === 'pro' ? 'border-primary bg-primary/5' : 'border-border'}`}>
                  {key === 'pro' && <p className="text-xs font-bold text-primary mb-2">🔥 Mais Popular</p>}
                  <h3 className="font-bold text-lg">{p.name}</h3>
                  <p className="text-2xl font-bold mt-1">{p.price}</p>
                  <ul className="mt-4 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="h-3.5 w-3.5 text-primary shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full mt-4 ${key === 'pro' ? 'bg-primary text-primary-foreground' : ''}`}
                    variant={key === 'pro' ? 'default' : 'outline'}
                    onClick={() => { handleUpgrade(p.priceId!); setUpgradeDialogOpen(false); }}
                  >
                    Assinar {p.name}
                  </Button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
