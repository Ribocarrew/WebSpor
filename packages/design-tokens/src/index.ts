export const colors = {
  brand: {
    teal: '#0F766E',
    amber: '#D97706',
  },
  surface: {
    canvas: '#F5F5F4',
    card: '#FFFFFF',
  },
  text: {
    primary: '#1E293B',
    secondary: '#475569',
    muted: '#64748B',
    inverse: '#FFFFFF',
    onAmber: '#1E293B', // Per design system: never white on amber (contrast requirement)
  },
  border: {
    default: '#E2E8F0',
    subtle: '#CBD5E1',
    strong: '#0F766E',
  },
  state: {
    error: '#DC2626',
    warning: '#D97706',
    success: '#0F766E',
  },
} as const;

export const fonts = {
  sans: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', ui-monospace, 'SF Mono', Consolas, monospace",
} as const;

export const spacing = {
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  6: '24px',
  8: '32px',
  12: '48px',
  16: '64px',
} as const;

export const radii = {
  card: '16px',
  input: '8px',
  badge: '999px',
} as const;
