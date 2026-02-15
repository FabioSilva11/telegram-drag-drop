import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { PLANS } from '@/lib/plans';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bot, Plus, Pencil, Trash2, LogOut, Loader2, Crown, BarChart3, Check, MessageCircle, Hash } from 'lucide-react';
import { toast } from 'sonner';
import type { Platform } from '@/types/flow';

interface BotRecord {
  id: string;
  name: string;
  telegram_token: string | null;
  is_active: boolean;
  created_at: string;
  platform: Platform;
}

const platformMeta: Record<Platform, { label: string; icon: React.ReactNode; color: string }> = {
  telegram: { label: 'Telegram', icon: <Bot className="h-4 w-4" />, color: 'text-primary' },
  whatsapp: { label: 'WhatsApp', icon: <MessageCircle className="h-4 w-4" />, color: 'text-node-start' },
  discord: { label: 'Discord', icon: <Hash className="h-4 w-4" />, color: 'text-node-button' },
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

  const createBot = async () => {
    if (!newBotName.trim()) return;
    if (!canCreateBot) {
      toast.error(`Seu plano ${planLimits.name} permite no máximo ${planLimits.maxBots} bot(s). Faça upgrade!`);
      return;
    }
    setCreating(true);
    const { error } = await supabase.from('bots').insert({
      name: newBotName.trim(),
      telegram_token: newBotPlatform === 'telegram' ? (newBotToken.trim() || null) : null,
      user_id: user!.id,
      platform: newBotPlatform,
    } as any);
    if (error) toast.error('Erro ao criar bot');
    else { toast.success('Bot criado!'); setDialogOpen(false); setNewBotName(''); setNewBotToken(''); setNewBotPlatform('telegram'); fetchBots(); }
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-bold">FlowBot</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Crown className="h-4 w-4 text-primary" />
              <span className="text-xs font-medium text-primary">{planLimits.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">{profile?.display_name || user.email}</span>
            <Button variant="ghost" size="icon" onClick={() => { signOut(); navigate('/'); }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: 'Total de Bots', value: `${bots.length} / ${planLimits.maxBots}` },
            { label: 'Plano Atual', value: planLimits.name },
            { label: 'Msgs/Dia', value: planLimits.maxMessagesPerDay === Infinity ? 'Ilimitadas' : planLimits.maxMessagesPerDay },
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
              <p className="text-sm text-muted-foreground">Mais bots, mensagens ilimitadas e blocos avançados.</p>
            </div>
            <Button onClick={() => setUpgradeDialogOpen(true)} className="bg-primary text-primary-foreground whitespace-nowrap">
              Ver Planos
            </Button>
          </div>
        )}

        {/* Platform Filter + Bot List Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold">Meus Bots</h2>
            <div className="flex items-center gap-1 rounded-lg border border-border bg-secondary/50 p-0.5">
              <button
                onClick={() => setPlatformFilter('all')}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${platformFilter === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                Todos
              </button>
              {(['telegram', 'whatsapp', 'discord'] as Platform[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatformFilter(p)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${platformFilter === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {platformMeta[p].icon}
                  {platformMeta[p].label}
                </button>
              ))}
            </div>
          </div>
          <Button
            onClick={() => {
              if (!canCreateBot) { toast.error(`Limite de ${planLimits.maxBots} bot(s) atingido. Faça upgrade!`); return; }
              setDialogOpen(true);
            }}
            className="gap-2 bg-primary text-primary-foreground"
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
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 ${meta.color}`}>
                      {meta.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{bot.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-medium uppercase ${bot.is_active ? 'text-node-start' : 'text-muted-foreground'}`}>
                          {bot.is_active ? 'ATIVO' : 'INATIVO'}
                        </span>
                        <span className={`rounded-full border border-border px-2 py-0.5 text-[10px] font-medium ${meta.color}`}>
                          {meta.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  {bot.platform === 'telegram' && (
                    <p className="mb-4 text-xs text-muted-foreground">Token: {maskToken(bot.telegram_token)}</p>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5 border-border text-xs" onClick={() => navigate(`/editor/${bot.platform}/${bot.id}`)}>
                      <Pencil className="h-3.5 w-3.5" /> Editar Fluxo
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5 border-border text-xs" onClick={() => navigate(`/analytics/${bot.id}`)}>
                      <BarChart3 className="h-3.5 w-3.5" /> Analytics
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

      {/* Create Bot Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="border-border bg-card sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Criar Novo Bot</DialogTitle>
            <DialogDescription>
              {canCreateBot
                ? `Escolha a plataforma e dê um nome ao bot. (${bots.length}/${planLimits.maxBots} bots)`
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
            {newBotPlatform === 'telegram' && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Token do Telegram (opcional)</Label>
                <Input placeholder="123456789:ABCdef..." value={newBotToken} onChange={(e) => setNewBotToken(e.target.value)} className="border-border bg-secondary font-mono text-xs" />
              </div>
            )}
            {newBotPlatform === 'whatsapp' && (
              <p className="text-xs text-muted-foreground rounded-lg border border-border bg-secondary/30 p-3">
                💡 Configure o token da API WhatsApp Cloud (Meta) após criar o bot nas configurações.
              </p>
            )}
            {newBotPlatform === 'discord' && (
              <p className="text-xs text-muted-foreground rounded-lg border border-border bg-secondary/30 p-3">
                💡 Configure o token do Discord Bot após criar o bot nas configurações.
              </p>
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
    </div>
  );
}
