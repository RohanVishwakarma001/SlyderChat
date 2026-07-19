import type { TextStyle } from 'react-native';

/** iOS-standard type scale from DESIGN.md, translated to React Native TextStyle values. */
export const typography = {
  largeTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 41,
    letterSpacing: 0.37,
  },
  headline: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  subheadline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  caption: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0,
  },
  labelBold: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    letterSpacing: -0.08,
  },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
