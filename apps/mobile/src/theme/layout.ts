import { useWindowDimensions } from 'react-native';
import { spacing } from './spacing';

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isSmall = width < 380;
  const contentPadding = isSmall ? spacing.lg : spacing.xl;
  const maxContentWidth = Math.min(width - contentPadding * 2, 520);

  return { width, height, isSmall, contentPadding, maxContentWidth };
}
