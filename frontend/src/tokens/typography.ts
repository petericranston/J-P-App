import type { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  display: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 40,
    letterSpacing: -1,
  },
  h1: {
    fontFamily: 'Syne_800ExtraBold',
    fontSize: 28,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: 'Syne_700Bold',
    fontSize: 22,
    letterSpacing: -0.3,
  },
  h3: {
    fontFamily: 'Syne_700Bold',
    fontSize: 18,
  },
  title: {
    fontFamily: 'Syne_700Bold',
    fontSize: 15,
  },
  bodyLg: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 16,
    lineHeight: 26,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  bodySm: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  eyebrow: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: 'DMSans_300Light',
    fontSize: 11,
  },
  button: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
  },
};
