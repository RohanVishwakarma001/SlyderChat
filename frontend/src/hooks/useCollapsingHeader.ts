import { useSharedValue, useAnimatedScrollHandler } from 'react-native-reanimated';

/** Drives the large-title -> compact-title header transition shared across tab roots. */
export function useCollapsingHeader() {
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  return { scrollY, onScroll };
}
