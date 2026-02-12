import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getPlanByProductId, type PlanKey } from '@/lib/plans';
import { useAuth } from '@/contexts/AuthContext';

interface SubscriptionState {
  plan: PlanKey;
  subscribed: boolean;
  subscriptionEnd: string | null;
  loading: boolean;
  isAdmin: boolean;
}

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    plan: 'starter',
    subscribed: false,
    subscriptionEnd: null,
    loading: true,
    isAdmin: false,
  });

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setState({ plan: 'starter', subscribed: false, subscriptionEnd: null, loading: false, isAdmin: false });
      return;
    }

    try {
      // Check admin role
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      const isAdmin = !!roleData;

      if (isAdmin) {
        setState({
          plan: 'enterprise',
          subscribed: true,
          subscriptionEnd: null,
          loading: false,
          isAdmin: true,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;

      const plan = getPlanByProductId(data.product_id);
      setState({
        plan,
        subscribed: data.subscribed,
        subscriptionEnd: data.subscription_end,
        loading: false,
        isAdmin: false,
      });
    } catch {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [user]);

  useEffect(() => {
    checkSubscription();
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [checkSubscription]);

  return { ...state, refresh: checkSubscription };
}
