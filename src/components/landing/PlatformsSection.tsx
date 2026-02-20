import { motion } from "framer-motion";
import heroDashboard from "@/assets/hero-dashboard.png";

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto mb-4" fill="none">
    <circle cx="12" cy="12" r="12" fill="#26A5E4"/>
    <path d="M5.5 11.5l10-4.5c.6-.25 1.1.1.9.8l-1.7 8c-.1.5-.5.7-.9.4l-2.5-1.9-1.2 1.1c-.1.1-.3.2-.5.2l.2-2.7 4.7-4.3c.2-.2 0-.3-.3-.1l-5.8 3.7-2.4-.8c-.5-.15-.5-.5.5-.85z" fill="white"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto mb-4" fill="none">
    <circle cx="12" cy="12" r="12" fill="#25D366"/>
    <path d="M17.5 14.4c-.3-.15-1.7-.85-2-1-.3-.1-.5-.15-.7.15-.2.3-.8 1-.95 1.2-.18.2-.35.22-.65.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.18-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.52-.08-.15-.7-1.7-.96-2.32-.25-.6-.5-.52-.7-.53-.18 0-.38-.02-.58-.02s-.52.08-.8.38c-.28.3-1.05 1.02-1.05 2.5s1.07 2.9 1.22 3.1c.15.2 2.12 3.22 5.12 4.52.72.3 1.28.5 1.72.63.72.22 1.38.2 1.9.12.58-.08 1.78-.73 2.03-1.43.25-.7.25-1.3.18-1.43-.08-.13-.28-.2-.58-.35z" fill="white"/>
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-10 h-10 mx-auto mb-4" fill="none">
    <circle cx="12" cy="12" r="12" fill="#5865F2"/>
    <path d="M17.27 7.4A14.9 14.9 0 0 0 14 6.5c-.14.25-.3.6-.4.86a13.8 13.8 0 0 0-3.2 0A9.3 9.3 0 0 0 10 6.5a14.9 14.9 0 0 0-3.28.9C5.02 10.03 4.6 12.6 4.8 15.13a14.9 14.9 0 0 0 4.55 2.3c.37-.5.7-1.03.98-1.6-.54-.2-1.05-.45-1.53-.74.13-.09.25-.19.37-.28a10.6 10.6 0 0 0 9.05 0c.12.1.24.2.37.28-.48.3-1 .54-1.53.74.28.57.61 1.1.98 1.6a14.8 14.8 0 0 0 4.54-2.3c.22-2.9-.37-5.44-1.8-7.73zM9.52 13.57c-.69 0-1.26-.63-1.26-1.4s.55-1.4 1.26-1.4c.7 0 1.27.63 1.26 1.4 0 .77-.56 1.4-1.26 1.4zm4.66 0c-.7 0-1.26-.63-1.26-1.4s.55-1.4 1.26-1.4c.7 0 1.27.63 1.26 1.4 0 .77-.56 1.4-1.26 1.4z" fill="white"/>
  </svg>
);

const channels = [
  {
    Icon: TelegramIcon,
    title: "Telegram",
    description: "Bots completos com mensagens, botões, enquetes, pagamentos e mais.",
  },
  {
    Icon: WhatsAppIcon,
    title: "WhatsApp",
    description: "WhatsApp Business Cloud API: mensagens, botões interativos e templates.",
  },
  {
    Icon: DiscordIcon,
    title: "Discord",
    description: "Slash commands, embeds, botões e interações no seu servidor.",
  },
];

const PlatformsSection = () => {
  return (
    <section id="platforms" className="py-24 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Uma Plataforma, <span className="text-gradient">3 Canais</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Mesmo editor, mesmo fluxo. Publique onde seu público está.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {channels.map((ch, i) => (
            <motion.div
              key={ch.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-xl p-8 text-center hover:border-primary/40 transition-all duration-300 hover:shadow-glow group"
            >
              <ch.Icon />
              <div className="flex items-center justify-center gap-2 mb-3">
                <h3 className="font-display text-xl font-bold text-foreground">{ch.title}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{ch.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Editor Visual <span className="text-gradient">Intuitivo</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Arraste, solte e conecte blocos — sem código, sem complicação.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="absolute -inset-4 rounded-2xl bg-primary/10 blur-3xl" />
          <img
            src={heroDashboard}
            alt="FlowBot Editor Visual - Interface de criação de bots multiplataforma"
            className="relative rounded-xl border border-glow shadow-card w-full"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default PlatformsSection;
