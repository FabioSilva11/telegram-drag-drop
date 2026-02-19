import { Link } from 'react-router-dom';
import {
  Bot, MessageSquare, GitBranch, Zap, Timer, Shield, Briefcase, Star,
  ArrowRight, Sparkles, Check, Users, TrendingUp, Clock, DollarSign, Lock,
  ChevronRight, Rocket, Globe, MessageCircle, Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import editorPreview from '@/assets/editor-preview.jpg';

const platforms = [
  { name: 'Telegram', emoji: '✈️', desc: 'Bots completos com mensagens, botões, enquetes, pagamentos e mais.' },
  { name: 'WhatsApp', emoji: '💬', badge: 'BETA', desc: 'WhatsApp Business Cloud API: mensagens, botões interativos e templates.' },
  { name: 'Discord', emoji: '🎮', badge: 'BETA', desc: 'Slash commands, embeds, botões e interações no seu servidor.' },
];

const urgencyReasons = [
  { icon: Clock, title: 'Atendimento 24/7 em 3 plataformas', desc: 'Bots respondem no Telegram, WhatsApp e Discord simultaneamente.' },
  { icon: TrendingUp, title: 'Vendas no piloto automático', desc: 'Capture leads, envie catálogos e feche vendas em qualquer chat.' },
  { icon: Zap, title: 'Engajamento altíssimo', desc: 'Taxas de abertura muito maiores que email ou redes sociais.' },
  { icon: DollarSign, title: 'Custo baixo, retorno rápido', desc: 'Comece grátis com todas as plataformas, escale por R$49/mês.' },
  { icon: Shield, title: 'Segurança total', desc: 'Tokens criptografados, dados protegidos por RLS.' },
  { icon: Globe, title: 'Multiplataforma nativo', desc: 'Um editor, três plataformas. Mesmo fluxo, alcance máximo.' },
];

const features = [
  { icon: MessageSquare, title: 'Mensagens Dinâmicas', desc: 'Textos, imagens, vídeos, docs e áudios em qualquer plataforma.' },
  { icon: GitBranch, title: 'Fluxos Condicionais', desc: 'Ramificações inteligentes baseadas nas respostas do usuário.' },
  { icon: Zap, title: 'Ações & APIs', desc: 'Integre CRM, pagamentos, Google Sheets, webhooks e mais.' },
  { icon: Timer, title: 'Atrasos Programados', desc: 'Timing perfeito para nutrição de leads e conversão.' },
  { icon: Briefcase, title: 'Multi-Bot & Multi-Plataforma', desc: 'Gerencie dezenas de bots em Telegram, WhatsApp e Discord.' },
  { icon: Shield, title: 'IA Integrada', desc: 'ChatGPT, Gemini e Groq direto nos seus fluxos.' },
];

const plans = [
  { name: 'Starter', price: 'Grátis', sub: '1 bot · Todas as plataformas', features: ['Editor visual drag & drop', '1 bot', 'Telegram + WhatsApp + Discord', 'Blocos básicos', 'Suporte comunidade'], highlight: false },
  { name: 'Pro', price: 'R$ 49/mês', sub: '5 bots · Todas as plataformas', features: ['Tudo do Starter', '5 bots', 'Todos os blocos', 'Telegram + WhatsApp + Discord', 'APIs externas & IA', 'Suporte prioritário'], highlight: true, badge: '🔥 Mais Popular' },
  { name: 'Enterprise', price: 'R$ 149/mês', sub: '11 bots · Todas as plataformas', features: ['Tudo do Pro', '11 bots', 'Webhooks avançados', 'Telegram + WhatsApp + Discord', 'Suporte dedicado'], highlight: false },
];

const testimonials = [
  { text: '"Criei bots para Telegram e WhatsApp ao mesmo tempo. Meu faturamento subiu 3x!"', name: 'Carlos M.', role: 'Empreendedor Digital', stars: 5 },
  { text: '"Gerencio 8 bots em 3 plataformas diferentes. Economia de tempo absurda."', name: 'Ana P.', role: 'Social Media Manager', stars: 5 },
  { text: '"Editor visual incrível. Comecei grátis e migrei pro Pro na semana."', name: 'Rafael S.', role: 'Dev Freelancer', stars: 5 },
];

const howItWorks = [
  { step: '01', title: 'Crie sua conta', desc: 'Cadastre-se gratuitamente em menos de 30 segundos.' },
  { step: '02', title: 'Monte seu fluxo', desc: 'Arraste e solte blocos no editor visual para criar a lógica do bot.' },
  { step: '03', title: 'Escolha a plataforma', desc: 'Telegram, WhatsApp ou Discord — configure em poucos cliques.' },
  { step: '04', title: 'Lucre no automático', desc: 'Seu bot atende, vende e engaja 24/7 em todas as plataformas.' },
];

const metrics = [
  { value: '3', label: 'Plataformas Suportadas' },
  { value: '98%', label: 'Taxa de abertura' },
  { value: '24/7', label: 'Atendimento na nuvem' },
  { value: '3x', label: 'Aumento médio em vendas' },
];

const faqs = [
  { q: 'Quais plataformas são suportadas?', a: 'Telegram (100% funcional), WhatsApp Business (Beta) via Cloud API da Meta, e Discord (Beta) com slash commands, embeds e botões. Novas plataformas são adicionadas frequentemente.' },
  { q: 'Preciso programar?', a: 'Não! Arraste e solte blocos no editor visual. Sem uma linha de código.' },
  { q: 'Posso usar as 3 plataformas no plano grátis?', a: 'Sim! Todos os planos suportam Telegram, WhatsApp e Discord. O plano grátis permite 1 bot em qualquer plataforma.' },
  { q: 'O bot funciona quando eu não estou online?', a: 'Sim! Seus bots rodam 24/7 na nuvem, respondendo automaticamente mesmo quando você está offline.' },
  { q: 'Posso cancelar a qualquer momento?', a: 'Sim! Cancele quando quiser sem burocracia. Sem fidelidade.' },
  { q: 'Como funciona o WhatsApp Business?', a: 'Usamos a Cloud API oficial da Meta. Você precisa de uma conta Meta Business com o WhatsApp Business API configurado. Suportamos mensagens de texto, imagens, botões interativos e templates.' },
  { q: 'Como funciona o Discord?', a: 'Criamos bots usando a API oficial do Discord. Suportamos slash commands, embeds ricos, botões interativos e respostas automáticas no seu servidor.' },
];

const NAV_LINKS = [
  { label: 'Plataformas', href: '#plataformas' },
  { label: 'Recursos', href: '#recursos' },
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Preços', href: '#precos' },
  { label: 'FAQ', href: '#faq' },
];

// Animated background particles
function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Large glow orbs */}
      <div className="absolute top-[10%] left-[20%] h-[400px] w-[400px] rounded-full bg-purple-600/[0.07] blur-[100px] animate-pulse" style={{ animationDuration: '4s' }} />
      <div className="absolute top-[50%] right-[10%] h-[300px] w-[300px] rounded-full bg-purple-500/[0.05] blur-[80px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      <div className="absolute bottom-[20%] left-[10%] h-[350px] w-[350px] rounded-full bg-purple-700/[0.06] blur-[90px] animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      
      {/* Small floating dots */}
      {[
        { top: '15%', left: '12%', size: 3, delay: '0s', dur: '3s' },
        { top: '25%', left: '85%', size: 2, delay: '1s', dur: '4s' },
        { top: '45%', left: '8%', size: 2, delay: '2s', dur: '3.5s' },
        { top: '60%', left: '90%', size: 3, delay: '0.5s', dur: '4.5s' },
        { top: '75%', left: '25%', size: 2, delay: '1.5s', dur: '3s' },
        { top: '35%', left: '50%', size: 2, delay: '3s', dur: '5s' },
        { top: '80%', left: '70%', size: 3, delay: '2.5s', dur: '4s' },
        { top: '10%', left: '60%', size: 2, delay: '0.8s', dur: '3.8s' },
        { top: '55%', left: '40%', size: 2, delay: '1.2s', dur: '4.2s' },
        { top: '90%', left: '55%', size: 2, delay: '2s', dur: '3.5s' },
      ].map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-purple-400/30 animate-pulse"
          style={{
            top: p.top,
            left: p.left,
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.dur,
          }}
        />
      ))}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-white relative" style={{ fontFamily: "'Inter', 'Space Grotesk', sans-serif" }}>
      <FloatingParticles />

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0e17]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/15">
              <Bot className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-lg font-bold text-white">FlowBot</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-sm text-white/60 hover:text-white transition-colors">
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/5">Entrar</Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button size="sm" className="bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-all hover:scale-105 rounded-full px-5">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-6 py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 via-transparent to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[700px] w-[700px] rounded-full bg-purple-600/10 blur-[150px]" />
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-sm text-purple-400">
            <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" /> Plataforma No-Code para Bots
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
            Bots para{' '}
            <span className="text-purple-400">Telegram</span>,{' '}
            <span className="text-purple-400">WhatsApp</span>{' '}
            <br className="hidden sm:block" />
            e <span className="text-purple-400">Discord</span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base sm:text-lg text-white/50 leading-relaxed">
            Crie bots profissionais para <strong className="text-white">3 plataformas</strong> com
            editor visual drag & drop. Automatize atendimento, vendas e engajamento
            <strong className="text-purple-400"> 24/7</strong> sem escrever código.
          </p>

          {/* Platform badges */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            {platforms.map((p) => (
              <div key={p.name} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/80 backdrop-blur-sm">
                <span className="text-lg">{p.emoji}</span> {p.name}
                {p.badge && <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-yellow-500/50 text-yellow-400">{p.badge}</Badge>}
              </div>
            ))}
          </div>

          <Link to="/auth?mode=signup">
            <Button
              size="lg"
              className="gap-2 bg-purple-600 text-white font-bold text-base sm:text-lg px-10 py-6 rounded-full hover:bg-purple-500 transition-all hover:scale-105 shadow-[0_0_40px_rgba(147,51,234,0.4)]"
            >
              Criar Minha Conta Grátis <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Metrics */}
      <section className="relative border-t border-white/5 px-6 py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 sm:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="text-center rounded-xl border border-purple-500/20 bg-white/[0.02] py-6 px-4 backdrop-blur-sm">
              <p className="text-3xl font-extrabold text-purple-400">{m.value}</p>
              <p className="mt-1 text-sm text-white/50">{m.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Platforms Section */}
      <section id="plataformas" className="relative border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl sm:text-4xl font-bold text-white">
            Uma Plataforma, <span className="text-purple-400">3 Canais</span>
          </h2>
          <p className="mb-12 text-center text-white/50">Mesmo editor, mesmo fluxo. Publique onde seu público está.</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {platforms.map((p) => (
              <div key={p.name} className="group rounded-xl border border-purple-500/20 bg-white/[0.02] p-8 text-center transition-all hover:border-purple-500/40 hover:bg-purple-500/5 backdrop-blur-sm">
                <div className="mb-5 text-6xl">{p.emoji}</div>
                <h3 className="font-bold text-lg text-white flex items-center justify-center gap-2 mb-3">
                  {p.name}
                  {p.badge && <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-yellow-500/50 text-yellow-400">{p.badge}</Badge>}
                </h3>
                <p className="text-sm text-white/50">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editor Preview */}
      <section className="relative border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl sm:text-4xl font-bold text-white">
            Editor Visual <span className="text-purple-400">Intuitivo</span>
          </h2>
          <p className="mb-10 text-center text-white/50">Arraste, solte e conecte blocos — sem código, sem complicação.</p>
          <div className="relative rounded-2xl border border-purple-500/20 bg-white/[0.02] p-2 shadow-[0_0_80px_rgba(147,51,234,0.1)]">
            <img src={editorPreview} alt="FlowBot Editor Visual - Interface de criação de bots multiplataforma" className="w-full rounded-xl" />
          </div>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="relative border-t border-purple-500/10 bg-gradient-to-b from-purple-900/5 to-transparent px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl sm:text-4xl font-bold text-white">
            Por que Você <span className="text-purple-400">PRECISA</span> Automatizar Hoje?
          </h2>
          <p className="mb-12 text-center text-white/50">Quem não automatiza, perde clientes para quem automatiza.</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {urgencyReasons.map((r) => (
              <div key={r.title} className="group rounded-xl border border-purple-500/20 bg-white/[0.02] p-6 transition-all hover:border-purple-500/40 hover:bg-purple-500/5 backdrop-blur-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/15 group-hover:bg-purple-500/25 transition-colors">
                  <r.icon className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="mb-2 font-bold text-white">{r.title}</h3>
                <p className="text-sm text-white/50">{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="como-funciona" className="relative border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-4 text-center text-3xl sm:text-4xl font-bold text-white">
            Como <span className="text-purple-400">Funciona</span>
          </h2>
          <p className="mb-14 text-center text-white/50">4 passos simples para automatizar seu negócio</p>
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
            {howItWorks.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-purple-600 text-xl font-bold text-white shadow-[0_0_30px_rgba(147,51,234,0.5)]">
                  {s.step}
                </div>
                <h3 className="mb-2 font-bold text-white">{s.title}</h3>
                <p className="text-sm text-white/50">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="recursos" className="relative border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl sm:text-4xl font-bold text-white">
            Ferramentas <span className="text-purple-400">Poderosas</span> para Todas as Plataformas
          </h2>
          <p className="mb-12 text-center text-white/50">Tudo que você precisa para criar bots profissionais</p>
          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <div key={f.title} className="group rounded-xl border border-purple-500/20 bg-white/[0.02] p-6 transition-all hover:border-purple-500/40 backdrop-blur-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/15">
                  <f.icon className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="mb-2 font-bold text-white">{f.title}</h3>
                <p className="text-sm text-white/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="relative border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-4 text-center text-3xl sm:text-4xl font-bold text-white">
            Planos & <span className="text-purple-400">Preços</span>
          </h2>
          <p className="mb-12 text-center text-white/50">Todas as plataformas em todos os planos. Comece grátis.</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`relative rounded-2xl border p-6 transition-all backdrop-blur-sm ${
                  p.highlight
                    ? 'border-purple-500 bg-purple-500/5 shadow-[0_0_40px_rgba(147,51,234,0.15)]'
                    : 'border-purple-500/20 bg-white/[0.02]'
                }`}
              >
                {p.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-purple-600 px-4 py-1 text-xs font-bold text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]">
                    {p.badge}
                  </div>
                )}
                <h3 className="font-bold text-white">{p.name}</h3>
                <div className="mt-2 text-3xl font-bold text-purple-400">{p.price}</div>
                <p className="mb-6 text-sm text-white/50">{p.sub}</p>
                <ul className="mb-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/60">
                      <Check className="h-4 w-4 text-purple-400 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/auth?mode=signup">
                  <Button
                    className={`w-full font-semibold transition-all hover:scale-105 rounded-full ${
                      p.highlight
                        ? 'bg-purple-600 text-white hover:bg-purple-500 shadow-[0_0_20px_rgba(147,51,234,0.3)]'
                        : 'border border-purple-500/20 bg-white/5 text-white hover:bg-white/10'
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
      <section className="relative border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="mb-12 text-center text-3xl sm:text-4xl font-bold text-white">
            O Que Estão <span className="text-purple-400">Dizendo</span>
          </h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-xl border border-purple-500/20 bg-white/[0.02] p-6 backdrop-blur-sm">
                <div className="mb-3 flex gap-1">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-purple-400 text-purple-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm text-white/60">{t.text}</p>
                <p className="font-bold text-white">{t.name}</p>
                <p className="text-xs text-white/40">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative border-t border-white/5 px-6 py-20">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-12 text-center text-3xl sm:text-4xl font-bold text-white">
            Perguntas <span className="text-purple-400">Frequentes</span>
          </h2>
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="rounded-xl border border-purple-500/20 bg-white/[0.02] px-6 backdrop-blur-sm">
                <AccordionTrigger className="text-left text-sm font-medium text-white hover:no-underline">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-white/50">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="relative border-t border-purple-500/10 px-6 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-500/10 to-purple-900/5 p-10 backdrop-blur-sm">
            <h2 className="mb-6 text-2xl sm:text-3xl font-bold text-white">
              Automatize <span className="text-purple-400">Telegram</span>, <span className="text-purple-400">WhatsApp</span>{' '}
              e <span className="text-purple-400">Discord</span> — Tudo de Graça
            </h2>
            <p className="mb-8 text-white/50">Comece agora com seu primeiro bot em qualquer plataforma.</p>
            <Link to="/auth?mode=signup">
              <Button
                size="lg"
                className="gap-2 bg-purple-600 text-white font-bold text-base px-10 py-6 rounded-full hover:bg-purple-500 transition-all hover:scale-105 shadow-[0_0_40px_rgba(147,51,234,0.4)]"
              >
                Criar Conta Grátis Agora <Sparkles className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 px-6 py-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/15">
              <Bot className="h-4 w-4 text-purple-400" />
            </div>
            <span className="text-sm font-semibold text-white">FlowBot</span>
          </div>
          <p className="text-xs text-white/30">© 2026 FlowBot. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
