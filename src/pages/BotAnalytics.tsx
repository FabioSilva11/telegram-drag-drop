import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bot, MessageSquare, Users, TrendingUp, BarChart3 } from 'lucide-react';

export default function BotAnalytics() {
  const { botId } = useParams<{ botId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [botName, setBotName] = useState('');
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user && botId) {
      fetchBotInfo();
      fetchAnalytics();
    }
  }, [user, botId]);

  const fetchBotInfo = async () => {
    const { data } = await supabase.from('bots').select('name').eq('id', botId!).maybeSingle();
    if (data) setBotName(data.name);
  };

  const fetchAnalytics = async () => {
    // Count sessions from bot_flows linked to this bot
    const { data: flows } = await supabase.from('bot_flows').select('id').eq('bot_id', botId!);
    if (flows && flows.length > 0) {
      const flowIds = flows.map(f => f.id);
      const { count } = await supabase
        .from('bot_sessions')
        .select('*', { count: 'exact', head: true })
        .in('flow_id', flowIds);
      setSessionCount(count || 0);
    }
  };

  if (authLoading || !user) return null;

  const stats = [
    { label: 'Sessões Ativas', value: sessionCount, icon: Users, color: 'text-primary' },
    { label: 'Mensagens Enviadas', value: '—', icon: MessageSquare, color: 'text-node-message' },
    { label: 'Taxa de Conclusão', value: '—', icon: TrendingUp, color: 'text-node-start' },
    { label: 'Conversões', value: '—', icon: BarChart3, color: 'text-node-condition' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-bold">Analytics: {botName}</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={`h-4 w-4 ${s.color}`} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <h2 className="text-lg font-semibold mb-2">Analytics Detalhado</h2>
          <p className="text-sm text-muted-foreground">
            Métricas detalhadas como mensagens por hora, funil de conversão e engajamento
            estarão disponíveis em breve conforme seu bot receber interações.
          </p>
        </div>
      </main>
    </div>
  );
}
