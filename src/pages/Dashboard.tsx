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
import { Bot, Plus, Pencil, Trash2, LogOut, Loader2, Crown, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface BotRecord {
  id: string;
  name: string;
  telegram_token: string | null;
  is_active: boolean;
  created_at: string;
}

export default function Dashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const { plan, subscribed, loading: subLoading, refresh: refreshSub } = useSubscription();
  const navigate = useNavigate();
  const [bots, setBots] = useState<BotRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotToken, setNewBotToken] = useState('');
  const [creating, setCreating] = useState(false);
  const [profile, setProfile] = useState<{ display_name: string | null } | null>(null);

  const planLimits = PLANS[plan];
  const canCreateBot = bots.length < planLimits.maxBots;

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBots();
      fetchProfile();
    }
  }, [user]);

  // Check for checkout success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('checkout') === 'success') {
      toast.success('Assinatura ativada com sucesso!');
      refreshSub();
      window.history.replaceState({}, '', '/dashboard');
    }
  }, []);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', user!.id)
      .maybeSingle();
    setProfile(data);
  };

  const fetchBots = async () => {
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .order('created_at', { ascending: false });
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
      telegram_token: newBotToken.trim() || null,
      user_id: user!.id,
    });
    if (error) {
      toast.error('Erro ao criar bot');
    } else {
      toast.success('Bot criado!');
      setDialogOpen(false);
      setNewBotName('');
      setNewBotToken('');
      fetchBots();
    }
    setCreating(false);
  };

  const deleteBot = async (id: string) => {
    const { error } = await supabase.from('bots').delete().eq('id', id);
    if (!error) {
      toast.success('Bot removido');
      fetchBots();
    }
  };

  const handleUpgrade = async (priceId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch {
      toast.error('Erro ao iniciar checkout');
    }
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch {
      toast.error('Erro ao abrir portal');
    }
  };

  const maskToken = (token: string | null) => {
    if (!token) return '—';
    return '••••••' + token.slice(-6);
  };

  if (authLoading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            {subscribed && (
              <Button variant="ghost" size="sm" onClick={handleManageSubscription} className="gap-1 text-xs">
                <Settings className="h-3.5 w-3.5" /> Gerenciar
              </Button>
            )}
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
              <p className="font-semibold text-primary">🚀 Faça upgrade para criar mais bots!</p>
              <p className="text-sm text-muted-foreground">Plano Pro: 5 bots + msgs ilimitadas por R$49/mês</p>
            </div>
            <Button onClick={() => handleUpgrade(PLANS.pro.priceId!)} className="bg-primary text-primary-foreground whitespace-nowrap">
              Upgrade Pro
            </Button>
          </div>
        )}

        {/* Bot List */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Meus Bots</h2>
          <Button
            onClick={() => {
              if (!canCreateBot) {
                toast.error(`Limite de ${planLimits.maxBots} bot(s) atingido. Faça upgrade!`);
                return;
              }
              setDialogOpen(true);
            }}
            className="gap-2 bg-primary text-primary-foreground"
          >
            <Plus className="h-4 w-4" /> Novo Bot
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : bots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
            <Bot className="mx-auto mb-3 h-10 w-10 opacity-30" />
            <p>Nenhum bot criado ainda.</p>
            <Button variant="outline" className="mt-4" onClick={() => setDialogOpen(true)}>Criar primeiro bot</Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {bots.map((bot) => (
              <div key={bot.id} className="rounded-xl border border-border bg-card p-5">
                <div className="mb-3 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Bot className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{bot.name}</h3>
                    <span className={`text-[11px] font-medium uppercase ${bot.is_active ? 'text-node-start' : 'text-muted-foreground'}`}>
                      {bot.is_active ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </div>
                </div>
                <p className="mb-4 text-xs text-muted-foreground">Token: {maskToken(bot.telegram_token)}</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5 border-border text-xs"
                    onClick={() => navigate(`/editor/${bot.id}`)}
                  >
                    <Pencil className="h-3.5 w-3.5" /> Editar Fluxo
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 text-destructive hover:bg-destructive/10"
                    onClick={() => deleteBot(bot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
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
                ? `Dê um nome ao bot e opcionalmente insira o token. (${bots.length}/${planLimits.maxBots} bots)`
                : `Limite atingido! Faça upgrade para criar mais bots.`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Nome do Bot</Label>
              <Input
                placeholder="Meu Bot de Vendas"
                value={newBotName}
                onChange={(e) => setNewBotName(e.target.value)}
                className="border-border bg-secondary"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Token do Telegram (opcional)</Label>
              <Input
                placeholder="123456789:ABCdef..."
                value={newBotToken}
                onChange={(e) => setNewBotToken(e.target.value)}
                className="border-border bg-secondary font-mono text-xs"
              />
            </div>
            <Button onClick={createBot} disabled={creating || !newBotName.trim() || !canCreateBot} className="w-full bg-primary text-primary-foreground">
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar Bot'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
