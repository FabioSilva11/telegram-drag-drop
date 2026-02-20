import { ArrowRight, Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const CTASection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    if (user) navigate('/dashboard');
    else navigate('/auth');
  };

  return (
    <>
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <div className="relative rounded-2xl glass p-12 md:p-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-glow" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

            <div className="relative z-10">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Automatize <span className="text-gradient">Telegram, WhatsApp e Discord</span> — Tudo de Graça
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Comece agora com seu primeiro bot em qualquer plataforma.
              </p>
              <button
                onClick={handleCTA}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-primary px-8 py-3.5 text-base font-semibold text-primary-foreground shadow-glow transition-all hover:scale-105"
              >
                Criar Conta Grátis Agora
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <a href="#" className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
            <Bot className="h-6 w-6 text-primary" />
            FlowBot
          </a>
          <p className="text-xs text-muted-foreground">
            © 2026 FlowBot. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </>
  );
};

export default CTASection;
