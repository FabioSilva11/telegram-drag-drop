export const PLANS = {
  starter: {
    name: 'Starter',
    price: 'Grátis',
    priceId: null,
    productId: null,
    maxBots: 1,
    features: ['Editor visual', '1 bot', 'Blocos básicos', 'Suporte comunidade'],
  },
  pro: {
    name: 'Pro',
    price: 'R$ 49/mês',
    priceId: 'price_1SzVwxKvkCUCDLj5ZIYXL6U6',
    productId: 'prod_TxQoP3fOGx10AH',
    maxBots: 5,
    features: ['Tudo do Starter', '5 bots', 'Todos os blocos', 'Telegram + WhatsApp + Discord', 'APIs externas & IA', 'Suporte prioritário'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 'R$ 149/mês',
    priceId: 'price_1SzVxAKvkCUCDLj5GM467AeX',
    productId: 'prod_TxQoQZOZqdtyug',
    maxBots: 11,
    features: ['Tudo do Pro', '11 bots', 'White-label', 'Webhooks avançados', 'Telegram + WhatsApp + Discord', 'Suporte dedicado'],
  },
} as const;

export type PlanKey = keyof typeof PLANS;

export function getPlanByProductId(productId: string | null): PlanKey {
  if (productId === PLANS.enterprise.productId) return 'enterprise';
  if (productId === PLANS.pro.productId) return 'pro';
  return 'starter';
}

export function getPlanLimits(plan: PlanKey) {
  return PLANS[plan];
}
