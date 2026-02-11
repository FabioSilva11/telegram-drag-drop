import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot, MessageSquare, GitBranch, Zap, Timer, Shield, Briefcase, Star,
  ArrowRight, Sparkles, Check, Users, TrendingUp, Clock, DollarSign, Lock,
  ChevronRight, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const urgencyReasons = [
  { icon: Users, title: 'Atendimento infinito sem contratar ninguém', desc: 'Economize horas e dinheiro com bots que respondem 24h.' },
  { icon: TrendingUp, title: 'Vendas 24h no piloto automático', desc: 'Capture leads, envie catálogos, feche vendas direto no chat.' },
  { icon: Zap, title: 'Engajamento altíssimo', desc: 'Taxas de abertura muito maiores que Instagram/WhatsApp.' },
  { icon: DollarSign, title: 'Custo baixo, retorno rápido', desc: 'Comece grátis, escale por R$49/mês.' },
  { icon: Lock, title: 'Segurança total', desc: 'Tokens criptografados, dados protegidos.' },
];

const features = [
  { icon: MessageSquare, title: 'Mensagens Dinâmicas', desc: 'Envie textos, imagens, docs automaticamente.' },
  { icon: GitBranch, title: 'Fluxos Condicionais', desc: 'Ramificações inteligentes baseadas nas respostas.' },
  { icon: Zap, title: 'Ações & APIs', desc: 'Integre CRM, pagamentos, Google Sheets etc.' },
  { icon: Timer, title: 'Atrasos Programados', desc: 'Timing perfeito para conversão.' },
  { icon: Briefcase, title: 'Multi-Bot', desc: 'Gerencie dezenas de bots em uma conta só.' },
  { icon: Shield, title: 'Seguro & Privado', desc: 'Tudo criptografado.' },
];

const plans = [
  { name: 'Starter', price: 'Grátis', sub: '1 bot · 50 msgs/dia', features: ['Editor visual', '50 mensagens/dia', '1 bot', 'Suporte comunidade'], highlight: false },
  { name: 'Pro', price: 'R$ 49/mês', sub: '5 bots · msgs ilimitadas', features: ['Tudo do Starter', 'Mensagens ilimitadas', '5 bots', 'APIs externas', 'Suporte prioritário'], highlight: true, badge: '🔥 Mais Popular' },
  { name: 'Enterprise', price: 'R$ 149/mês', sub: '11 bots · msgs ilimitadas', features: ['Tudo do Pro', '11 bots', 'White-label', 'Webhooks avançados', 'Suporte dedicado'], highlight: false },
];

const testimonials = [
  { text: '"Criei bots de atendimento e vendas em 30 min. Meu faturamento subiu 3x!"', name: 'Carlos M.', role: 'Empreendedor Digital', stars: 5 },
  { text: '"Gerencio 8 bots diferentes. Economia de tempo absurda."', name: 'Ana P.', role: 'Social Media Manager', stars: 5 },
  { text: '"Editor visual incrível. Comecei grátis e migrei pro Pro na semana."', name: 'Rafael S.', role: 'Dev Freelancer', stars: 5 },
];

const faqs = [
  { q: 'Por que Telegram e não WhatsApp?', a: 'O Telegram permite bots poderosos nativamente, canais ilimitados e tem engajamento muito maior. Sem precisar de APIs pagas ou aprovação.' },
  { q: 'Preciso programar?', a: 'Não! Arraste e solte blocos no editor visual. Sem uma linha de código.' },
  { q: 'Quanto tempo pra ver resultado?', a: 'Muitos usuários veem leads chegando na primeira semana após configurar seus bots.' },
  { q: 'E se eu não usar agora?', a: 'Concorrentes capturam clientes 24h enquanto você responde manualmente. Cada dia sem automação é dinheiro perdido.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim! Cancele quando quiser sem burocracia. Sem fidelidade.' },
];

function CountdownTimer() {
  const [time, setTime] = useState({ d: 3, h: 12, m: 47, s: 33 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(prev => {
        let { d, h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; d--; }
        if (d < 0) return { d: 0, h: 0, m: 0, s: 0 };
        return { d, h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="inline-flex items-center gap-1 text-sm font-mono">
      <span className="rounded bg-primary/20 px-2 py-1 text-primary font-bold">{pad(time.d)}d</span>
      <span className="text-muted-foreground">:</span>
      <span className="rounded bg-primary/20 px-2 py-1 text-primary font-bold">{pad(time.h)}h</span>
      <span className="text-muted-foreground">:</span>
      <span className="rounded bg-primary/20 px-2 py-1 text-primary font-bold">{pad(time.m)}m</span>
      <span className="text-muted-foreground">:</span>
      <span className="rounded bg-primary/20 px-2 py-1 text-primary font-bold">{pad(time.s)}s</span>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-foreground" style={{ fontFamily: "'Inter', 'Space Grotesk', sans-serif" }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0e17]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00BFFF]/15">
              <Bot className="h-5 w-5 text-[#00BFFF]" />
            </div>
            <span className="text-lg font-bold text-white">FlowBot</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">Entrar</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="bg-[#00BFFF] text-black font-semibold hover:bg-[#33ccff] transition-all hover:scale-105">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-20 sm:py-28">
        <div className="absolute inset-0 bg-gradient-to-b from-[#00BFFF]/5 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#00BFFF]/5 blur-[120px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#00BFFF]/30 bg-[#00BFFF]/10 px-4 py-1.5 text-sm text-[#00BFFF] animate-pulse">
            <AlertTriangle className="h-4 w-4" /> Aviso Urgente – Fevereiro 2026
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Domine o Telegram Antes que Seus Concorrentes{' '}
            <span className="text-[#00BFFF]">Façam Isso</span>
          </h1>

          <p className="mx-auto mb-6 max-w-2xl text-base sm:text-lg text-white/60 leading-relaxed">
            Telegram já tem mais de <strong className="text-white">22 milhões de usuários ativos</strong> só no Brasil
            e virou a principal plataforma de vendas e atendimento digital.
            Bots automatizam tudo 24h — se você não começar <strong className="text-[#00BFFF]">AGORA</strong>,
            perde leads e faturamento todos os dias.
          </p>

          <p className="mx-auto mb-8 max-w-xl text-sm sm:text-base text-white/50">
            Crie bots profissionais em minutos sem código: atendimento infinito, vendas automáticas,
            leads qualificados e engajamento altíssimo.
          </p>

          <Link to="/auth?mode=signup">
            <Button
              size="lg"
              className="gap-2 bg-[#00BFFF] text-black font-bold text-base sm:text-lg px-8 py-6 rounded-xl hover:bg-[#33ccff] transition-all hover:scale-105 shadow-[0_0_30px_rgba(0,191,255,0.3)]"
            >
              Criar Minha Conta Grátis + Pegar 50% OFF Agora <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>

          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-sm text-[#00BFFF]/80 font-medium animate-pulse">
              ⚡ Promoção de 50% OFF no 1º mês acaba em poucos dias – vagas limitadas!
            </p>
            <CountdownTimer />
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl sm:text-4xl font-bold text-white">
            Por que Você <span className="text-[#00BFFF]">PRECISA</span> Automatizar Seu Negócio no Telegram Hoje?
          </h2>
          <p className="mb-12 text-center text-white/50">Quem não automatiza, perde clientes para quem automatiza.</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {urgencyReasons.map((r) => (
              <div key={r.title} className="group rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-[#00BFFF]/30 hover:bg-[#00BFFF]/5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#00BFFF]/10 group-hover:bg-[#00BFFF]/20 transition-colors">
                  <r.icon className="h-6 w-6 text-[#00BFFF]" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{r.title}</h3>
                <p className="text-sm text-white/50">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl sm:text-4xl font-bold text-white">
            Ferramentas que Seus Concorrentes <span className="text-[#00BFFF]">Já Usam</span> para Lucrar Mais
          </h2>
          <p className="mb-12 text-center text-white/50">Tudo que você precisa para criar bots profissionais</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="group rounded-xl border border-white/5 bg-white/[0.02] p-6 transition-all hover:border-[#00BFFF]/30">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#00BFFF]/10">
                  <f.icon className="h-5 w-5 text-[#00BFFF]" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{f.title}</h3>
                <p className="text-sm text-white/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl sm:text-4xl font-bold text-white">
            Planos & Preços – <span className="text-[#00BFFF]">Escolha Agora</span> Antes que a Oferta Acabe!
          </h2>
          <p className="mb-12 text-center text-white/50">Comece grátis, escale quando quiser</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border p-6 transition-all ${
                  p.highlight
                    ? 'border-[#00BFFF] bg-[#00BFFF]/5 shadow-[0_0_40px_rgba(0,191,255,0.1)]'
                    : 'border-white/10 bg-white/[0.02]'
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#00BFFF] px-4 py-1 text-xs font-bold text-black">
                    {p.badge}
                  </div>
                )}
                <h3 className="font-semibold text-white">{p.name}</h3>
                <div className="mt-2 text-3xl font-bold text-white">{p.price}</div>
                <p className="mb-6 text-sm text-[#00BFFF]">{p.sub}</p>
                <ul className="mb-6 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                      <Check className="h-4 w-4 text-[#00BFFF] shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth?mode=signup">
                  <Button
                    className={`w-full font-semibold transition-all hover:scale-105 ${
                      p.highlight
                        ? 'bg-[#00BFFF] text-black hover:bg-[#33ccff]'
                        : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                    }`}
                  >
                    {p.highlight ? 'Começar Agora' : 'Selecionar'} <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl sm:text-4xl font-bold text-white">
            O Que Estão <span className="text-[#00BFFF]">Dizendo</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-white/5 bg-white/[0.02] p-6">
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-[#00BFFF] text-[#00BFFF]" />
                  ))}
                </div>
                <p className="mb-4 text-sm text-white/60">{t.text}</p>
                <p className="font-semibold text-white">{t.name}</p>
                <p className="text-xs text-white/40">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-12 text-center text-3xl sm:text-4xl font-bold text-white">
            Perguntas que <span className="text-[#00BFFF]">Todo Mundo</span> Tem
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-white/5 bg-white/[0.02] px-6">
                <AccordionTrigger className="text-left text-sm font-medium text-white hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-white/50">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-2xl sm:text-3xl font-bold text-white">
            Não Perca Mais Uma Noite Sem Automatizar Seu Negócio
          </h2>
          <Link to="/auth?mode=signup">
            <Button
              size="lg"
              className="gap-2 bg-[#00BFFF] text-black font-bold text-base px-8 py-6 rounded-xl hover:bg-[#33ccff] transition-all hover:scale-105 shadow-[0_0_30px_rgba(0,191,255,0.3)]"
            >
              Criar Conta Grátis + 50% OFF <Sparkles className="h-5 w-5" />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-[#00BFFF]/70 font-medium animate-pulse">
            ⚡ Ação Urgente: Promoção acaba em poucos dias.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-xs text-white/30">
        © 2026 FlowBot. Todos os direitos reservados.
      </footer>
    </div>
  );
}
