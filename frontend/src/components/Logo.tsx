import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { useAppTheme } from '@/theme';

/** SlyderChat brand mark: a chat bubble with a forward "slide" chevron cut into it. */
export function Logo({ size = 96 }: { size?: number }) {
  const { colors } = useAppTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <Defs>
        <LinearGradient id="bg" x1="0" y1="0" x2="100" y2="100">
          <Stop offset="0" stopColor={colors.primaryFixed} />
          <Stop offset="1" stopColor={colors.primary} />
        </LinearGradient>
      </Defs>
      <Path
        d="M50 8C26.8 8 8 25.4 8 47c0 11.4 5.2 21.6 13.6 28.8L18 92l17.4-7.2c4.6 1.4 9.5 2.2 14.6 2.2 23.2 0 42-17.4 42-39S73.2 8 50 8Z"
        fill="url(#bg)"
      />
      <Path
        d="M40 34l16 14-16 14"
        stroke={colors.onPrimary}
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
