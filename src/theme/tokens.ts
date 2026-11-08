import { Platform, type TextStyle } from 'react-native';

// Neutrals and blue follow Wikimedia Codex. Blue is the only brand accent; success and
// danger are status colors and never decorate.
export const color = {
  paper: '#F8F7F4',
  paperGrid: 'rgba(32, 33, 34, 0.045)',
  surface: '#FFFFFF',
  surfaceSunken: '#F0EFEA',
  ink: '#202122',
  inkSubtle: '#54595D',
  inkMuted: '#6A6F74',
  border: '#EAECF0',
  borderStrong: '#C8CCD1',

  primary: '#3366CC',
  primaryDeep: '#233566',
  primaryTint: '#EAF0FB',

  success: '#14866D',
  successInk: '#0E6B56',
  successTint: '#E3F3EE',
  warning: '#A0520A',
  warningTint: '#FCEEDF',
  danger: '#BF3C2C',
  dangerTint: '#FBE9E7',
} as const;

export const radius = { sm: 10, md: 16, lg: 24, xl: 32, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const font = {
  serif: 'SourceSerif4_600SemiBold',
  serifBold: 'SourceSerif4_700Bold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemi: 'Inter_600SemiBold',
} as const;

const tabular: TextStyle = { fontVariant: ['tabular-nums'] };
const balance: TextStyle = Platform.OS === 'web' ? ({ textWrap: 'balance' } as TextStyle) : {};
const pretty: TextStyle = Platform.OS === 'web' ? ({ textWrap: 'pretty' } as TextStyle) : {};

export const type = {
  display: { fontFamily: font.serif, fontSize: 34, lineHeight: 42, letterSpacing: -0.5, color: color.ink, ...balance },
  title: { fontFamily: font.serifBold, fontSize: 28, lineHeight: 34, letterSpacing: -0.4, color: color.ink, ...balance },
  name: { fontFamily: font.serifBold, fontSize: 20, lineHeight: 26, letterSpacing: -0.2, color: color.ink, ...balance },
  support: { fontFamily: font.serif, fontSize: 20, lineHeight: 26, color: color.inkSubtle, ...balance },
  score: { fontFamily: font.serifBold, fontSize: 56, lineHeight: 64, letterSpacing: -1.2, color: color.ink, ...tabular },
  figure: { fontFamily: font.serifBold, fontSize: 24, lineHeight: 30, color: color.ink, ...tabular },
  body: { fontFamily: font.sans, fontSize: 16, lineHeight: 24, color: color.ink, ...pretty },
  label: { fontFamily: font.sansSemi, fontSize: 16, lineHeight: 22, color: color.ink },
  data: { fontFamily: font.sansSemi, fontSize: 16, lineHeight: 22, color: color.ink, ...tabular },
  meta: { fontFamily: font.sansMedium, fontSize: 13, lineHeight: 18, color: color.inkSubtle },
} satisfies Record<string, TextStyle>;

export const spring = {
  snappy: { damping: 20, stiffness: 260, mass: 0.8 },
  gentle: { damping: 18, stiffness: 140, mass: 1 },
  needle: { damping: 16, stiffness: 320, mass: 0.6 },
  sweep: { damping: 14, stiffness: 90, mass: 1 },
} as const;

/** Cards are flat: a 1px border carries the edge. */
export const shadow = {};

/** Only for chrome that floats over scrolling content. */
export const lift = Platform.select({
  web: { boxShadow: '0 4px 16px rgba(32,33,34,0.06)' } as object,
  default: {
    shadowColor: '#202122',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
});

export const MAX_WIDTH = 440;
