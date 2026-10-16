/** Blite design tokens — mirrors ../assets/css/blite.css (the website). */
export const C = {
  red: '#F5223A',
  redDark: '#D3122A',
  redSoft: '#FFE3E6',
  orange: '#FF9F0A',
  orangeSoft: '#FFF1DB',
  blush: '#FFF3F3',
  bg: '#FFFDFC',
  cream: '#FBF6F1',
  surface: '#FFFFFF',
  dark: '#191919',
  body: '#4B4B4B',
  muted: '#858585',
  border: '#EAE4E0',
  green: '#1F9D55',
  greenSoft: '#E3F6EA',
} as const;

export const F = {
  display: 'Fraunces_700Bold',
  displayItalic: 'Fraunces_600SemiBold_Italic',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const R = { card: 20, cat: 24, btn: 12, input: 12, img: 16, pill: 999 } as const;

export const shadow = {
  sm: { shadowColor: '#191919', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  md: { shadowColor: '#191919', shadowOpacity: 0.1, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 6 },
  red: { shadowColor: '#F5223A', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
} as const;

const gbp = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' });
export const money = (n: number) => gbp.format(n || 0);
