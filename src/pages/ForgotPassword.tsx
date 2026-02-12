import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      toast.error('Erro ao enviar email de recuperação');
    } else {
      setSent(true);
      toast.success('Email de recuperação enviado!');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Recuperar Senha</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Insira seu email para receber o link de redefinição
          </p>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              Enviamos um link de redefinição para <strong className="text-foreground">{email}</strong>. Verifique sua caixa de entrada e spam.
            </p>
            <Link to="/auth">
              <Button variant="outline" className="w-full gap-2 mt-2">
                <ArrowLeft className="h-4 w-4" /> Voltar ao Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-border bg-secondary"
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-primary text-primary-foreground">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar Link de Recuperação'}
            </Button>
            <Link to="/auth" className="block">
              <Button variant="ghost" type="button" className="w-full gap-2 text-muted-foreground hover:text-primary">
                <ArrowLeft className="h-4 w-4" /> Voltar ao Login
              </Button>
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
