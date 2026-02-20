import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Stars = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {Array.from({ length: 50 }).map((_, i) => (
      <div
        key={i}
        className="star"
        style={{
          width: `${Math.random() * 3 + 1}px`,
          height: `${Math.random() * 3 + 1}px`,
          top: `${Math.random() * 100}%`,
          left: `${Math.random() * 100}%`,
          "--delay": `${Math.random() * 5}s`,
          "--duration": `${Math.random() * 3 + 2}s`,
        } as React.CSSProperties}
      />
    ))}
  </div>
);

// SVG icons reais
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
    <circle cx="12" cy="12" r="12" fill="#26A5E4"/>
    <path d="M5.5 11.5l10-4.5c.6-.25 1.1.1.9.8l-1.7 8c-.1.5-.5.7-.9.4l-2.5-1.9-1.2 1.1c-.1.1-.3.2-.5.2l.2-2.7 4.7-4.3c.2-.2 0-.3-.3-.1l-5.8 3.7-2.4-.8c-.5-.15-.5-.5.5-.85z" fill="white"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
    <circle cx="12" cy="12" r="12" fill="#25D366"/>
    <path d="M17.5 14.4c-.3-.15-1.7-.85-2-1-.3-.1-.5-.15-.7.15-.2.3-.8 1-.95 1.2-.18.2-.35.22-.65.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.52-.08-.15-.7-1.7-.96-2.32-.25-.6-.5-.52-.7-.53-.18 0-.38-.02-.58-.02s-.52.08-.8.38c-.28.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.12 3.22 5.12 4.52.72.3 1.28.5 1.72.63.72.22 1.38.2 1.9.12.58-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35z" fill="white"/>
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
    <circle cx="12" cy="12" r="12" fill="#5865F2"/>
    <path d="M17.27 7.4A14.9 14.9 0 0 0 14 6.5c-.14.25-.3.6-.4.86a13.8 13.8 0 0 0-3.2 0A9.3 9.3 0 0 0 10 6.5a14.9 14.9 0 0 0-3.28.9C5.02 10.03 4.6 12.6 4.8 15.13a14.9 14.9 0 0 0 4.55 2.3c.37-.5.7-1.03.98-1.6-.54-.2-1.05-.45-1.53-.74.13-.09.25-.19.37-.28a10.6 10.6 0 0 0 9.05 0c.12.1.24.2.37.28-.48.3-1 .54-1.53.74.28.57.61 1.1.98 1.6a14.8 14.8 0 0 0 4.54-2.3c.22-2.9-.37-5.44-1.8-7.73zM9.52 13.57c-.69 0-1.26-.63-1.26-1.4s.55-1.4 1.26-1.4c.7 0 1.27.63 1.26 1.4 0 .77-.56 1.4-1.26 1.4zm4.66 0c-.7 0-1.26-.63-1.26-1.4s.55-1.4 1.26-1.4c.7 0 1.27.63 1.26 1.4 0 .77-.56 1.4-1.26 1.4z" fill="white"/>
  </svg>
);

const platforms = [
  { Icon: TelegramIcon, label: "Telegram" },
  { Icon: WhatsAppIcon, label: "WhatsApp" },
  { Icon: DiscordIcon, label: "Discord" },
];

const stats = [
  { value: "3", label: "Plataformas Suportadas" },
  { value: "98%", label: "Taxa de abertura" },
  { value: "24/7", label: "Atendimento na nuvem" },
  { value: "3x", label: "Aumento médio em vendas" },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) navigate('/dashboard');
    else navigate('/auth');
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden">
      <div className="absolute inset-0 bg-glow" />
      <Stars />

      <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-glow bg-secondary/60 px-4 py-1.5 text-xs font-medium text-primary mb-6"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Plataforma No-Code para Bots
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-5xl mb-6"
        >
          Bots para <span className="text-gradient">Telegram, WhatsApp</span> e{" "}
          <span className="text-gradient">Discord</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-muted-foreground text-base sm:text-lg max-w-2xl mb-10"
        >
          Crie bots profissionais para 3 plataformas com editor visual drag & drop.
          Automatize atendimento, vendas e engajamento 24/7 sem escrever código.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-8"
        >
          {platforms.map((p) => (
            <div key={p.label} className="glass rounded-xl px-5 py-3 flex items-center gap-3">
              <p.Icon />
              <span className="font-display font-semibold text-foreground">{p.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          onClick={handleCTA}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition-all hover:scale-105 mb-16"
        >
          Criar Minha Conta Grátis
          <ArrowRight className="h-4 w-4" />
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-3xl"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-5 text-center">
              <div className="font-display text-3xl font-bold text-gradient mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
