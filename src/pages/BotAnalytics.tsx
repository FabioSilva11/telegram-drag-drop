import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bot, MessageSquare, Users, TrendingUp, BarChart3, MessageCircle } from 'lucide-react';

interface DailyData {
  date: string;
  incoming: number;
  outgoing: number;
}

export default function BotAnalytics() {
  const { botId } = useParams<{ botId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [botName, setBotName] = useState('');
  const [totalIncoming, setTotalIncoming] = useState(0);
  const [totalOutgoing, setTotalOutgoing] = useState(0);
  const [uniqueUsers, setUniqueUsers] = useState(0);
  const [todayMessages, setTodayMessages] = useState(0);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);

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
    // Fetch all messages for this bot
    const { data: messages } = await supabase
      .from('bot_messages')
      .select('direction, telegram_chat_id, created_at')
      .eq('bot_id', botId!);

    if (!messages || messages.length === 0) return;

    const incoming = messages.filter(m => m.direction === 'incoming').length;
    const outgoing = messages.filter(m => m.direction === 'outgoing').length;
    const uniqueChats = new Set(messages.map(m => m.telegram_chat_id)).size;

    setTotalIncoming(incoming);
    setTotalOutgoing(outgoing);
    setUniqueUsers(uniqueChats);

    // Today's messages
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = messages.filter(m => new Date(m.created_at) >= today).length;
    setTodayMessages(todayCount);

    // Build daily data for last 7 days
    const daily: Record<string, { incoming: number; outgoing: number }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      daily[key] = { incoming: 0, outgoing: 0 };
    }
    messages.forEach(m => {
      const key = m.created_at.split('T')[0];
      if (daily[key]) {
        if (m.direction === 'incoming') daily[key].incoming++;
        else daily[key].outgoing++;
      }
    });
    setDailyData(Object.entries(daily).map(([date, d]) => ({ date, ...d })));
  };

  if (authLoading || !user) return null;

  const stats = [
    { label: 'Mensagens Recebidas', value: totalIncoming, icon: MessageSquare, color: 'text-primary' },
    { label: 'Mensagens Enviadas', value: totalOutgoing, icon: MessageCircle, color: 'text-node-message' },
    { label: 'Usuários Únicos', value: uniqueUsers, icon: Users, color: 'text-node-start' },
    { label: 'Hoje', value: todayMessages, icon: TrendingUp, color: 'text-node-condition' },
  ];

  const maxDaily = Math.max(...dailyData.map(d => d.incoming + d.outgoing), 1);

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

        {/* Simple bar chart for last 7 days */}
        <div className="rounded-xl border border-border bg-card p-6 mb-8">
          <h2 className="text-sm font-semibold mb-4">Últimos 7 dias</h2>
          {dailyData.length > 0 ? (
            <div className="flex items-end gap-2 h-40">
              {dailyData.map((d) => {
                const total = d.incoming + d.outgoing;
                const height = (total / maxDaily) * 100;
                const inPct = total > 0 ? (d.incoming / total) * 100 : 0;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">{total}</span>
                    <div className="w-full rounded-t overflow-hidden" style={{ height: `${Math.max(height, 4)}%` }}>
                      <div className="w-full bg-primary" style={{ height: `${100 - inPct}%` }} />
                      <div className="w-full bg-primary/40" style={{ height: `${inPct}%` }} />
                    </div>
                    <span className="text-[9px] text-muted-foreground">
                      {new Date(d.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                Nenhuma interação registrada ainda. Envie /start no seu bot para começar.
              </p>
            </div>
          )}
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary" /> Enviadas</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary/40" /> Recebidas</div>
          </div>
        </div>
      </main>
    </div>
  );
}
